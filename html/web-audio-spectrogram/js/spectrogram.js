/** @license 
  * Copyright 2023 Google LLC.
  * SPDX-License-Identifier: Apache-2.0 
  * 
  * Based on swissgl spectrogram example, modified by Joren Six.
  */

// Example of streaming spectrogram data from WebAudio to WebGL2
class Spectrogram {
    constructor(glsl,midiKeyStart,midiKeyStop) {
        navigator.mediaDevices.getUserMedia({audio: true}).then(stream=>{

            this.midiKeyStart = midiKeyStart;
            this.midiKeyStop = midiKeyStop;
            this.midiKeyRange = this.midiKeyStop - this.midiKeyStart;

            this.transformedFrequencyArray = new Uint8Array(this.midiKeyRange);

            this.audioCtx = new AudioContext();
            this.input = this.audioCtx.createMediaStreamSource(stream);
            this.analyser = this.audioCtx.createAnalyser();
            this.analyser.fftSize = 4096;
            this.analyser.smoothingTimeConstant = 0.75;
            this.frequencyArray = new Uint8Array(this.analyser.frequencyBinCount);
            this.input.connect(this.analyser);

            console.log('mic activated, frequencyBinCount:', this.analyser.frequencyBinCount);
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
        this.analyser.getByteFrequencyData(this.frequencyArray);

        let frequencyBinCount = this.analyser.frequencyBinCount;
        let frequencyBinSizeInHz = this.audioCtx.sampleRate / this.analyser.frequencyBinCount / 2 ;
        //var nrOfBins = 0;
        /*
        for(var i = 0 ; i < this.frequencyArray.length ; i++){
            let centerFrequencyInHz = i * frequencyBinSizeInHz + frequencyBinSizeInHz/2.0;
            let centerFrequencyInMidi = this.hzToMidiKey(centerFrequencyInHz);
            if(centerFrequencyInMidi >= this.midiKeyStart && centerFrequencyInMidi <= this.midiKeyStop){
                nrOfBins = nrOfBins + 1;
            }
        }*/

        for(var midiKey =  Math.round(this.midiKeyStart) ; midiKey < this.midiKeyStop; midiKey++){
            let index = Math.round(midiKey - this.midiKeyStart);
            let value = this.frequencyArray[this.midiKeyToBinIndex(midiKey)];
            this.transformedFrequencyArray[index] = value;
        }
    }


    frame(glsl) {
        if (!this.analyser) return;

        this.transformFrequencyData();

        const n = this.transformedFrequencyArray.length;
        const spectro = glsl({size:[n, 1], format:'r8', data:this.transformedFrequencyArray, tag:'spectro'});
        const history = glsl({spectro}, 'I.y>0 ? Src(I-ivec2(0,1)) : spectro(ivec2(I.x,0))',
                             {size:[n,2048], story:2, wrap:'mirror'});
        glsl({history:history[0], Mesh:history[0].size, DepthTest:0, Perspective:0.0, Aspect:'cover'}, `
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
            vec3 mincolor = vec3(0.95, 0.95, 0.95);
            vec3 maxcolor = vec3(0.1, 0.1, 0.1);
            float magnitudeValue = z * 2.0;

            //lineair interpolation between two values
            //https://docs.gl/sl4/mix

            vec3 c = mix(mincolor, maxcolor, magnitudeValue);
            out0 = vec4(c, 2.0);
        }`);
    }

    free() {
        if (!this.input) return;
        this.input.mediaStream.getTracks().forEach(tr=>tr.stop());
        this.audioCtx.close();
    }
}
