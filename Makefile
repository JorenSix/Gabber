
#https://timdaub.github.io/2021/02/25/emscripten-wasm/

emcc:
	em++ -std=c++11  \
	  -s SINGLE_FILE=1 \
	  -s ASSERTIONS=1 \
	  -s BINARYEN_ASYNC_COMPILATION=0 \
	  -s MODULARIZE=1 \
	  -s ENVIRONMENT=shell \
	  --bind \
	  -s EXPORTED_FUNCTIONS='["_initialize","_release","_transform","_bandcenters","_main","_malloc","_free"]' \
	  -s ALLOW_MEMORY_GROWTH=1 \
	  -s EXPORTED_RUNTIME_METHODS='["ccall","cwrap"]' \
	  -I. \
	  -O1 \
	  -ffast-math  \
	  gabber_wasm_bridge.cc \
	  -o html/js/gabber-bridge.js
	cat  html/js/gabber-bridge.js html/js/gabber-processor.js > html/js/gabber-bridge-processor.js

compile:
	mkdir -p bin
	c++ -std=c++11 -I. -O3 -ffast-math  gabber_wasm_bridge.cc  -o bin/wasm

clean:
	rm bin/*
	rm html/js/gabber_wasm_bridge.*
	

