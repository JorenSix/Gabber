
class GabberProcessor extends AudioWorkletProcessor {

	static get parameterDescriptors() {
		return [
		{ name: 'bands_per_octave', defaultValue: 36 },
		{ name: 'sample_rate', defaultValue: 48000 },
		{ name: 'ff_min', defaultValue: 110 },
		{ name: 'ff_max', defaultValue: 8000},
		{ name: 'ff_ref', defaultValue: 440 },
		{ name: 'overlap', defaultValue: 0 }
		];
	}
	
	constructor(options){
		super(options);

		this.gabber = Module();

		this.transform = this.gabber.cwrap("transform", "number", ["number","number"]);
		this.bandcenters = this.gabber.cwrap("bandcenters", "number", ["number","number"]);

		this.initialize = this.gabber.cwrap("initialize", "number", ["number","number","number","number","number","number"]);
		
		this.release = this.gabber.cwrap("release", "number", []);
		//console.log(Module);
		//
		var bands_per_octave = options.parameterData.bands_per_octave;

		var sample_rate = options.parameterData.sample_rate;
		var overlap = options.parameterData.overlap;
		
		var ff_min = options.parameterData.ff_min;
		var ff_max = options.parameterData.ff_max;
		var ff_ref = options.parameterData.ff_ref;

		this.initialize(sample_rate, bands_per_octave, ff_min , ff_ref, ff_max, overlap)

		this.counter = 0;

		var max_bands = 50*7*2*2;

		// Get data byte size, allocate memory on Emscripten heap, and get pointer
		var input_bands_bytes =  max_bands * 4;
		var input_bands_ptr = this.gabber._malloc(input_bands_bytes*6);

		var band_center_heap = new Float32Array(this.gabber.HEAPF32.buffer, input_bands_ptr, input_bands_bytes );
		//band_center_heap.set(new Float32Array(audioInputBuffer.buffer));

		var max_band_index = this.bandcenters(band_center_heap.byteOffset,max_bands);

		this.bin_centers=[];

		this.sendBinCenters=false;

		for( var i = 0 ; i < max_band_index ; i++){
			console.log("Band index", i," frequency " , band_center_heap[i], "Hz");
			this.bin_centers[i]=band_center_heap[i];
      		if(band_center_heap[i] >= ff_max ){
        		this.ff_max_index = i;
      		}
		}


		this.ff_min_index = max_band_index - 1;
		console.log("Min band index", this.ff_min_index,", max band index" , this.ff_max_index);
		this.gabber._free(band_center_heap.byteOffset);

		this.inputAudioBytes = 128 * 4 * 1000;
    	this.inputAudioPtr = this.gabber._malloc(this.inputAudioBytes);
	}

	process(inputs,outputs,parameters){
		//mono first channel
		var audioInputBuffer = inputs[0][0];

		//send the bin center info on the first buffer.
		if(!this.sendBinCenters){
			this.port.postMessage({'ff_max_index': this.ff_max_index, 
        'ff_min_index': this.ff_min_index,
        'bin_centers' : this.bin_centers});
		
			this.sendBinCenters = true;
		}

		// Get data byte size, allocate memory on Emscripten heap, and get pointer
		
		// Copy data to Emscripten heap (directly accessed from this.gabber.HEAPU8)
		var audioHeap = new Uint8Array(this.gabber.HEAPU8.buffer, this.inputAudioPtr, this.inputAudioBytes );
		audioHeap.set(new Uint8Array(audioInputBuffer.buffer));

		var max_bin_index = this.transform(audioHeap.byteOffset,audioInputBuffer.length);

		if(max_bin_index!=0){
			//Retrieve the frequency domain data
			var frequencyData = new Float32Array(this.gabber.HEAPF32.buffer, this.inputAudioPtr, this.inputAudioBytes/4);

			var maxBand = 1;
			var maxValue = 0;

      		var coefficents = []
			for( var i = 0 ; i < max_bin_index ; i+=3){
			  var t  = ~~frequencyData[i+0]; //time in audio samples
			  var fi = ~~frequencyData[i+1]; //Frequency band 
			  var m  =   frequencyData[i+2] // magnitude value

        	  var f = this.bin_centers[fi] //frequency in Hz
			  var fin = (this.ff_min_index - this.ff_max_index) - (fi - this.ff_max_index);

			  if(m!=0)
			  coefficents.push([t,fi,m,f,fin]);
			}
			this.port.postMessage(coefficents);
		}

		//this.gabber._free(audioHeap.byteOffset);

		return true;
	}
}


registerProcessor('gabber-processor', GabberProcessor);
