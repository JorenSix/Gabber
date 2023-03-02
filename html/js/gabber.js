
// Example of streaming spectrogram data from WebAudio to WebGL2
class Gabber {
    constructor(midiKeyStart,midiKeyStop,bandsPerOctave) {
        navigator.mediaDevices.getUserMedia({audio: true}).then(stream => {

          this.audioContext = new AudioContext();

          this.midiKeyStart = midiKeyStart;
          this.midiKeyStop = midiKeyStop;
          this.midiKeyRange = this.midiKeyStop - this.midiKeyStart;

          console.log("Midi key start ",this.midiKeyStart," midi key stop ",this.midiKeyStop);

          this.magInfo = new Map();

          this.max_t_index = -100000;
          
          this.audioContext.audioWorklet.addModule('js/gabber-bridge-processor.js').then(() => {

            // After the resolution of module loading, an AudioWorkletNode can be
            // constructed.
            let GabberWorkletNode = new AudioWorkletNode(this.audioContext, 'gabber-processor', {
              parameterData: {
                bands_per_octave: Math.floor(bandsPerOctave),
                sample_rate: this.audioContext.sampleRate,
                ff_min: this.midiKeyToHz(midiKeyStart),
                ff_max: this.midiKeyToHz(midiKeyStop),
                ff_ref: 440,
                overlap:0}
            });

            GabberWorkletNode.port.onmessage = (event) => {
              let data = event.data;

              if(Array.isArray(data)){
                //this is the coefficient data,
                //each element contains an array with
                for(var i = 0 ; i < data.length ; i++ ){
                    let t_in_samples = data[i][0];
                    let t_in_blocks = Math.floor(t_in_samples/1024);
                    if(t_in_blocks > this.max_t_index){
                      this.max_t_index = t_in_blocks;
                    }
                    if(!this.magInfo.has(t_in_blocks)){

                      let array = new Array(this.ff_min_index - this.ff_max_index);
                      array.fill(0.0);
                      this.magInfo.set(t_in_blocks,array);
                    }

                    let f_index = data[i][4];
                    this.magInfo.get(t_in_blocks)[f_index] += data[i][2];             
                }

                while(this.magInfo.size > 100){
                  this.magInfo.delete(this.magInfo.keys().next().value)
                }

                console.log("Received", data.length,"coefficents at",this.max_t_index);
                //console.log(data[data.length-1]);
                this.new_data = true;
              } else if (data['bin_centers']){
                this.bin_centers = data['bin_centers'];
                this.ff_max_index = data['ff_max_index'];
                this.ff_min_index = data['ff_min_index'];
              } else {
                console.error("Unknown message type",data);
              }
             
            };
            this.max_mag = 0.00000000001;

            this.microphone = this.audioContext.createMediaStreamSource(stream);
            this.microphone.connect(GabberWorkletNode);
            GabberWorkletNode.connect(this.audioContext.destination);

        });

      }).catch(e=>console.error('Error getting microphone:', e));
    }


    midiKeyToHz(midiKey){
        return 440.0 * Math.pow(2,(midiKey-69)/12)
    }

    hzToMidiKey(frequencyInHz){
        return 69 + 12 * this.logBase(frequencyInHz/440.0,2);
    }

    logBase(val, base) {
        return Math.log(val) / Math.log(base);
    }

    midiKeyToBinIndex(midiKey){
        let frequencyBinSizeInHz = this.audioCtx.sampleRate / this.analyser.frequencyBinCount / 2 ;
        let freqInHz = this.midiKeyToHz(midiKey);
        //let frequencyBinSizeInHz = this.audioCtx.sampleRate / this.analyser.frequencyBinCount / 2 ;
        return Math.round( (freqInHz - frequencyBinSizeInHz/2.0) / frequencyBinSizeInHz)
    }


    transformFrequencyData(){
      if (!this.bin_centers) return;
      
      if (!this.new_data) return;
      this.new_data = false;

      if( !this.transformedFrequencyArray )
        this.transformedFrequencyArray = new Uint8Array(this.ff_min_index - this.ff_max_index);

      let t_index = this.max_t_index - 3;
      this.max_mag = this.max_mag * 0.93;
      if(this.magInfo.has(t_index)){

        let data = this.magInfo.get(t_index);

        for(var i = 0 ; i < data.length ; i++){
          //take the log of the magnitude for better visualization
          //let mag = Math.log(data[i] + 1.000000000001)/Math.log(1.000000000001);
          let mag = data[i] + 0.000000000001;
          if(mag > this.max_mag){
            this.max_mag = mag;
          }
          let scaled_mag = Math.floor(mag / this.max_mag * 255);
          
          //console.log(mag_data);
          this.transformedFrequencyArray[i] = scaled_mag;
        }
      }

    }


    frame(glsl,perspective) {
        if (!this.microphone) return;

        //console.log(this.max_t_index);
        this.transformFrequencyData();

        if (!this.transformedFrequencyArray) return;

        const n = this.transformedFrequencyArray.length;
        const spectro = glsl({size:[n, 1], format:'r8', data:this.transformedFrequencyArray, tag:'spectro'});
        const history = glsl({spectro}, 'I.y>0 ? Src(I-ivec2(0,1)) : spectro(ivec2(I.x,0))',
                             {size:[n,400], story:2, wrap:'mirror'});
        glsl({history:history[0], Mesh:history[0].size, DepthTest:2, Perspective:perspective, Aspect:'cover'}, `
        varying float z;

        //VERT
        vec4 vertex() {
            z = history(UV).r;

            //flip x and y axis to go from left to right
            float x = UV.y * 2.0 - 1.0;
            float y = UV.x * 2.0 - 1.0;

            float z_val = (z - 0.5) * 0.5;
            float alpha = 1.0;

            vec4 pos = vec4(x , y , z_val , alpha);

            return pos;
        }

        //FRAG
        void fragment() {
            vec3 mincolor = vec3(1.0, 1.0, 1.0);
            vec3 maxcolor = vec3(0.1, 0.1, 0.1);
            float magnitudeValue = z * 2.0;

            //lineair interpolation between two values
            //https://docs.gl/sl4/mix

            vec3 c = mix(mincolor, maxcolor, magnitudeValue);
            out0 = vec4(c, 2.0);
        }`);
        
    }

    free() {
        if (!this.microphone) return;
        this.microphone.mediaStream.getTracks().forEach(tr=>tr.stop());
        this.audioContext.close();
    }
}
