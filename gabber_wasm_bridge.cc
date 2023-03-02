#include "gaborator/gaborator.h"

#include <iostream>

extern "C" {
	gaborator::parameters* paramsRef;
	gaborator::analyzer<float>* analyzerRef;
	gaborator::coefs<float>* coefsRef;
	
	int64_t t_in;
	int min_band;
	int max_band;
	int sample_rate;
	int64_t anal_support;
	int audio_block_index = 0;

	std::vector<float> * buf;
	const size_t full_audio_block_size = 2048;

	int initialize(double fs, int bands_per_octave, double ff_min , double ff_ref, double ff_max, double overlap){
		
		paramsRef = new gaborator::parameters(bands_per_octave, ff_min /  fs, ff_ref / fs);
		analyzerRef = new gaborator::analyzer<float>(*(paramsRef));
		coefsRef = new gaborator::coefs<float>(*(analyzerRef));

		buf = new std::vector<float>();

		//converts frequency (ff_max) in hertz to the number of bands above the min frequency
		//the ceil is used to end up at a full band 

		int interesting_bands = ceil(bands_per_octave * log(ff_max/ff_min)/log(2.0f));

		//since bands are ordered from high to low we are only interested in lower bands:
		//fs/2.0 is the nyquist frequency
		int total_bands = ceil(bands_per_octave * log(fs/2.0/ff_min)/log(2.0f));
		max_band = total_bands -1;

		anal_support = (int64_t) ceil(analyzerRef->analysis_support());
		min_band = total_bands - interesting_bands - 1;

		std::cout << "Gabber: Initialize" <<
			"\n\tsample rate: "  << fs << "Hz" <<
			"\n\tbands_per_octave: " << bands_per_octave << 
			"\n\tF min:" << ff_min <<"Hz" <<
			"\n\tF ref:" << ff_ref <<"Hz" <<
			"\n\tF max:" << ff_max <<"Hz" << 
			"\n\tTotal bands (#):" << total_bands << 
			"\n\tBands of interest (#):" << interesting_bands << 
			"\n\tBand min (#):" << min_band <<
			"\n\tBand max (#):" << max_band <<
			"\n\tbandpass bands end (#):" << analyzerRef->bandpass_bands_end() <<
			"\n\tbandpass bands begin (#):" << analyzerRef->bandpass_bands_begin() <<
			"\n\tAnalysis delay (samples):" << anal_support <<
			"\n\tAnalysis delay (s):" << anal_support / fs << "\n";

		sample_rate = (int) fs;
		t_in = 0;

		return (int) anal_support;
	}

	int bandcenters(float* band_centers, int band_centers_size){
		int max_band = analyzerRef->bandpass_bands_end();
		for(int i = 0 ; i <= max_band ; i++){
			band_centers[i]=analyzerRef->band_ff(i) * sample_rate;
		}
		return max_band;
	}
	 

	int transform(float* audio_block, int audio_block_size){
		audio_block_index++;

		int output_index = 0;
		
		buf->insert(buf->end(), audio_block, audio_block+audio_block_size);

		//std::cout << "Gabber: audio block transform" << 
		//	"\n\tBlock size: "<< audio_block_size <<  
		//	"\n\tBuff size: "<< buf->size() <<
		//	"\n\tTime index: "  << t_in << "\n";

		if(buf->size() == full_audio_block_size){
			analyzerRef->analyze(buf->data(), t_in, t_in + full_audio_block_size, *(coefsRef));

			process(
				[&](int band, int64_t audioSampleIndex, std::complex<float> &coef) {
					
					if(band >= min_band && band <= max_band){
						audio_block[output_index] = (float) audioSampleIndex;
						output_index++;
						audio_block[output_index] = (float) band;
						output_index++;
						audio_block[output_index] = (float) std::abs(coef);
						output_index++;
					}
            	},
            	min_band, max_band,
            	t_in - (int)anal_support,
            	t_in - (int)anal_support + (int)full_audio_block_size,
            	*(coefsRef)
            );

			int64_t t_out = t_in - 2 * anal_support;
			forget_before(*analyzerRef, *coefsRef, t_out - full_audio_block_size );
			t_in += (int64_t) full_audio_block_size;
			
			buf->clear();

			//std::cout << "Processed full audio block of size: "  << full_audio_block_size << "\n";
		}

		/*
		if(output_index > 7){
			std::cout << "Output coefs (#): "  << output_index / 3 << "\n";
			for(size_t i = 0 ; i < 4 ; i+=3 ){
				std::cout << "\tt: " << audio_block[i] << 
				" f:"  << audio_block[i+1] << " m: " << audio_block[i+2] << "\n";
			}
		}
		*/
		//std::cout << "Gabber: audio block transform" << 
		//	"\n\tBlock size: "<< audio_block_size <<  
		//	"\n\tTime index: "  << st1 << "\n";
		
		return output_index;
	}

	int release(){

		std::cout << "Gabber: memory release"  << "\n";

		return 0;
	}


	int main(){
	    std::cout << "Gabber: WASM bridge loaded"  << "\n";
		return 0;
	}

}
