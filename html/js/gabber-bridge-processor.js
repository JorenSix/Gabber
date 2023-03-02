
var Module = (() => {
  var _scriptDir = typeof document !== 'undefined' && document.currentScript ? document.currentScript.src : undefined;
  
  return (
function(Module = {})  {

// include: shell.js
// The Module object: Our interface to the outside world. We import
// and export values on it. There are various ways Module can be used:
// 1. Not defined. We create it here
// 2. A function parameter, function(Module) { ..generated code.. }
// 3. pre-run appended it, var Module = {}; ..generated code..
// 4. External script tag defines var Module.
// We need to check if Module already exists (e.g. case 3 above).
// Substitution will be replaced with actual code on later stage of the build,
// this way Closure Compiler will not mangle it (e.g. case 4. above).
// Note that if you want to run closure, and also to use Module
// after the generated code, you will need to define   var Module = {};
// before the code. Then that object will be used in the code, and you
// can continue to use Module afterwards as well.
var Module = typeof Module != 'undefined' ? Module : {};

// Set up the promise that indicates the Module is initialized
var readyPromiseResolve, readyPromiseReject;
Module['ready'] = new Promise(function(resolve, reject) {
  readyPromiseResolve = resolve;
  readyPromiseReject = reject;
});
["_initialize","_release","_transform","_bandcenters","_main","_malloc","_free","___getTypeName","__embind_initialize_bindings","_fflush","onRuntimeInitialized"].forEach((prop) => {
  if (!Object.getOwnPropertyDescriptor(Module['ready'], prop)) {
    Object.defineProperty(Module['ready'], prop, {
      get: () => abort('You are getting ' + prop + ' on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'),
      set: () => abort('You are setting ' + prop + ' on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'),
    });
  }
});

// --pre-jses are emitted after the Module integration code, so that they can
// refer to Module (if they choose; they can also define Module)


// Sometimes an existing Module object exists with properties
// meant to overwrite the default module functionality. Here
// we collect those properties and reapply _after_ we configure
// the current environment's defaults to avoid having to be so
// defensive during initialization.
var moduleOverrides = Object.assign({}, Module);

var arguments_ = [];
var thisProgram = './this.program';
var quit_ = (status, toThrow) => {
  throw toThrow;
};

// Determine the runtime environment we are in. You can customize this by
// setting the ENVIRONMENT setting at compile time (see settings.js).

var ENVIRONMENT_IS_WEB = false;
var ENVIRONMENT_IS_WORKER = false;
var ENVIRONMENT_IS_NODE = false;
var ENVIRONMENT_IS_SHELL = true;

if (Module['ENVIRONMENT']) {
  throw new Error('Module.ENVIRONMENT has been deprecated. To force the environment, use the ENVIRONMENT compile-time option (for example, -sENVIRONMENT=web or -sENVIRONMENT=node)');
}

// `/` should be present at the end if `scriptDirectory` is not empty
var scriptDirectory = '';
function locateFile(path) {
  if (Module['locateFile']) {
    return Module['locateFile'](path, scriptDirectory);
  }
  return scriptDirectory + path;
}

// Hooks that are implemented differently in different runtime environments.
var read_,
    readAsync,
    readBinary,
    setWindowTitle;

// Normally we don't log exceptions but instead let them bubble out the top
// level where the embedding environment (e.g. the browser) can handle
// them.
// However under v8 and node we sometimes exit the process direcly in which case
// its up to use us to log the exception before exiting.
// If we fix https://github.com/emscripten-core/emscripten/issues/15080
// this may no longer be needed under node.
function logExceptionOnExit(e) {
  if (e instanceof ExitStatus) return;
  let toLog = e;
  if (e && typeof e == 'object' && e.stack) {
    toLog = [e, e.stack];
  }
  err('exiting due to exception: ' + toLog);
}

if (ENVIRONMENT_IS_SHELL) {

  if ((typeof process == 'object' && typeof require === 'function') || typeof window == 'object' || typeof importScripts == 'function') throw new Error('not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)');

  if (typeof read != 'undefined') {
    read_ = function shell_read(f) {
      const data = tryParseAsDataURI(f);
      if (data) {
        return intArrayToString(data);
      }
      return read(f);
    };
  }

  readBinary = function readBinary(f) {
    let data;
    data = tryParseAsDataURI(f);
    if (data) {
      return data;
    }
    if (typeof readbuffer == 'function') {
      return new Uint8Array(readbuffer(f));
    }
    data = read(f, 'binary');
    assert(typeof data == 'object');
    return data;
  };

  readAsync = function readAsync(f, onload, onerror) {
    setTimeout(() => onload(readBinary(f)), 0);
  };

  if (typeof clearTimeout == 'undefined') {
    globalThis.clearTimeout = (id) => {};
  }

  if (typeof scriptArgs != 'undefined') {
    arguments_ = scriptArgs;
  } else if (typeof arguments != 'undefined') {
    arguments_ = arguments;
  }

  if (typeof quit == 'function') {
    quit_ = (status, toThrow) => {
      logExceptionOnExit(toThrow);
      quit(status);
    };
  }

  if (typeof print != 'undefined') {
    // Prefer to use print/printErr where they exist, as they usually work better.
    if (typeof console == 'undefined') console = /** @type{!Console} */({});
    console.log = /** @type{!function(this:Console, ...*): undefined} */ (print);
    console.warn = console.error = /** @type{!function(this:Console, ...*): undefined} */ (typeof printErr != 'undefined' ? printErr : print);
  }

} else

// Note that this includes Node.js workers when relevant (pthreads is enabled).
// Node.js workers are detected as a combination of ENVIRONMENT_IS_WORKER and
// ENVIRONMENT_IS_NODE.
{
  throw new Error('environment detection error');
}

var out = Module['print'] || console.log.bind(console);
var err = Module['printErr'] || console.warn.bind(console);

// Merge back in the overrides
Object.assign(Module, moduleOverrides);
// Free the object hierarchy contained in the overrides, this lets the GC
// reclaim data used e.g. in memoryInitializerRequest, which is a large typed array.
moduleOverrides = null;
checkIncomingModuleAPI();

// Emit code to handle expected values on the Module object. This applies Module.x
// to the proper local x. This has two benefits: first, we only emit it if it is
// expected to arrive, and second, by using a local everywhere else that can be
// minified.

if (Module['arguments']) arguments_ = Module['arguments'];legacyModuleProp('arguments', 'arguments_');

if (Module['thisProgram']) thisProgram = Module['thisProgram'];legacyModuleProp('thisProgram', 'thisProgram');

if (Module['quit']) quit_ = Module['quit'];legacyModuleProp('quit', 'quit_');

// perform assertions in shell.js after we set up out() and err(), as otherwise if an assertion fails it cannot print the message
// Assertions on removed incoming Module JS APIs.
assert(typeof Module['memoryInitializerPrefixURL'] == 'undefined', 'Module.memoryInitializerPrefixURL option was removed, use Module.locateFile instead');
assert(typeof Module['pthreadMainPrefixURL'] == 'undefined', 'Module.pthreadMainPrefixURL option was removed, use Module.locateFile instead');
assert(typeof Module['cdInitializerPrefixURL'] == 'undefined', 'Module.cdInitializerPrefixURL option was removed, use Module.locateFile instead');
assert(typeof Module['filePackagePrefixURL'] == 'undefined', 'Module.filePackagePrefixURL option was removed, use Module.locateFile instead');
assert(typeof Module['read'] == 'undefined', 'Module.read option was removed (modify read_ in JS)');
assert(typeof Module['readAsync'] == 'undefined', 'Module.readAsync option was removed (modify readAsync in JS)');
assert(typeof Module['readBinary'] == 'undefined', 'Module.readBinary option was removed (modify readBinary in JS)');
assert(typeof Module['setWindowTitle'] == 'undefined', 'Module.setWindowTitle option was removed (modify setWindowTitle in JS)');
assert(typeof Module['TOTAL_MEMORY'] == 'undefined', 'Module.TOTAL_MEMORY has been renamed Module.INITIAL_MEMORY');
legacyModuleProp('read', 'read_');
legacyModuleProp('readAsync', 'readAsync');
legacyModuleProp('readBinary', 'readBinary');
legacyModuleProp('setWindowTitle', 'setWindowTitle');
var IDBFS = 'IDBFS is no longer included by default; build with -lidbfs.js';
var PROXYFS = 'PROXYFS is no longer included by default; build with -lproxyfs.js';
var WORKERFS = 'WORKERFS is no longer included by default; build with -lworkerfs.js';
var NODEFS = 'NODEFS is no longer included by default; build with -lnodefs.js';

assert(!ENVIRONMENT_IS_WEB, "web environment detected but not enabled at build time.  Add 'web' to `-sENVIRONMENT` to enable.");

assert(!ENVIRONMENT_IS_WORKER, "worker environment detected but not enabled at build time.  Add 'worker' to `-sENVIRONMENT` to enable.");

assert(!ENVIRONMENT_IS_NODE, "node environment detected but not enabled at build time.  Add 'node' to `-sENVIRONMENT` to enable.");


// end include: shell.js
// include: preamble.js
// === Preamble library stuff ===

// Documentation for the public APIs defined in this file must be updated in:
//    site/source/docs/api_reference/preamble.js.rst
// A prebuilt local version of the documentation is available at:
//    site/build/text/docs/api_reference/preamble.js.txt
// You can also build docs locally as HTML or other formats in site/
// An online HTML version (which may be of a different version of Emscripten)
//    is up at http://kripken.github.io/emscripten-site/docs/api_reference/preamble.js.html

var wasmBinary;
if (Module['wasmBinary']) wasmBinary = Module['wasmBinary'];legacyModuleProp('wasmBinary', 'wasmBinary');
var noExitRuntime = Module['noExitRuntime'] || true;legacyModuleProp('noExitRuntime', 'noExitRuntime');

if (typeof WebAssembly != 'object') {
  abort('no native wasm support detected');
}

// Wasm globals

var wasmMemory;

//========================================
// Runtime essentials
//========================================

// whether we are quitting the application. no code should run after this.
// set in exit() and abort()
var ABORT = false;

// set by exit() and abort().  Passed to 'onExit' handler.
// NOTE: This is also used as the process return code code in shell environments
// but only when noExitRuntime is false.
var EXITSTATUS;

/** @type {function(*, string=)} */
function assert(condition, text) {
  if (!condition) {
    abort('Assertion failed' + (text ? ': ' + text : ''));
  }
}

// We used to include malloc/free by default in the past. Show a helpful error in
// builds with assertions.

// include: runtime_strings.js
// runtime_strings.js: String related runtime functions that are part of both
// MINIMAL_RUNTIME and regular runtime.

var UTF8Decoder = typeof TextDecoder != 'undefined' ? new TextDecoder('utf8') : undefined;

/**
 * Given a pointer 'idx' to a null-terminated UTF8-encoded string in the given
 * array that contains uint8 values, returns a copy of that string as a
 * Javascript String object.
 * heapOrArray is either a regular array, or a JavaScript typed array view.
 * @param {number} idx
 * @param {number=} maxBytesToRead
 * @return {string}
 */
function UTF8ArrayToString(heapOrArray, idx, maxBytesToRead) {
  var endIdx = idx + maxBytesToRead;
  var endPtr = idx;
  // TextDecoder needs to know the byte length in advance, it doesn't stop on
  // null terminator by itself.  Also, use the length info to avoid running tiny
  // strings through TextDecoder, since .subarray() allocates garbage.
  // (As a tiny code save trick, compare endPtr against endIdx using a negation,
  // so that undefined means Infinity)
  while (heapOrArray[endPtr] && !(endPtr >= endIdx)) ++endPtr;

  if (endPtr - idx > 16 && heapOrArray.buffer && UTF8Decoder) {
    return UTF8Decoder.decode(heapOrArray.subarray(idx, endPtr));
  }
  var str = '';
  // If building with TextDecoder, we have already computed the string length
  // above, so test loop end condition against that
  while (idx < endPtr) {
    // For UTF8 byte structure, see:
    // http://en.wikipedia.org/wiki/UTF-8#Description
    // https://www.ietf.org/rfc/rfc2279.txt
    // https://tools.ietf.org/html/rfc3629
    var u0 = heapOrArray[idx++];
    if (!(u0 & 0x80)) { str += String.fromCharCode(u0); continue; }
    var u1 = heapOrArray[idx++] & 63;
    if ((u0 & 0xE0) == 0xC0) { str += String.fromCharCode(((u0 & 31) << 6) | u1); continue; }
    var u2 = heapOrArray[idx++] & 63;
    if ((u0 & 0xF0) == 0xE0) {
      u0 = ((u0 & 15) << 12) | (u1 << 6) | u2;
    } else {
      if ((u0 & 0xF8) != 0xF0) warnOnce('Invalid UTF-8 leading byte ' + ptrToString(u0) + ' encountered when deserializing a UTF-8 string in wasm memory to a JS string!');
      u0 = ((u0 & 7) << 18) | (u1 << 12) | (u2 << 6) | (heapOrArray[idx++] & 63);
    }

    if (u0 < 0x10000) {
      str += String.fromCharCode(u0);
    } else {
      var ch = u0 - 0x10000;
      str += String.fromCharCode(0xD800 | (ch >> 10), 0xDC00 | (ch & 0x3FF));
    }
  }
  return str;
}

/**
 * Given a pointer 'ptr' to a null-terminated UTF8-encoded string in the
 * emscripten HEAP, returns a copy of that string as a Javascript String object.
 *
 * @param {number} ptr
 * @param {number=} maxBytesToRead - An optional length that specifies the
 *   maximum number of bytes to read. You can omit this parameter to scan the
 *   string until the first \0 byte. If maxBytesToRead is passed, and the string
 *   at [ptr, ptr+maxBytesToReadr[ contains a null byte in the middle, then the
 *   string will cut short at that byte index (i.e. maxBytesToRead will not
 *   produce a string of exact length [ptr, ptr+maxBytesToRead[) N.B. mixing
 *   frequent uses of UTF8ToString() with and without maxBytesToRead may throw
 *   JS JIT optimizations off, so it is worth to consider consistently using one
 * @return {string}
 */
function UTF8ToString(ptr, maxBytesToRead) {
  assert(typeof ptr == 'number');
  return ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : '';
}

/**
 * Copies the given Javascript String object 'str' to the given byte array at
 * address 'outIdx', encoded in UTF8 form and null-terminated. The copy will
 * require at most str.length*4+1 bytes of space in the HEAP.  Use the function
 * lengthBytesUTF8 to compute the exact number of bytes (excluding null
 * terminator) that this function will write.
 *
 * @param {string} str - The Javascript string to copy.
 * @param {ArrayBufferView|Array<number>} heap - The array to copy to. Each
 *                                               index in this array is assumed
 *                                               to be one 8-byte element.
 * @param {number} outIdx - The starting offset in the array to begin the copying.
 * @param {number} maxBytesToWrite - The maximum number of bytes this function
 *                                   can write to the array.  This count should
 *                                   include the null terminator, i.e. if
 *                                   maxBytesToWrite=1, only the null terminator
 *                                   will be written and nothing else.
 *                                   maxBytesToWrite=0 does not write any bytes
 *                                   to the output, not even the null
 *                                   terminator.
 * @return {number} The number of bytes written, EXCLUDING the null terminator.
 */
function stringToUTF8Array(str, heap, outIdx, maxBytesToWrite) {
  // Parameter maxBytesToWrite is not optional. Negative values, 0, null,
  // undefined and false each don't write out any bytes.
  if (!(maxBytesToWrite > 0))
    return 0;

  var startIdx = outIdx;
  var endIdx = outIdx + maxBytesToWrite - 1; // -1 for string null terminator.
  for (var i = 0; i < str.length; ++i) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code
    // unit, not a Unicode code point of the character! So decode
    // UTF16->UTF32->UTF8.
    // See http://unicode.org/faq/utf_bom.html#utf16-3
    // For UTF8 byte structure, see http://en.wikipedia.org/wiki/UTF-8#Description
    // and https://www.ietf.org/rfc/rfc2279.txt
    // and https://tools.ietf.org/html/rfc3629
    var u = str.charCodeAt(i); // possibly a lead surrogate
    if (u >= 0xD800 && u <= 0xDFFF) {
      var u1 = str.charCodeAt(++i);
      u = 0x10000 + ((u & 0x3FF) << 10) | (u1 & 0x3FF);
    }
    if (u <= 0x7F) {
      if (outIdx >= endIdx) break;
      heap[outIdx++] = u;
    } else if (u <= 0x7FF) {
      if (outIdx + 1 >= endIdx) break;
      heap[outIdx++] = 0xC0 | (u >> 6);
      heap[outIdx++] = 0x80 | (u & 63);
    } else if (u <= 0xFFFF) {
      if (outIdx + 2 >= endIdx) break;
      heap[outIdx++] = 0xE0 | (u >> 12);
      heap[outIdx++] = 0x80 | ((u >> 6) & 63);
      heap[outIdx++] = 0x80 | (u & 63);
    } else {
      if (outIdx + 3 >= endIdx) break;
      if (u > 0x10FFFF) warnOnce('Invalid Unicode code point ' + ptrToString(u) + ' encountered when serializing a JS string to a UTF-8 string in wasm memory! (Valid unicode code points should be in range 0-0x10FFFF).');
      heap[outIdx++] = 0xF0 | (u >> 18);
      heap[outIdx++] = 0x80 | ((u >> 12) & 63);
      heap[outIdx++] = 0x80 | ((u >> 6) & 63);
      heap[outIdx++] = 0x80 | (u & 63);
    }
  }
  // Null-terminate the pointer to the buffer.
  heap[outIdx] = 0;
  return outIdx - startIdx;
}

/**
 * Copies the given Javascript String object 'str' to the emscripten HEAP at
 * address 'outPtr', null-terminated and encoded in UTF8 form. The copy will
 * require at most str.length*4+1 bytes of space in the HEAP.
 * Use the function lengthBytesUTF8 to compute the exact number of bytes
 * (excluding null terminator) that this function will write.
 *
 * @return {number} The number of bytes written, EXCLUDING the null terminator.
 */
function stringToUTF8(str, outPtr, maxBytesToWrite) {
  assert(typeof maxBytesToWrite == 'number', 'stringToUTF8(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!');
  return stringToUTF8Array(str, HEAPU8,outPtr, maxBytesToWrite);
}

/**
 * Returns the number of bytes the given Javascript string takes if encoded as a
 * UTF8 byte array, EXCLUDING the null terminator byte.
 *
 * @param {string} str - JavaScript string to operator on
 * @return {number} Length, in bytes, of the UTF8 encoded string.
 */
function lengthBytesUTF8(str) {
  var len = 0;
  for (var i = 0; i < str.length; ++i) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code
    // unit, not a Unicode code point of the character! So decode
    // UTF16->UTF32->UTF8.
    // See http://unicode.org/faq/utf_bom.html#utf16-3
    var c = str.charCodeAt(i); // possibly a lead surrogate
    if (c <= 0x7F) {
      len++;
    } else if (c <= 0x7FF) {
      len += 2;
    } else if (c >= 0xD800 && c <= 0xDFFF) {
      len += 4; ++i;
    } else {
      len += 3;
    }
  }
  return len;
}

// end include: runtime_strings.js
// Memory management

var HEAP,
/** @type {!Int8Array} */
  HEAP8,
/** @type {!Uint8Array} */
  HEAPU8,
/** @type {!Int16Array} */
  HEAP16,
/** @type {!Uint16Array} */
  HEAPU16,
/** @type {!Int32Array} */
  HEAP32,
/** @type {!Uint32Array} */
  HEAPU32,
/** @type {!Float32Array} */
  HEAPF32,
/** @type {!Float64Array} */
  HEAPF64;

function updateMemoryViews() {
  var b = wasmMemory.buffer;
  Module['HEAP8'] = HEAP8 = new Int8Array(b);
  Module['HEAP16'] = HEAP16 = new Int16Array(b);
  Module['HEAP32'] = HEAP32 = new Int32Array(b);
  Module['HEAPU8'] = HEAPU8 = new Uint8Array(b);
  Module['HEAPU16'] = HEAPU16 = new Uint16Array(b);
  Module['HEAPU32'] = HEAPU32 = new Uint32Array(b);
  Module['HEAPF32'] = HEAPF32 = new Float32Array(b);
  Module['HEAPF64'] = HEAPF64 = new Float64Array(b);
}

assert(!Module['STACK_SIZE'], 'STACK_SIZE can no longer be set at runtime.  Use -sSTACK_SIZE at link time')

assert(typeof Int32Array != 'undefined' && typeof Float64Array !== 'undefined' && Int32Array.prototype.subarray != undefined && Int32Array.prototype.set != undefined,
       'JS engine does not provide full typed array support');

// If memory is defined in wasm, the user can't provide it, or set INITIAL_MEMORY
assert(!Module['wasmMemory'], 'Use of `wasmMemory` detected.  Use -sIMPORTED_MEMORY to define wasmMemory externally');
assert(!Module['INITIAL_MEMORY'], 'Detected runtime INITIAL_MEMORY setting.  Use -sIMPORTED_MEMORY to define wasmMemory dynamically');

// include: runtime_init_table.js
// In regular non-RELOCATABLE mode the table is exported
// from the wasm module and this will be assigned once
// the exports are available.
var wasmTable;

// end include: runtime_init_table.js
// include: runtime_stack_check.js
// Initializes the stack cookie. Called at the startup of main and at the startup of each thread in pthreads mode.
function writeStackCookie() {
  var max = _emscripten_stack_get_end();
  assert((max & 3) == 0);
  // If the stack ends at address zero we write our cookies 4 bytes into the
  // stack.  This prevents interference with the (separate) address-zero check
  // below.
  if (max == 0) {
    max += 4;
  }
  // The stack grow downwards towards _emscripten_stack_get_end.
  // We write cookies to the final two words in the stack and detect if they are
  // ever overwritten.
  HEAPU32[((max)>>2)] = 0x2135467;
  HEAPU32[(((max)+(4))>>2)] = 0x89BACDFE;
  // Also test the global address 0 for integrity.
  HEAPU32[0] = 0x63736d65; /* 'emsc' */
}

function checkStackCookie() {
  if (ABORT) return;
  var max = _emscripten_stack_get_end();
  // See writeStackCookie().
  if (max == 0) {
    max += 4;
  }
  var cookie1 = HEAPU32[((max)>>2)];
  var cookie2 = HEAPU32[(((max)+(4))>>2)];
  if (cookie1 != 0x2135467 || cookie2 != 0x89BACDFE) {
    abort('Stack overflow! Stack cookie has been overwritten at ' + ptrToString(max) + ', expected hex dwords 0x89BACDFE and 0x2135467, but received ' + ptrToString(cookie2) + ' ' + ptrToString(cookie1));
  }
  // Also test the global address 0 for integrity.
  if (HEAPU32[0] !== 0x63736d65 /* 'emsc' */) {
    abort('Runtime error: The application has corrupted its heap memory area (address zero)!');
  }
}

// end include: runtime_stack_check.js
// include: runtime_assertions.js
// Endianness check
(function() {
  var h16 = new Int16Array(1);
  var h8 = new Int8Array(h16.buffer);
  h16[0] = 0x6373;
  if (h8[0] !== 0x73 || h8[1] !== 0x63) throw 'Runtime error: expected the system to be little-endian! (Run with -sSUPPORT_BIG_ENDIAN to bypass)';
})();

// end include: runtime_assertions.js
var __ATPRERUN__  = []; // functions called before the runtime is initialized
var __ATINIT__    = []; // functions called during startup
var __ATMAIN__    = []; // functions called when main() is to be run
var __ATEXIT__    = []; // functions called during shutdown
var __ATPOSTRUN__ = []; // functions called after the main() is called

var runtimeInitialized = false;

function keepRuntimeAlive() {
  return noExitRuntime;
}

function preRun() {
  if (Module['preRun']) {
    if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
    while (Module['preRun'].length) {
      addOnPreRun(Module['preRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPRERUN__);
}

function initRuntime() {
  assert(!runtimeInitialized);
  runtimeInitialized = true;

  checkStackCookie();

  
if (!Module["noFSInit"] && !FS.init.initialized)
  FS.init();
FS.ignorePermissions = false;

TTY.init();
  callRuntimeCallbacks(__ATINIT__);
}

function preMain() {
  checkStackCookie();
  
  callRuntimeCallbacks(__ATMAIN__);
}

function postRun() {
  checkStackCookie();

  if (Module['postRun']) {
    if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
    while (Module['postRun'].length) {
      addOnPostRun(Module['postRun'].shift());
    }
  }

  callRuntimeCallbacks(__ATPOSTRUN__);
}

function addOnPreRun(cb) {
  __ATPRERUN__.unshift(cb);
}

function addOnInit(cb) {
  __ATINIT__.unshift(cb);
}

function addOnPreMain(cb) {
  __ATMAIN__.unshift(cb);
}

function addOnExit(cb) {
}

function addOnPostRun(cb) {
  __ATPOSTRUN__.unshift(cb);
}

// include: runtime_math.js
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/imul

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/fround

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/clz32

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/trunc

assert(Math.imul, 'This browser does not support Math.imul(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill');
assert(Math.fround, 'This browser does not support Math.fround(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill');
assert(Math.clz32, 'This browser does not support Math.clz32(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill');
assert(Math.trunc, 'This browser does not support Math.trunc(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill');

// end include: runtime_math.js
// A counter of dependencies for calling run(). If we need to
// do asynchronous work before running, increment this and
// decrement it. Incrementing must happen in a place like
// Module.preRun (used by emcc to add file preloading).
// Note that you can add dependencies in preRun, even though
// it happens right before run - run will be postponed until
// the dependencies are met.
var runDependencies = 0;
var runDependencyWatcher = null;
var dependenciesFulfilled = null; // overridden to take different actions when all run dependencies are fulfilled
var runDependencyTracking = {};

function getUniqueRunDependency(id) {
  var orig = id;
  while (1) {
    if (!runDependencyTracking[id]) return id;
    id = orig + Math.random();
  }
}

function addRunDependency(id) {
  runDependencies++;

  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }

  if (id) {
    assert(!runDependencyTracking[id]);
    runDependencyTracking[id] = 1;
    if (runDependencyWatcher === null && typeof setInterval != 'undefined') {
      // Check for missing dependencies every few seconds
      runDependencyWatcher = setInterval(function() {
        if (ABORT) {
          clearInterval(runDependencyWatcher);
          runDependencyWatcher = null;
          return;
        }
        var shown = false;
        for (var dep in runDependencyTracking) {
          if (!shown) {
            shown = true;
            err('still waiting on run dependencies:');
          }
          err('dependency: ' + dep);
        }
        if (shown) {
          err('(end of list)');
        }
      }, 10000);
    }
  } else {
    err('warning: run dependency added without ID');
  }
}

function removeRunDependency(id) {
  runDependencies--;

  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }

  if (id) {
    assert(runDependencyTracking[id]);
    delete runDependencyTracking[id];
  } else {
    err('warning: run dependency removed without ID');
  }
  if (runDependencies == 0) {
    if (runDependencyWatcher !== null) {
      clearInterval(runDependencyWatcher);
      runDependencyWatcher = null;
    }
    if (dependenciesFulfilled) {
      var callback = dependenciesFulfilled;
      dependenciesFulfilled = null;
      callback(); // can add another dependenciesFulfilled
    }
  }
}

/** @param {string|number=} what */
function abort(what) {
  if (Module['onAbort']) {
    Module['onAbort'](what);
  }

  what = 'Aborted(' + what + ')';
  // TODO(sbc): Should we remove printing and leave it up to whoever
  // catches the exception?
  err(what);

  ABORT = true;
  EXITSTATUS = 1;

  // Use a wasm runtime error, because a JS error might be seen as a foreign
  // exception, which means we'd run destructors on it. We need the error to
  // simply make the program stop.
  // FIXME This approach does not work in Wasm EH because it currently does not assume
  // all RuntimeErrors are from traps; it decides whether a RuntimeError is from
  // a trap or not based on a hidden field within the object. So at the moment
  // we don't have a way of throwing a wasm trap from JS. TODO Make a JS API that
  // allows this in the wasm spec.

  // Suppress closure compiler warning here. Closure compiler's builtin extern
  // defintion for WebAssembly.RuntimeError claims it takes no arguments even
  // though it can.
  // TODO(https://github.com/google/closure-compiler/pull/3913): Remove if/when upstream closure gets fixed.
  /** @suppress {checkTypes} */
  var e = new WebAssembly.RuntimeError(what);

  readyPromiseReject(e);
  // Throw the error whether or not MODULARIZE is set because abort is used
  // in code paths apart from instantiation where an exception is expected
  // to be thrown when abort is called.
  throw e;
}

// include: memoryprofiler.js
// end include: memoryprofiler.js
// include: URIUtils.js
// Prefix of data URIs emitted by SINGLE_FILE and related options.
var dataURIPrefix = 'data:application/octet-stream;base64,';

// Indicates whether filename is a base64 data URI.
function isDataURI(filename) {
  // Prefix of data URIs emitted by SINGLE_FILE and related options.
  return filename.startsWith(dataURIPrefix);
}

// Indicates whether filename is delivered via file protocol (as opposed to http/https)
function isFileURI(filename) {
  return filename.startsWith('file://');
}

// end include: URIUtils.js
/** @param {boolean=} fixedasm */
function createExportWrapper(name, fixedasm) {
  return function() {
    var displayName = name;
    var asm = fixedasm;
    if (!fixedasm) {
      asm = Module['asm'];
    }
    assert(runtimeInitialized, 'native function `' + displayName + '` called before runtime initialization');
    if (!asm[name]) {
      assert(asm[name], 'exported native function `' + displayName + '` not found');
    }
    return asm[name].apply(null, arguments);
  };
}

var wasmBinaryFile;
  wasmBinaryFile = 'data:application/octet-stream;base64,AGFzbQEAAAABp4WAgABXYAF/AX9gAn9/AX9gAn9/AGADf39/AX9gAX8AYAN/f38AYAZ/f39/f38Bf2AAAGAAAX9gBX9/f39/AX9gBn9/f39/fwBgBH9/f38AYAR/f39/AX9gCH9/f39/f39/AX9gBX9/f39/AGABfAF8YAd/f39/f39/AGAHf39/f39/fwF/YAV/f39/fgF/YAV/fn5+fgBgAAF+YAV/f39/fAF/YAN/fn8BfmABfAF/YAF9AX1gBH9/f38BfmAGf39/f35/AX9gCn9/f39/f39/f38AYAd/f39/f35+AX9gAn9+AX9gAX8BfGACfH8BfGAFf39+f38AYAR/fn5/AGAKf39/f39/f39/fwF/YAZ/f39/fn4Bf2AEf35+fwF/YAJ/fgBgAnx8AXxgAn98AXxgA3x+fgF8YAABfGABfABgAXwBfmAEfn5+fgF/YAR/f39+AX5gBn98f39/fwF/YAJ+fwF/YAN/f38BfmACf38BfWACf38BfGADf39/AX1gA39/fwF8YAx/f39/f39/f39/f38Bf2AGf39/f3x/AX9gB39/f39+fn8Bf2ALf39/f39/f39/f38Bf2APf39/f39/f39/f39/f39/AGAIf39/f39/f38AYAZ8f3x8fHwBf2AHf39+fn9/fwBgBH9/fn8AYAV/f3x/fwF/YAN/f3wBfGAIf39/f35+fH8AYAV/f35+fwBgAnx/AX9gA3x8fwF8YAJ9fQF9YAF/AX1gAn98AX9gAn99AGACf3wAYAJ+fgF/YAN/fn4AYAJ/fwF+YAJ+fgF9YAJ+fgF8YAN/f34AYAN+f38Bf2AGf39/fn9/AGAEf39+fwF+YAZ/f39/f34Bf2AIf39/f39/fn4Bf2AJf39/f39/f39/AX9gBX9/f35+AGAEf35/fwF/AuqEgIAAFQNlbnYNX19hc3NlcnRfZmFpbAALA2VudgtfX2N4YV90aHJvdwAFA2VudhVfZW1iaW5kX3JlZ2lzdGVyX3ZvaWQAAgNlbnYVX2VtYmluZF9yZWdpc3Rlcl9ib29sAA4DZW52GF9lbWJpbmRfcmVnaXN0ZXJfaW50ZWdlcgAOA2VudhZfZW1iaW5kX3JlZ2lzdGVyX2Zsb2F0AAUDZW52G19lbWJpbmRfcmVnaXN0ZXJfc3RkX3N0cmluZwACA2VudhxfZW1iaW5k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YWxsX2ppamkA+w0OZHluQ2FsbF9paWlpaWoA/A0PZHluQ2FsbF9paWlpaWpqAP0NEGR5bkNhbGxfaWlpaWlpamoA/g0J84WAgAABAEEBC/cC2Q0q4g1YsAGxAbMBtAG1AbcBuAG5AboBwQHDAcUBxgHHAckBywHKAcwB5QHnAeYB6AH7AfwB/gH/AYACgQKCAoMChAKJAosCjQKOAo8CkQKTApIClAKnAqkCqAKqAq4BrwH5AfoBuwO8A50BmwGZAcEDmgHCA9AD5wPpA+oD6wPtA+4D8wP0A/UD9gP3A/gD+QP7A/0D/gOBBIIEgwSFBIYEsATIBMkEzASMAZsHxgnOCcEKxArICssKzgrRCtMK1QrXCtkK2wrdCt8K4Qq2CboJygnhCeIJ4wnkCeUJ5gnnCegJ6QnqCb8I9Qn2CfkJ/An9CYAKgQqDCqwKrQqwCrIKtAq2CroKrgqvCrEKswq1CrcKuwroBMkJ0AnRCdIJ0wnUCdUJ1wnYCdoJ2wncCd0J3gnrCewJ7QnuCe8J8AnxCfIJhAqFCocKiQqKCosKjAqOCo8KkAqRCpIKkwqUCpUKlgqXCpgKmgqcCp0KngqfCqEKogqjCqQKpQqmCqcKqAqpCucE6QTqBOsE7gTvBPAE8QTyBPcE5Qr4BIUFjgWRBZQFlwWaBZ0FogWlBagF5gqvBbkFvgXABcIFxAXGBcgFzAXOBdAF5wrdBeUF6wXtBe8F8QX6BfwF6AqABokGjQaPBpEGkwaZBpsG6QrrCqQGpQamBqcGqQarBq4GvwrGCswK2greCtIK1grsCu4KvQa+Br8GxQbHBskGzAbCCskKzwrcCuAK1ArYCvAK7wrZBvIK8QrfBvMK5gbpBuoG6wbsBu0G7gbvBvAG9ArxBvIG8wb0BvUG9gb3BvgG+Qb1CvoG/Qb+Bv8GggeDB4QHhQeGB/YKhweIB4kHigeLB4wHjQeOB48H9wqaB7IH+ArZB+sH+QqXCKMI+gqkCLEI+wq5CLoIuwj8CrwIvQi+CPYM9wy7DbwNvw29Db4Nww3ADcYN1w3UDckNwQ3WDdMNyg3CDdUN0A3NDd0N3g3gDeEN2g3bDeYN5w3pDQqs2oqAAOwNEgAQ6w0QiAQQsgQQKRBZEMcDC5cJAwZ/BXwBfkHIABCADSIGQYECOwFAIAZCgICAgICAgPg/NwM4IAZC8dGN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IABEAAAAAAAAAAAQWyEDDAELAkAgAkGAgMD/B0kNACAAIAChIQMMAQsCQAJAAkACQCAAIAEQXUEDcQ4DAAECAwsgASsDACABKwMIEFshAwwDCyABKwMAIAErAwhBARBemiEDDAILIAErAwAgASsDCBBbmiEDDAELIAErAwAgASsDCEEBEF4hAwsgAUEQaiQAIAMLjgQBA38CQCACQYAESQ0AIAAgASACEAogAA8LIAAgAmohAwJAAkAgASAAc0EDcQ0AAkACQCAAQQNxDQAgACECDAELAkAgAg0AIAAhAgwBCyAAIQIDQCACIAEtAAA6AAAgAUEBaiEBIAJBAWoiAkEDcUUNASACIANJDQALCwJAIANBfHEiBEHAAEkNACACIARBQGoiBUsNAANAIAIgASgCADYCACACIAEoAgQ2AgQgAiABKAIINgIIIAIgASgCDDYCDCACIAEoAhA2AhAgAiABKAIUNgIUIAIgASgCGDYCGCACIAEoAhw2AhwgAiABKAIgNgIgIAIgASgCJDYCJCACIAEoAig2AiggAiABKAIsNgIsIAIgASgCMDYCMCACIAEoAjQ2AjQgAiABKAI4NgI4IAIgASgCPDYCPCABQcAAaiEBIAJBwABqIgIgBU0NAAsLIAIgBE8NAQNAIAIgASgCADYCACABQQRqIQEgAkEEaiICIARJDQAMAgsACwJAIANBBE8NACAAIQIMAQsCQCADQXxqIgQgAE8NACAAIQIMAQsgACECA0AgAiABLQAAOgAAIAIgAS0AAToAASACIAEtAAI6AAIgAiABLQADOgADIAFBBGohASACQQRqIgIgBE0NAAsLAkAgAiADTw0AA0AgAiABLQAAOgAAIAFBAWohASACQQFqIgIgA0cNAAsLIAAL9gIBAn8CQCAAIAFGDQACQCABIAAgAmoiA2tBACACQQF0a0sNACAAIAEgAhBgDwsgASAAc0EDcSEEAkACQAJAIAAgAU8NAAJAIARFDQAgACEDDAMLAkAgAEEDcQ0AIAAhAwwCCyAAIQMDQCACRQ0EIAMgAS0AADoAACABQQFqIQEgAkF/aiECIANBAWoiA0EDcUUNAgwACwALAkAgBA0AAkAgA0EDcUUNAANAIAJFDQUgACACQX9qIgJqIgMgASACai0AADoAACADQQNxDQALCyACQQNNDQADQCAAIAJBfGoi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AKIiBCADoCIARAAAAAAAAPA/Y0UNABByRAAAAAAAABAAohBzRAAAAAAAAAAAIABEAAAAAAAA8D+gIgUgBCADIAChoCAARAAAAAAAAPA/IAWhoKCgRAAAAAAAAPC/oCIAIABEAAAAAAAAAABhGyEACyAARAAAAAAAABAAogscAQF/IwBBEGsiAEKAgICAgICACDcDCCAAKwMICwwAIwBBEGsgADkDCAsFACAAmQsFACAAnAuxBAIEfgJ/AkACQCABvSICQgGGIgNQDQAgARB3IQQgAL0iBUI0iKdB/w9xIgZB/w9GDQAgBEL///////////8Ag0KBgICAgICA+P8AVA0BCyAAIAGiIgEgAaMPCwJAIAVCAYYiBCADVg0AIABEAAAAAAAAAACiIAAgBCADURsPCyACQjSIp0H/D3EhBwJAAkAgBg0AQQAhBgJAIAVCDIYiA0IAUw0AA0AgBkF/aiEGIANCAYYiA0J/VQ0ACwsgBUEBIAZrrYYhAwwBCyAFQv////////8Hg0KAgICAgICACIQhAwsCQAJAIAcNAEEAIQcCQCACQgyGIgRCAFMNAANAIAdBf2ohByAEQgGGIgRCf1UNAAsLIAJBASAHa62GIQIMAQsgAkL/////////B4NCgICAgICAgAiEIQILAkAgBiAHTA0AA0ACQCADIAJ9IgRCAFMNACAEIQMgBEIAUg0AIABEAAAAAAAAAACiDwsgA0IBhiEDIAZBf2oiBiAHSg0ACyAHIQYLAkAgAyACfSIEQgBTDQAgBCEDIARCAFINACAARAAAAAAAAAAAog8LAkACQCADQv////////8HWA0AIAMhBAwBCwNAIAZBf2ohBiADQoCAgICAgIAEVCEHIANCAYYiBCEDIAcNAAsLIAVCgICAgICAgICAf4MhAwJAAkAgBkEBSA0AIARCgICAgICAgHh8IAatQjSGhCEEDAELIARBASAGa62IIQQLIAQgA4S/CwUAIAC9C+kBAwN/AX0BfCAAvEH/////B3EiAiABvEH/////B3EiAyACIANJGyIEviEBAkAgBEGAgID8B0YNACACIAMgAiADSxsiAr4hAAJAAkAgAkH////7B0sNACAERQ0AIAIgBGtBgICA5ABJDQELIAAgAZIPCwJAAkAgAkGAgIDsBUkNACABQwAAgBKUIQEgAEMAAIASlCEAQwAAgGwhBQwBC0MAAIA/IQUgBEH///+LAksNACABQwAAgGyUIQEgAEMAAIBslCEAQwAAgBIhBQsgBSAAuyIGIAaiIAG7IgYgBqKgthCHAZQhAQsgAQsJACAAIAEQhQELIwBEAAAAAAAA8L9EAAAAAAAA8D8gABsQe0QAAAAAAAAAAKMLFQEBfyMAQRBrIgEgADkDCCABKwMICwwAIAAgAKEiACAAowu+BAMBfwJ+BnwgABB+IQECQCAAvSICQoCAgICAgICJQHxC//////+fwgFWDQACQCACQoCAgICAgID4P1INAEQAAAAAAAAAAA8LIABEAAAAAAAA8L+gIgAgACAARAAAAAAAAKBBoiIEoCAEoSIEIASiQQArA9hZIgWiIgagIgcgACAAIACiIgiiIgkgCSAJIAlBACsDqFqiIAhBACsDoFqiIABBACsDmFqiQQArA5BaoKCgoiAIQQArA4haoiAAQQArA4BaokEAKwP4WaCgoKIgCEEAKwPwWaIgAEEAKwPoWaJBACsD4FmgoKCiIAAgBKEgBaIgACAEoKIgBiAAIAehoKCgoA8LAkACQCABQZCAfmpBn4B+Sw0AAkAgAkL///////////8Ag0IAUg0AQQEQeg8LIAJCgICAgICAgPj/AFENAQJAAkAgAUGAgAJxDQAgAUHw/wFxQfD/AUcNAQsgABB8DwsgAEQAAAAAAAAwQ6K9QoCAgICAgIDgfHwhAgsgAkKAgICAgICAjUB8IgNCNIentyIIQQArA6BZoiADQi2Ip0H/AHFBBHQiAUG42gBqKwMAoCIJIAFBsNoAaisDACACIANCgICAgICAgHiDfb8gAUGw6gBqKwMAoSABQbjqAGorAwChoiIAoCIFIAAgACAAoiIEoiAEIABBACsD0FmiQQArA8hZoKIgAEEAKwPAWaJBACsDuFmgoKIgBEEAKwOwWaIgCEEAKwOoWaIgACAJIAWhoKCgoKAhAAsgAAsJACAAvUIwiKcL1QQDAX8Cfgd8IAAQgAEhAQJAIAC9IgJCgICAgJDq1ohAfEL/////n5WEAVYNAAJAIAJCgICAgICAgPg/Ug0ARAAAAAAAAAAADwtBACsDkEgiBCAARAAAAAAAAPC/oCIAvUKAgICAcIO/IgWiIgYgACAAoiIHIABBACsD2EiiQQArA9BIoKIiCKAiCSAHIAeiIgogCiAHIABBACsDmEmiQQArA5BJoKIgAEEAKwOISaJBACsDgEmgoKIgByAAQQArA/hIokEAKwPwSKCiIABBACsD6EiiQQArA+BIoKCgoiAAIAWhIASiIABBACsDmEiioCAIIAYgCaGgoKCgDwsCQAJAIAFBkIB+akGfgH5LDQACQCACQv///////////wCDQgBSDQBBARB6DwsgAkKAgICAgICA+P8AUQ0BAkACQCABQYCAAnENACABQfD/AXFB8P8BRw0BCyAAEHwPCyAARAAAAAAAADBDor1CgICAgICAgOB8fCECCyACQoCAgICAgICNQHwiA0IuiKdBP3FBBHQiAUGoyQBqKwMAIANCNIent6AiBEEAKwOQSCIFIAFBoMkAaisDACACIANCgICAgICAgHiDfb8gAUGg0QBqKwMAoSABQajRAGorAwChoiIAvUKAgICAcIO/IgaiIgigIgkgACAAoiIHIAcgB6IgAEEAKwPISKJBACsDwEigoiAHIABBACsDuEiiQQArA7BIoKIgAEEAKwOoSKJBACsDoEigoKCiIAAgBqEgBaJBACsDmEggAKKgIAggBCAJoaCgoKAhAAsgAAsJACAAvUIwiKcLGABDAACAv0MAAIA/IAAbEIIBQwAAAACVCxUBAX8jAEEQayIBIAA4AgwgASoCDAsMACAAIACTIgAgAJUL+AECAn8CfAJAIAC8IgFBgICA/ANHDQBDAAAAAA8LAkACQCABQYCAgIR4akH///+HeEsNAAJAIAFBAXQiAg0AQQEQgQEPCyABQYCAgPwHRg0BAkACQCABQQBIDQAgAkGAgIB4SQ0BCyAAEIMBDwsgAEMAAABLlLxBgICApH9qIQELQQArA7h8IAEgAUGAgLSGfGoiAkGAgIB8cWu+uyACQQ92QfABcSIBQbD6AGorAwCiRAAAAAAAAPC/oCIDIAOiIgSiQQArA8B8IAOiQQArA8h8oKAgBKIgAkEXdbdBACsDsHyiIAFBuPoAaisDAKAgA6CgtiEACyAAC64BAAJAAkAgAUGACEgNACAARAAAAAAAAOB/oiEAAkAgAUH/D08NACABQYF4aiEBDAILIABEAAAAAAAA4H+iIQAgAUH9FyABQf0XSBtBgnBqIQEMAQsgAUGBeEoNACAARAAAAAAAAGADoiEAAkAgAUG4cE0NACABQckHaiEBDAELIABE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IAMgBWo2AgggACAEQQxqIARBCGoQ3gIgBEEQaiQACwkAIAAgARDiAgsJACAAIAEQ4wILDAAgACABIAIQ4QIaCzgBAX8jAEEQayIDJAAgAyABEOQCNgIMIAMgAhDkAjYCCCAAIANBDGogA0EIahDlAhogA0EQaiQACwcAIAAQuAILGAAgACABKAIANgIAIAAgAigCADYCBCAACwkAIAAgARDoAgsNACAAIAEgABC4AmtqCwcAIAAQ5gILGAAgACABKAIANgIAIAAgAigCADYCBCAACwcAIAAQ5wILBAAgAAsJACAAIAEQ6QILDQAgACABIAAQ5wJragsrAQF/IwBBEGsiAyQAIANBCGogACABIAIQ6wIgAygCDCECIANBEGokACACC2QBAX8jAEEgayIEJAAgBEEYaiABIAIQ7AIgBEEQaiAEKAIYIAQoAhwgAxDtAhDuAiAEIAEgBCgCEBDvAjYCDCAEIAMgBCgCFBDwAjYCCCAAIARBDGogBEEIahDxAiAEQSBqJAALCwAgACABIAIQ8gILBwAgABDzAgtRAQJ/IwBBEGsiBCQAIAIgAWshBQJAIAIgAUYNACADIAEgBRBhGgsgBCABIAVqNgIMIAQgAyAFajYCCCAAIARBDGogBEEIahDxAiAEQRBqJAALCQAgACABEPUCCwkAIAAgARD2AgsMACAAIAEgAhD0AhoLOAEBfyMAQRBrIgMkACADIAEQ9wI2AgwgAyACEPcCNgIIIAAgA0EMaiADQQhqEPgCGiADQRBqJAALBwAgABD7AgsYACAAIAEoAgA2AgAgACACKAIANgIEIAALCQAgACABEPwCCw0AIAAgASAAEPsCa2oLBwAgABD5AgsYACAAIAEoAgA2AgAgACACKAIANgIEIAALBwAgABD6AgsEACAACwQAIAALCQAgACABEP0CCw0AIAAgASAAEPoCa2oLBAAgAAsHACAAEIEDCxgAIAAQvQIiAEIANwIAIABBCGpBADYCAAsHACAAEIIDCwQAIAALBAAgAAsKACAAEL0CKAIACwoAIAAQvQIQhgMLBAAgAAsEACAACwsAIAAgASACEIwDCwkAIAAgARCOAwstAQF/IAAQvQIiAiACLQALQYABcSABcjoACyAAEL0CIgAgAC0AC0H/AHE6AAsLDAAgACABLQAAOgAACwsAIAEgAkEBEI8DCwcAIAAQlQMLDgAgARC+AhogABC+AhoLHgACQCACEJADRQ0AIAAgASACEJEDDwsgACABEJIDCwcAIABBCEsLCQAgACACEJMDCwcAIAAQlAMLCQAgACABEIUNCwcAIAAQgQ0LBAAgAAsHACAAEJcDCwQAIAALBAAgAAsJACAAIAEQogMLGQAgABDAAhCjAyIAIAAQpANBAXZLdkFwagsHACAAQQtJCy0BAX9BCiEBAkAgAEELSQ0AIABBAWoQpgMiACAAQX9qIgAgAEELRhshAQsgAQsZACABIAIQpQMhASAAIAI2AgQgACABNgIACwIACwwAIAAQvQIgATYCAAs6AQF/IAAQvQIiAiACKAIIQYCAgIB4cSABQf////8HcXI2AgggABC9AiIAIAAoAghBgICAgHhyNgIICwwAIAAQvQIgATYCBAsHACABIABrCwUAEKQDCwUAEKcDCxkAAkAgABCjAyABTw0AECYACyABQQEQqAMLCgAgAEEPakFwcQsEAEF/CxoAAkAgARCQA0UNACAAIAEQqQMPCyAAEKoDCwkAIAAgARCDDQsHACAAEIANCxgAAkAgABC7AkUNACAAEK0DDwsgABCuAwsNACABKAIAIAIoAgBJCwoAIAAQxgIoAgALCgAgABDGAhCvAwsEACAACzEBAX8CQCAAKAIAIgFFDQACQCABENwBEMIBEN8BDQAgACgCAEUPCyAAQQA2AgALQQELEQAgACABIAAoAgAoAhwRAQALMQEBfwJAIAAoAgAiAUUNAAJAIAEQogIQigIQpAINACAAKAIARQ8LIABBADYCAAtBAQsRACAAIAEgACgCACgCLBEBAAszAQF/IwBBEGsiAiQAIAAgAkEIaiACELQCIgAgASABELUDEJUNIAAQtQIgAkEQaiQAIAALBwAgABCJAQtAAQJ/IAAoAighAgNAAkAgAg0ADwsgASAAIAAoAiQgAkF/aiICQQJ0IgNqKAIAIAAoAiAgA2ooAgARBQAMAAsACw0AIAAgAUEcahDECRoLCQAgACABELoDCycAIAAgACgCGEUgAXIiATYCEAJAIAAoAhQgAXFFDQBBjwsQvQMACwspAQJ/IwBBEGsiAiQAIAJBCGogACABEKwDIQMgAkEQaiQAIAEgACADGwtAACAAQbiDAUEIajYCACAAQQAQtgMgAEEcahDFCRogACgCIBCMASAAKAIkEIwBIAAoAjAQjAEgACgCPBCMASAACw0AIAAQuwMaIAAQgQ0LBQAQDwALQAAgAEEANgIUIAAgATYCGCAAQQA2AgwgAEKCoICA4AA3AgQgACABRTYCECAAQSBqQQBBKBBiGiAAQRxqEMMJGgsOACAAIAEoAgA2AgAgAAsEACAACwQAQQALBABCAAudAQEDf0F/IQICQCAAQX9GDQBBACEDAkAgASgCTEEASA0AIAEQpwEhAwsCQAJAAkAgASgCBCIEDQAgARCqARogASgCBCIERQ0BCyAEIAEoAixBeGpLDQELIANFDQEgARCoAUF/DwsgASAEQX9qIgI2AgQgAiAAOgAAIAEgASgCAEFvcTYCAAJAIANFDQAgARCoAQsgAEH/AXEhAgsgAgsEAEEqCwUAEMQDCwYAQdD/AQsXAEEAQYjvATYCsIACQQAQxQM2Auj/AQtBAQJ/IwBBEGsiASQAQX8hAgJAIAAQqgENACAAIAFBD2pBASAAKAIgEQMAQQFHDQAgAS0ADyECCyABQRBqJAAgAgsHACAAEMoDC1oBAX8CQAJAIAAoAkwiAUEASA0AIAFFDQEgAUH/////e3EQxgMoAhhHDQELAkAgACgCBCIBIAAoAghGDQAgACABQQFqNgIEIAEtAAAPCyAAEMgDDwsgABDLAwtjAQJ/AkAgAEHMAGoiARDMA0UNACAAEKcBGgsCQAJAIAAoAgQiAiAAKAIIRg0AIAAgAkEBajYCBCACLQAAIQAMAQsgABDIAyEACwJAIAEQzQNBgICAgARxRQ0AIAEQzgMLIAALGwEBfyAAIAAoAgAiAUH/////AyABGzYCACABCxQBAX8gACgCACEBIABBADYCACABCwoAIABBARCeARoLFABB8IUCEOYDGkE9QQBBgAgQWhoLCgBB8IUCEOgDGguFAwEDf0H0hQJBACgC5IMBIgFBrIYCENIDGkHIgAJB9IUCENMDGkG0hgJBACgC6IMBIgJB5IYCENQDGkH4gQJBtIYCENUDGkHshgJBACgC7IMBIgNBnIcCENQDGkGggwJB7IYCENUDGkHIhAJBoIMCQQAoAqCDAkF0aigCAGoQ2AEQ1QMaQciAAkEAKALIgAJBdGooAgBqQfiBAhDWAxpBoIMCQQAoAqCDAkF0aigCAGoQ1wMaQaCDAkEAKAKggwJBdGooAgBqQfiBAhDWAxpBpIcCIAFB3IcCENgDGkGggQJBpIcCENkDGkHkhwIgAkGUiAIQ2gMaQcyCAkHkhwIQ2wMaQZyIAiADQcyIAhDaAxpB9IMCQZyIAhDbAxpBnIUCQfSDAkEAKAL0gwJBdGooAgBqEJ4CENsDGkGggQJBACgCoIECQXRqKAIAakHMggIQ3AMaQfSDAkEAKAL0gwJBdGooAgBqENcDGkH0gwJBACgC9IMCQXRqKAIAakHMggIQ3AMaIAALbQEBfyMAQRBrIgMkACAAELIBIgAgAjYCKCAAIAE2AiAgAEHwgwFBCGo2AgAQwgEhAiAAQQA6ADQgACACNgIwIANBCGogABCzAiAAIANBCGogACgCACgCCBECACADQQhqEMUJGiADQRBqJAAgAAs2AQF/IABBCGoQ3QMhAiAAQZD9AEEMajYCACACQZD9AEEgajYCACAAQQA2AgQgAiABEN4DIAALYwEBfyMAQRBrIgMkACAAELIBIgAgATYCICAAQdSEAUEIajYCACADQQhqIAAQswIgA0EIahDNAiEBIANBCGoQxQkaIAAgAjYCKCAAIAE2AiQgACABEM4COgAsIANBEGokACAACy8BAX8gAEEEahDdAyECIABBwP0AQQxqNgIAIAJBwP0AQSBqNgIAIAIgARDeAyAACxQBAX8gACgCSCECIAAgATYCSCACCw4AIABBgMAAEN8DGiAAC20BAX8jAEEQayIDJAAgABD9ASIAIAI2AiggACABNgIgIABBvIUBQQhqNgIAEIoCIQIgAEEAOgA0IAAgAjYCMCADQQhqIAAQ4AMgACADQQhqIAAoAgAoAggRAgAgA0EIahDFCRogA0EQaiQAIAALNgEBfyAAQQhqEOEDIQIgAEGw/gBBDGo2AgAgAkGw/gBBIGo2AgAgAEEANgIEIAIgARDiAyAAC2MBAX8jAEEQayIDJAAgABD9ASIAIAE2AiAgAEGghgFBCGo2AgAgA0EIaiAAEOADIANBCGoQ4wMhASADQQhqEMUJGiAAIAI2AiggACABNgIkIAAgARDkAzoALCADQRBqJAAgAAsvAQF/IABBBGoQ4QMhAiAAQeD+AEEMajYCACACQeD+AEEgajYCACACIAEQ4gMgAAsUAQF/IAAoAkghAiAAIAE2AkggAgsVACAAEPIDIgBBkP8AQQhqNgIAIAALGAAgACABEL4DIABBADYCSCAAEMIBNgJMCxUBAX8gACAAKAIEIgIgAXI2AgQgAgsNACAAIAFBBGoQxAkaCxUAIAAQ8gMiAEGkgQFBCGo2AgAgAAsYACAAIAEQvgMgAEEANgJIIAAQigI2AkwLCwAgAEH8igIQ/QQLDwAgACAAKAIAKAIcEQAACyQAQfiBAhDPARpByIQCEM8BGkHMggIQlwIaQZyFAhCXAhogAAsrAAJAQQAtANWIAg0AQdSIAhDRAxpBPkEAQYAIEFoaQQBBAToA1YgCCyAACwoAQdSIAhDlAxoLBAAgAAsKACAAELABEIENCzkAIAAgARDNAiIBNgIkIAAgARDUAjYCLCAAIAAoAiQQzgI6ADUCQCAAKAIsQQlIDQBBjQkQ5AYACwsJACAAQQAQ7AMLoAMCBX8BfiMAQSBrIgIkAAJAAkAgAC0ANEUNACAAKAIwIQMgAUUNARDCASEEIABBADoANCAAIAQ2AjAMAQsgAkEBNgIYQQAhAyACQRhqIABBLGoQ7wMoAgAiBUEAIAVBAEobIQYCQAJAA0AgAyAGRg0BIAAoAiAQyQMiBEF/Rg0CIAJBGGogA2ogBDoAACADQQFqIQMMAAsACwJAAkAgAC0ANUUNACACIAItABg6ABcMAQsgAkEXakEBaiEGAkADQCAAKAIoIgMpAgAhBwJAIAAoAiQgAyACQRhqIAJBGGogBWoiBCACQRBqIAJBF2ogBiACQQxqENACQX9qDgMABAIDCyAAKAIoIAc3AgAgBUEIRg0DIAAoAiAQyQMiA0F/Rg0DIAQgAzoAACAFQQFqIQUMAAsACyACIAItABg6ABcLAkACQCABDQADQCAFQQFIDQIgAkEYaiAFQX9qIgVqLAAAEMQBIAAoAiAQwwNBf0YNAwwACwALIAAgAiwAFxDEATYCMAsgAiwAFxDEASEDDAELEMIBIQMLIAJBIGokACADCwkAIABBARDsAwuKAgEDfyMAQSBrIgIkACABEMIBEN8BIQMgAC0ANCEEAkACQCADRQ0AIARB/wFxDQEgACAAKAIwIgEQwgEQ3wFBAXM6ADQMAQsCQCAEQf8BcUUNACACIAAoAjAQvgE6ABMCQAJAAkAgACgCJCAAKAIoIAJBE2ogAkETakEBaiACQQxqIAJBGGogAkEgaiACQRRqENMCQX9qDgMCAgABCyAAKAIwIQMgAiACQRhqQQFqNgIUIAIgAzoAGAsDQCACKAIUIgMgAkEYak0NAiACIANBf2oiAzYCFCADLAAAIAAoAiAQwwNBf0cNAAsLEMIBIQEMAQsgAEEBOgA0IAAgATYCMAsgAkEgaiQAIAELCQAgACABEPADCykBAn8jAEEQayICJAAgAkEIaiAAIAEQ8QMhAyACQRBqJAAgASAAIAMbCw0AIAEoAgAgAigCAEgLEAAgAEG4gwFBCGo2AgAgAAsKACAAELABEIENCyYAIAAgACgCACgCGBEAABogACABEM0CIgE2AiQgACABEM4COgAsC38BBX8jAEEQayIBJAAgAUEQaiECAkADQCAAKAIkIAAoAiggAUEIaiACIAFBBGoQ1QIhA0F/IQQgAUEIakEBIAEoAgQgAUEIamsiBSAAKAIgEK0BIAVHDQECQCADQX9qDgIBAgALC0F/QQAgACgCIBCpARshBAsgAUEQaiQAIAQLbwEBfwJAAkAgAC0ALA0AQQAhAyACQQAgAkEAShshAgNAIAMgAkYNAgJAIAAgASwAABDEASAAKAIAKAI0EQEAEMIBRw0AIAMPCyABQQFqIQEgA0EBaiEDDAALAAsgAUEBIAIgACgCIBCtASECCyACC4wCAQV/IwBBIGsiAiQAAkACQAJAIAEQwgEQ3wENACACIAEQvgE6ABcCQCAALQAsRQ0AIAJBF2pBAUEBIAAoAiAQrQFBAUcNAgwBCyACIAJBGGo2AhAgAkEgaiEDIAJBF2pBAWohBCACQRdqIQUDQCAAKAIkIAAoAiggBSAEIAJBDGogAkEYaiADIAJBEGoQ0wIhBiACKAIMIAVGDQICQCAGQQNHDQAgBUEBQQEgACgCIBCtAUEBRg0CDAMLIAZBAUsNAiACQRhqQQEgAigCECACQRhqayIFIAAoAiAQrQEgBUcNAiACKAIMIQUgBkEBRg0ACwsgARDLAiEADAELEMIBIQALIAJBIGokACAACwoAIAAQ+wEQgQ0LOQAgACABEOMDIgE2AiQgACABEPoDNgIsIAAgACgCJBDkAzoANQJAIAAoAixBCUgNAEGNCRDkBgALCw8AIAAgACgCACgCGBEAAAsJACAAQQAQ/AMLnQMCBX8BfiMAQSBrIgIkAAJAAkAgAC0ANEUNACAAKAIwIQMgAUUNARCKAiEEIABBADoANCAAIAQ2AjAMAQsgAkEBNgIYQQAhAyACQRhqIABBLGoQ7wMoAgAiBUEAIAVBAEobIQYCQAJAA0AgAyAGRg0BIAAoAiAQyQMiBEF/Rg0CIAJBGGogA2ogBDoAACADQQFqIQMMAAsACwJAAkAgAC0ANUUNACACIAIsABg2AhQMAQsgAkEYaiEGAkADQCAAKAIoIgMpAgAhBwJAIAAoAiQgAyACQRhqIAJBGGogBWoiBCACQRBqIAJBFGogBiACQQxqEIAEQX9qDgMABAIDCyAAKAIoIAc3AgAgBUEIRg0DIAAoAiAQyQMiA0F/Rg0DIAQgAzoAACAFQQFqIQUMAAsACyACIAIsABg2AhQLAkACQCABDQADQCAFQQFIDQIgAkEYaiAFQX9qIgVqLAAAEIwCIAAoAiAQwwNBf0YNAwwACwALIAAgAigCFBCMAjYCMAsgAigCFBCMAiEDDAELEIoCIQMLIAJBIGokACADCwkAIABBARD8AwuEAgEDfyMAQSBrIgIkACABEIoCEKQCIQMgAC0ANCEEAkACQCADRQ0AIARB/wFxDQEgACAAKAIwIgEQigIQpAJBAXM6ADQMAQsCQCAEQf8BcUUNACACIAAoAjAQhwI2AhACQAJAAkAgACgCJCAAKAIoIAJBEGogAkEUaiACQQxqIAJBGGogAkEgaiACQRRqEP8DQX9qDgMCAgABCyAAKAIwIQMgAiACQRlqNgIUIAIgAzoAGAsDQCACKAIUIgMgAkEYak0NAiACIANBf2oiAzYCFCADLAAAIAAoAiAQwwNBf0cNAAsLEIoCIQEMAQsgAEEBOgA0IAAgATYCMAsgAkEgaiQAIAELHQAgACABIAIgAyAEIAUgBiAHIAAoAgAoAgwRDQALHQAgACABIAIgAyAEIAUgBiAHIAAoAgAoAhARDQALCgAgABD7ARCBDQsmACAAIAAoAgAoAhgRAAAaIAAgARDjAyIBNgIkIAAgARDkAzoALAt/AQV/IwBBEGsiASQAIAFBEGohAgJAA0AgACgCJCAAKAIoIAFBCGogAiABQQRqEIQEIQNBfyEEIAFBCGpBASABKAIEIAFBCGprIgUgACgCIBCtASAFRw0BAkAgA0F/ag4CAQIACwtBf0EAIAAoAiAQqQEbIQQLIAFBEGokACAECxcAIAAgASACIAMgBCAAKAIAKAIUEQkAC28BAX8CQAJAIAAtACwNAEEAIQMgAkEAIAJBAEobIQIDQCADIAJGDQICQCAAIAEoAgAQjAIgACgCACgCNBEBABCKAkcNACADDwsgAUEEaiEBIANBAWohAwwACwALIAFBBCACIAAoAiAQrQEhAgsgAguJAgEFfyMAQSBrIgIkAAJAAkACQCABEIoCEKQCDQAgAiABEIcCNgIUAkAgAC0ALEUNACACQRRqQQRBASAAKAIgEK0BQQFHDQIMAQsgAiACQRhqNgIQIAJBIGohAyACQRhqIQQgAkEUaiEFA0AgACgCJCAAKAIoIAUgBCACQQxqIAJBGGogAyACQRBqEP8DIQYgAigCDCAFRg0CAkAgBkEDRw0AIAVBAUEBIAAoAiAQrQFBAUYNAgwDCyAGQQFLDQIgAkEYakEBIAIoAhAgAkEYamsiBSAAKAIgEK0BIAVHDQIgAigCDCEFIAZBAUYNAAsLIAEQhwQhAAwBCxCKAiEACyACQSBqJAAgAAsaAAJAIAAQigIQpAJFDQAQigJBf3MhAAsgAAsFABDPAwsQACAAQSBGIABBd2pBBUlyC0cBAn8gACABNwNwIAAgACgCLCAAKAIEIgJrrDcDeCAAKAIIIQMCQCABUA0AIAMgAmusIAFXDQAgAiABp2ohAwsgACADNgJoC90BAgN/An4gACkDeCAAKAIEIgEgACgCLCICa6x8IQQCQAJAAkAgACkDcCIFUA0AIAQgBVkNAQsgABDIAyICQX9KDQEgACgCBCEBIAAoAiwhAgsgAEJ/NwNwIAAgATYCaCAAIAQgAiABa6x8NwN4QX8PCyAEQgF8IQQgACgCBCEBIAAoAgghAwJAIAApA3AiBUIAUQ0AIAUgBH0iBSADIAFrrFkNACABIAWnaiEDCyAAIAM2AmggACAEIAAoAiwiAyABa6x8NwN4AkAgASADSw0AIAFBf2ogAjoAAAsgAgsKACAAQVBqQQpJCwcAIAAQjAQLUwEBfgJAAkAgA0HAAHFFDQAgASADQUBqrYYhAkIAIQEMAQsgA0UNACABQcAAIANrrYggAiADrSIEhoQhAiABIASGIQELIAAgATcDACAAIAI3AwgL4QECA38CfiMAQRBrIgIkAAJAAkAgAbwiA0H/////B3EiBEGAgIB8akH////3B0sNACAErUIZhkKAgICAgICAwD98IQVCACEGDAELAkAgBEGAgID8B0kNACADrUIZhkKAgICAgIDA//8AhCEFQgAhBgwBCwJAIAQNAEIAIQZCACEFDAELIAIgBK1CACAEZyIEQdEAahCOBCACQQhqKQMAQoCAgICAgMAAhUGJ/wAgBGutQjCGhCEFIAIpAwAhBgsgACAGNwMAIAAgBSADQYCAgIB4ca1CIIaENwMIIAJBEGokAAuNAQICfwJ+IwBBEGsiAiQAAkACQCABDQBCACEEQgAhBQwBCyACIAEgAUEfdSIDcyADayIDrUIAIANnIgNB0QBqEI4EIAJBCGopAwBCgICAgICAwACFQZ6AASADa61CMIZ8IAFBgICAgHhxrUIghoQhBSACKQMAIQQLIAAgBDcDACAAIAU3AwggAkEQaiQAC1MBAX4CQAJAIANBwABxRQ0AIAIgA0FAaq2IIQFCACECDAELIANFDQAgAkHAACADa62GIAEgA60iBIiEIQEgAiAEiCECCyAAIAE3AwAgACACNwMIC5wLAgV/D34jAEHgAGsiBSQAIARC////////P4MhCiAEIAKFQoCAgICAgICAgH+DIQsgAkL///////8/gyIMQiCIIQ0gBEIwiKdB//8BcSEGAkACQAJAIAJCMIinQf//AXEiB0GBgH5qQYKAfkkNAEEAIQggBkGBgH5qQYGAfksNAQsCQCABUCACQv///////////wCDIg5CgICAgICAwP//AFQgDkKAgICAgIDA//8AURsNACACQoCAgICAgCCEIQsMAgsCQCADUCAEQv///////////wCDIgJCgICAgICAwP//AFQgAkKAgICAgIDA//8AURsNACAEQoCAgICAgCCEIQsgAyEBDAILAkAgASAOQoCAgICAgMD//wCFhEIAUg0AAkAgAyAChFBFDQBCgICAgICA4P//ACELQgAhAQwDCyALQoCAgICAgMD//wCEIQtCACEBDAILAkAgAyACQoCAgICAgMD//wCFhEIAUg0AIAEgDoQhAkIAIQECQCACUEUNAEKAgICAgIDg//8AIQsMAwsgC0KAgICAgIDA//8AhCELDAILAkAgASAOhEIAUg0AQgAhAQwCCwJAIAMgAoRCAFINAEIAIQEMAgtBACEIAkAgDkL///////8/Vg0AIAVB0ABqIAEgDCABIAwgDFAiCBt5IAhBBnStfKciCEFxahCOBEEQIAhrIQggBUHYAGopAwAiDEIgiCENIAUpA1AhAQsgAkL///////8/Vg0AIAVBwABqIAMgCiADIAogClAiCRt5IAlBBnStfKciCUFxahCOBCAIIAlrQRBqIQggBUHIAGopAwAhCiAFKQNAIQMLIANCD4YiDkKAgP7/D4MiAiABQiCIIgR+Ig8gDkIgiCIOIAFC/////w+DIgF+fCIQQiCGIhEgAiABfnwiEiARVK0gAiAMQv////8PgyIMfiITIA4gBH58IhEgA0IxiCAKQg+GIhSEQv////8PgyIDIAF+fCIKIBBCIIggECAPVK1CIIaEfCIPIAIgDUKAgASEIhB+IhUgDiAMfnwiDSAUQiCIQoCAgIAIhCICIAF+fCIUIAMgBH58IhZCIIZ8Ihd8IQEgByAGaiAIakGBgH9qIQYCQAJAIAIgBH4iGCAOIBB+fCIEIBhUrSAEIAMgDH58Ig4gBFStfCACIBB+fCAOIBEgE1StIAogEVStfHwiBCAOVK18IAMgEH4iAyACIAx+fCICIANUrUIghiACQiCIhHwgBCACQiCGfCICIARUrXwgAiAWQiCIIA0gFVStIBQgDVStfCAWIBRUrXxCIIaEfCIEIAJUrXwgBCAPIApUrSAXIA9UrXx8IgIgBFStfCIEQoCAgICAgMAAg1ANACAGQQFqIQYMAQsgEkI/iCEDIARCAYYgAkI/iIQhBCACQgGGIAFCP4iEIQIgEkIBhiESIAMgAUIBhoQhAQsCQCAGQf//AUgNACALQoCAgICAgMD//wCEIQtCACEBDAELAkACQCAGQQBKDQACQEEBIAZrIgdB/wBLDQAgBUEwaiASIAEgBkH/AGoiBhCOBCAFQSBqIAIgBCAGEI4EIAVBEGogEiABIAcQkQQgBSACIAQgBxCRBCAFKQMgIAUpAxCEIAUpAzAgBUEwakEIaikDAIRCAFKthCESIAVBIGpBCGopAwAgBUEQakEIaikDAIQhASAFQQhqKQMAIQQgBSkDACECDAILQgAhAQwCCyAGrUIwhiAEQv///////z+DhCEECyAEIAuEIQsCQCASUCABQn9VIAFCgICAgICAgICAf1EbDQAgCyACQgF8IgEgAlStfCELDAELAkAgEiABQoCAgICAgICAgH+FhEIAUQ0AIAIhAQwBCyALIAIgAkIBg3wiASACVK18IQsLIAAgATcDACAAIAs3AwggBUHgAGokAAsEAEEACwQAQQAL6AoCBH8EfiMAQfAAayIFJAAgBEL///////////8AgyEJAkACQAJAIAFQIgYgAkL///////////8AgyIKQoCAgICAgMCAgH98QoCAgICAgMCAgH9UIApQGw0AIANCAFIgCUKAgICAgIDAgIB/fCILQoCAgICAgMCAgH9WIAtCgICAgICAwICAf1EbDQELAkAgBiAKQoCAgICAgMD//wBUIApCgICAgICAwP//AFEbDQAgAkKAgICAgIAghCEEIAEhAwwCCwJAIANQIAlCgICAgICAwP//AFQgCUKAgICAgIDA//8AURsNACAEQoCAgICAgCCEIQQMAgsCQCABIApCgICAgICAwP//AIWEQgBSDQBCgICAgICA4P//ACACIAMgAYUgBCAChUKAgICAgICAgIB/hYRQIgYbIQRCACABIAYbIQMMAgsgAyAJQoCAgICAgMD//wCFhFANAQJAIAEgCoRCAFINACADIAmEQgBSDQIgAyABgyEDIAQgAoMhBAwCCyADIAmEUEUNACABIQMgAiEEDAELIAMgASADIAFWIAkgClYgCSAKURsiBxshCSAEIAIgBxsiC0L///////8/gyEKIAIgBCAHGyICQjCIp0H//wFxIQgCQCALQjCIp0H//wFxIgYNACAFQeAAaiAJIAogCSAKIApQIgYbeSAGQQZ0rXynIgZBcWoQjgRBECAGayEGIAVB6ABqKQMAIQogBSkDYCEJCyABIAMgBxshAyACQv///////z+DIQQCQCAIDQAgBUHQAGogAyAEIAMgBCAEUCIHG3kgB0EGdK18pyIHQXFqEI4EQRAgB2shCCAFQdgAaikDACEEIAUpA1AhAwsgBEIDhiADQj2IhEKAgICAgICABIQhASAKQgOGIAlCPYiEIQQgA0IDhiEKIAsgAoUhAwJAIAYgCEYNAAJAIAYgCGsiB0H/AE0NAEIAIQFCASEKDAELIAVBwABqIAogAUGAASAHaxCOBCAFQTBqIAogASAHEJEEIAUpAzAgBSkDQCAFQcAAakEIaikDAIRCAFKthCEKIAVBMGpBCGopAwAhAQsgBEKAgICAgICABIQhDCAJQgOGIQkCQAJAIANCf1UNAEIAIQNCACEEIAkgCoUgDCABhYRQDQIgCSAKfSECIAwgAX0gCSAKVK19IgRC/////////wNWDQEgBUEgaiACIAQgAiAEIARQIgcbeSAHQQZ0rXynQXRqIgcQjgQgBiAHayEGIAVBKGopAwAhBCAFKQMgIQIMAQsgASAMfCAKIAl8IgIgClStfCIEQoCAgICAgIAIg1ANACACQgGIIARCP4aEIApCAYOEIQIgBkEBaiEGIARCAYghBAsgC0KAgICAgICAgIB/gyEKAkAgBkH//wFIDQAgCkKAgICAgIDA//8AhCEEQgAhAwwBC0EAIQcCQAJAIAZBAEwNACAGIQcMAQsgBUEQaiACIAQgBkH/AGoQjgQgBSACIARBASAGaxCRBCAFKQMAIAUpAxAgBUEQakEIaikDAIRCAFKthCECIAVBCGopAwAhBAsgAkIDiCAEQj2GhCEDIAetQjCGIARCA4hC////////P4OEIAqEIQQgAqdBB3EhBgJAAkACQAJAAkAQkwQOAwABAgMLIAQgAyAGQQRLrXwiCiADVK18IQQCQCAGQQRGDQAgCiEDDAMLIAQgCkIBgyIBIAp8IgMgAVStfCEEDAMLIAQgAyAKQgBSIAZBAEdxrXwiCiADVK18IQQgCiEDDAELIAQgAyAKUCAGQQBHca18IgogA1StfCEEIAohAwsgBkUNAQsQlAQaCyAAIAM3AwAgACAENwMIIAVB8ABqJAALjgICAn8DfiMAQRBrIgIkAAJAAkAgAb0iBEL///////////8AgyIFQoCAgICAgIB4fEL/////////7/8AVg0AIAVCPIYhBiAFQgSIQoCAgICAgICAPHwhBQwBCwJAIAVCgICAgICAgPj/AFQNACAEQjyGIQYgBEIEiEKAgICAgIDA//8AhCEFDAELAkAgBVBFDQBCACEGQgAhBQwBCyACIAVCACAEp2dBIGogBUIgiKdnIAVCgICAgBBUGyIDQTFqEI4EIAJBCGopAwBCgICAgICAwACFQYz4ACADa61CMIaEIQUgAikDACEGCyAAIAY3AwAgACAFIARCgICAgICAgICAf4OENwMIIAJBEGokAAvgAQIBfwJ+QQEhBAJAIABCAFIgAUL///////////8AgyIFQoCAgICAgMD//wBWIAVCgICAgICAwP//AFEbDQAgAkIAUiADQv///////////wCDIgZCgICAgICAwP//AFYgBkKAgICAgIDA//8AURsNAAJAIAIgAIQgBiAFhIRQRQ0AQQAPCwJAIAMgAYNCAFMNAEF/IQQgACACVCABIANTIAEgA1EbDQEgACAChSABIAOFhEIAUg8LQX8hBCAAIAJWIAEgA1UgASADURsNACAAIAKFIAEgA4WEQgBSIQQLIAQL2AECAX8CfkF/IQQCQCAAQgBSIAFC////////////AIMiBUKAgICAgIDA//8AViAFQoCAgICAgMD//wBRGw0AIAJCAFIgA0L///////////8AgyIGQoCAgICAgMD//wBWIAZCgICAgICAwP//AFEbDQACQCACIACEIAYgBYSEUEUNAEEADwsCQCADIAGDQgBTDQAgACACVCABIANTIAEgA1EbDQEgACAChSABIAOFhEIAUg8LIAAgAlYgASADVSABIANRGw0AIAAgAoUgASADhYRCAFIhBAsgBAs1ACAAIAE3AwAgACAEQjCIp0GAgAJxIAJCMIinQf//AXFyrUIwhiACQv///////z+DhDcDCAtyAgF/An4jAEEQayICJAACQAJAIAENAEIAIQNCACEEDAELIAIgAa1CACABZyIBQdEAahCOBCACQQhqKQMAQoCAgICAgMAAhUGegAEgAWutQjCGfCEEIAIpAwAhAwsgACADNwMAIAAgBDcDCCACQRBqJAALSAEBfyMAQRBrIgUkACAFIAEgAiADIARCgICAgICAgICAf4UQlQQgBSkDACEEIAAgBUEIaikDADcDCCAAIAQ3AwAgBUEQaiQAC+cCAQF/IwBB0ABrIgQkAAJAAkAgA0GAgAFIDQAgBEEgaiABIAJCAEKAgICAgICA//8AEJIEIARBIGpBCGopAwAhAiAEKQMgIQECQCADQf//AU8NACADQYGAf2ohAwwCCyAEQRBqIAEgAkIAQoCAgICAgID//wAQkgQgA0H9/wIgA0H9/wJIG0GCgH5qIQMgBEEQakEIaikDACECIAQpAxAhAQwBCyADQYGAf0oNACAEQcAAaiABIAJCAEKAgICAgICAORCSBCAEQcAAakEIaikDACECIAQpA0AhAQJAIANB9IB+TQ0AIANBjf8AaiEDDAELIARBMGogASACQgBCgICAgICAgDkQkgQgA0HogX0gA0HogX1KG0Ga/gFqIQMgBEEwakEIaikDACECIAQpAzAhAQsgBCABIAJCACADQf//AGqtQjCGEJIEIAAgBEEIaikDADcDCCAAIAQpAwA3AwAgBEHQAGokAAt1AQF+IAAgBCABfiACIAN+fCADQiCIIgIgAUIgiCIEfnwgA0L/////D4MiAyABQv////8PgyIBfiIFQiCIIAMgBH58IgNCIIh8IANC/////w+DIAIgAX58IgFCIIh8NwMIIAAgAUIghiAFQv////8Pg4Q3AwAL5xACBX8PfiMAQdACayIFJAAgBEL///////8/gyEKIAJC////////P4MhCyAEIAKFQoCAgICAgICAgH+DIQwgBEIwiKdB//8BcSEGAkACQAJAIAJCMIinQf//AXEiB0GBgH5qQYKAfkkNAEEAIQggBkGBgH5qQYGAfksNAQsCQCABUCACQv///////////wCDIg1CgICAgICAwP//AFQgDUKAgICAgIDA//8AURsNACACQoCAgICAgCCEIQwMAgsCQCADUCAEQv///////////wCDIgJCgICAgICAwP//AFQgAkKAgICAgIDA//8AURsNACAEQoCAgICAgCCEIQwgAyEBDAILAkAgASANQoCAgICAgMD//wCFhEIAUg0AAkAgAyACQoCAgICAgMD//wCFhFBFDQBCACEBQoCAgICAgOD//wAhDAwDCyAMQoCAgICAgMD//wCEIQxCACEBDAILAkAgAyACQoCAgICAgMD//wCFhEIAUg0AQgAhAQwCCwJAIAEgDYRCAFINAEKAgICAgIDg//8AIAwgAyAChFAbIQxCACEBDAILAkAgAyAChEIAUg0AIAxCgICAgICAwP//AIQhDEIAIQEMAgtBACEIAkAgDUL///////8/Vg0AIAVBwAJqIAEgCyABIAsgC1AiCBt5IAhBBnStfKciCEFxahCOBEEQIAhrIQggBUHIAmopAwAhCyAFKQPAAiEBCyACQv///////z9WDQAgBUGwAmogAyAKIAMgCiAKUCIJG3kgCUEGdK18pyIJQXFqEI4EIAkgCGpBcGohCCAFQbgCaikDACEKIAUpA7ACIQMLIAVBoAJqIANCMYggCkKAgICAgIDAAIQiDkIPhoQiAkIAQoCAgICw5ryC9QAgAn0iBEIAEJ0EIAVBkAJqQgAgBUGgAmpBCGopAwB9QgAgBEIAEJ0EIAVBgAJqIAUpA5ACQj+IIAVBkAJqQQhqKQMAQgGGhCIEQgAgAkIAEJ0EIAVB8AFqIARCAEIAIAVBgAJqQQhqKQMAfUIAEJ0EIAVB4AFqIAUpA/ABQj+IIAVB8AFqQQhqKQMAQgGGhCIEQgAgAkIAEJ0EIAVB0AFqIARCAEIAIAVB4AFqQQhqKQMAfUIAEJ0EIAVBwAFqIAUpA9ABQj+IIAVB0AFqQQhqKQMAQgGGhCIEQgAgAkIAEJ0EIAVBsAFqIARCAEIAIAVBwAFqQQhqKQMAfUIAEJ0EIAVBoAFqIAJCACAFKQOwAUI/iCAFQbABakEIaikDAEIBhoRCf3wiBEIAEJ0EIAVBkAFqIANCD4ZCACAEQgAQnQQgBUHwAGogBEIAQgAgBUGgAWpBCGopAwAgBSkDoAEiCiAFQZABakEIaikDAHwiAiAKVK18IAJCAVatfH1CABCdBCAFQYABakIBIAJ9QgAgBEIAEJ0EIAggByAGa2ohBgJAAkAgBSkDcCIPQgGGIhAgBSkDgAFCP4ggBUGAAWpBCGopAwAiEUIBhoR8Ig1CmZN/fCISQiCIIgIgC0KAgICAgIDAAIQiE0IBhiIUQiCIIgR+IhUgAUIBhiIWQiCIIgogBUHwAGpBCGopAwBCAYYgD0I/iIQgEUI/iHwgDSAQVK18IBIgDVStfEJ/fCIPQiCIIg1+fCIQIBVUrSAQIA9C/////w+DIg8gAUI/iCIXIAtCAYaEQv////8PgyILfnwiESAQVK18IA0gBH58IA8gBH4iFSALIA1+fCIQIBVUrUIghiAQQiCIhHwgESAQQiCGfCIQIBFUrXwgECASQv////8PgyISIAt+IhUgAiAKfnwiESAVVK0gESAPIBZC/v///w+DIhV+fCIYIBFUrXx8IhEgEFStfCARIBIgBH4iECAVIA1+fCIEIAIgC358Ig0gDyAKfnwiD0IgiCAEIBBUrSANIARUrXwgDyANVK18QiCGhHwiBCARVK18IAQgGCACIBV+IgIgEiAKfnwiCkIgiCAKIAJUrUIghoR8IgIgGFStIAIgD0IghnwgAlStfHwiAiAEVK18IgRC/////////wBWDQAgFCAXhCETIAVB0ABqIAIgBCADIA4QnQQgAUIxhiAFQdAAakEIaikDAH0gBSkDUCIBQgBSrX0hDSAGQf7/AGohBkIAIAF9IQoMAQsgBUHgAGogAkIBiCAEQj+GhCICIARCAYgiBCADIA4QnQQgAUIwhiAFQeAAakEIaikDAH0gBSkDYCIKQgBSrX0hDSAGQf//AGohBkIAIAp9IQogASEWCwJAIAZB//8BSA0AIAxCgICAgICAwP//AIQhDEIAIQEMAQsCQAJAIAZBAUgNACANQgGGIApCP4iEIQ0gBq1CMIYgBEL///////8/g4QhDyAKQgGGIQQMAQsCQCAGQY9/Sg0AQgAhAQwCCyAFQcAAaiACIARBASAGaxCRBCAFQTBqIBYgEyAGQfAAahCOBCAFQSBqIAMgDiAFKQNAIgIgBUHAAGpBCGopAwAiDxCdBCAFQTBqQQhqKQMAIAVBIGpBCGopAwBCAYYgBSkDICIBQj+IhH0gBSkDMCIEIAFCAYYiAVStfSENIAQgAX0hBAsgBUEQaiADIA5CA0IAEJ0EIAUgAyAOQgVCABCdBCAPIAIgAkIBgyIBIAR8IgQgA1YgDSAEIAFUrXwiASAOViABIA5RG618IgMgAlStfCICIAMgAkKAgICAgIDA//8AVCAEIAUpAxBWIAEgBUEQakEIaikDACICViABIAJRG3GtfCICIANUrXwiAyACIANCgICAgICAwP//AFQgBCAFKQMAViABIAVBCGopAwAiBFYgASAEURtxrXwiASACVK18IAyEIQwLIAAgATcDACAAIAw3AwggBUHQAmokAAtLAgF+An8gAUL///////8/gyECAkACQCABQjCIp0H//wFxIgNB//8BRg0AQQQhBCADDQFBAkEDIAIgAIRQGw8LIAIgAIRQIQQLIAQL1QYCBH8DfiMAQYABayIFJAACQAJAAkAgAyAEQgBCABCXBEUNACADIAQQnwQhBiACQjCIpyIHQf//AXEiCEH//wFGDQAgBg0BCyAFQRBqIAEgAiADIAQQkgQgBSAFKQMQIgQgBUEQakEIaikDACIDIAQgAxCeBCAFQQhqKQMAIQIgBSkDACEEDAELAkAgASACQv///////////wCDIgkgAyAEQv///////////wCDIgoQlwRBAEoNAAJAIAEgCSADIAoQlwRFDQAgASEEDAILIAVB8ABqIAEgAkIAQgAQkgQgBUH4AGopAwAhAiAFKQNwIQQMAQsgBEIwiKdB//8BcSEGAkACQCAIRQ0AIAEhBAwBCyAFQeAAaiABIAlCAEKAgICAgIDAu8AAEJIEIAVB6ABqKQMAIglCMIinQYh/aiEIIAUpA2AhBAsCQCAGDQAgBUHQAGogAyAKQgBCgICAgICAwLvAABCSBCAFQdgAaikDACIKQjCIp0GIf2ohBiAFKQNQIQMLIApC////////P4NCgICAgICAwACEIQsgCUL///////8/g0KAgICAgIDAAIQhCQJAIAggBkwNAANAAkACQCAJIAt9IAQgA1StfSIKQgBTDQACQCAKIAQgA30iBIRCAFINACAFQSBqIAEgAkIAQgAQkgQgBUEoaikDACECIAUpAyAhBAwFCyAKQgGGIARCP4iEIQkMAQsgCUIBhiAEQj+IhCEJCyAEQgGGIQQgCEF/aiIIIAZKDQALIAYhCAsCQAJAIAkgC30gBCADVK19IgpCAFkNACAJIQoMAQsgCiAEIAN9IgSEQgBSDQAgBUEwaiABIAJCAEIAEJIEIAVBOGopAwAhAiAFKQMwIQQMAQsCQCAKQv///////z9WDQADQCAEQj+IIQMgCEF/aiEIIARCAYYhBCADIApCAYaEIgpCgICAgICAwABUDQALCyAHQYCAAnEhBgJAIAhBAEoNACAFQcAAaiAEIApC////////P4MgCEH4AGogBnKtQjCGhEIAQoCAgICAgMDDPxCSBCAFQcgAaikDACECIAUpA0AhBAwBCyAKQv///////z+DIAggBnKtQjCGhCECCyAAIAQ3AwAgACACNwMIIAVBgAFqJAALHAAgACACQv///////////wCDNwMIIAAgATcDAAuOCQIGfwN+IwBBMGsiBCQAQgAhCgJAAkAgAkECSw0AIAFBBGohBSACQQJ0IgJBzIcBaigCACEGIAJBwIcBaigCACEHA0ACQAJAIAEoAgQiAiABKAJoRg0AIAUgAkEBajYCACACLQAAIQIMAQsgARCLBCECCyACEIkEDQALQQEhCAJAAkAgAkFVag4DAAEAAQtBf0EBIAJBLUYbIQgCQCABKAIEIgIgASgCaEYNACAFIAJBAWo2AgAgAi0AACECDAELIAEQiwQhAgtBACEJAkACQAJAA0AgAkEgciAJQYMIaiwAAEcNAQJAIAlBBksNAAJAIAEoAgQiAiABKAJoRg0AIAUgAkEBajYCACACLQAAIQIMAQsgARCLBCECCyAJQQFqIglBCEcNAAwCCwALAkAgCUEDRg0AIAlBCEYNASADRQ0CIAlBBEkNAiAJQQhGDQELAkAgASkD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IAN9IQMLIARBEGokACADC8QDAgN/AX4jAEEgayICJAACQAJAIAFC////////////AIMiBUKAgICAgIDAv0B8IAVCgICAgICAwMC/f3xaDQAgAUIZiKchAwJAIABQIAFC////D4MiBUKAgIAIVCAFQoCAgAhRGw0AIANBgYCAgARqIQQMAgsgA0GAgICABGohBCAAIAVCgICACIWEQgBSDQEgBCADQQFxaiEEDAELAkAgAFAgBUKAgICAgIDA//8AVCAFQoCAgICAgMD//wBRGw0AIAFCGYinQf///wFxQYCAgP4HciEEDAELQYCAgPwHIQQgBUL///////+/v8AAVg0AQQAhBCAFQjCIpyIDQZH+AEkNACACQRBqIAAgAUL///////8/g0KAgICAgIDAAIQiBSADQf+Bf2oQjgQgAiAAIAVBgf8AIANrEJEEIAJBCGopAwAiBUIZiKchBAJAIAIpAwAgAikDECACQRBqQQhqKQMAhEIAUq2EIgBQIAVC////D4MiBUKAgIAIVCAFQoCAgAhRGw0AIARBAWohBAwBCyAAIAVCgICACIWEQgBSDQAgBEEBcSAEaiEECyACQSBqJAAgBCABQiCIp0GAgICAeHFyvgvkAwICfwJ+IwBBIGsiAiQAAkACQCABQv///////////wCDIgRCgICAgICAwP9DfCAEQoCAgICAgMCAvH98Wg0AIABCPIggAUIEhoQhBAJAIABC//////////8PgyIAQoGAgICAgICACFQNACAEQoGAgICAgICAwAB8IQUMAgsgBEKAgICAgICAgMAAfCEFIABCgICAgICAgIAIUg0BIAUgBEIBg3whBQwBCwJAIABQIARCgICAgICAwP//AFQgBEKAgICAgIDA//8AURsNACAAQjyIIAFCBIaEQv////////8Dg0KAgICAgICA/P8AhCEFDAELQoCAgICAgID4/wAhBSAEQv///////7//wwBWDQBCACEFIARCMIinIgNBkfcASQ0AIAJBEGogACABQv///////z+DQoCAgICAgMAAhCIEIANB/4h/ahCOBCACIAAgBEGB+AAgA2sQkQQgAikDACIEQjyIIAJBCGopAwBCBIaEIQUCQCAEQv//////////D4MgAikDECACQRBqQQhqKQMAhEIAUq2EIgRCgYCAgICAgIAIVA0AIAVCAXwh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AiAgAyAANgJUIAMgASACEKsEIQAgA0GQAWokACAAC1YBA38gACgCVCEDIAEgAyADQQAgAkGAAmoiBBCuBCIFIANrIAQgBRsiBCACIAQgAkkbIgIQYBogACADIARqIgQ2AlQgACAENgIIIAAgAyACajYCBCACC1kBAn8gAS0AACECAkAgAC0AACIDRQ0AIAMgAkH/AXFHDQADQCABLQABIQIgAC0AASIDRQ0BIAFBAWohASAAQQFqIQAgAyACQf8BcUYNAAsLIAMgAkH/AXFrC30BAn8jAEEQayIAJAACQCAAQQxqIABBCGoQEA0AQQAgACgCDEECdEEEahCLASIBNgLciAIgAUUNAAJAIAAoAggQiwEiAUUNAEEAKALciAIgACgCDEECdGpBADYCAEEAKALciAIgARARRQ0BC0EAQQA2AtyIAgsgAEEQaiQAC3ABA38CQCACDQBBAA8LQQAhAwJAIAAtAAAiBEUNAAJAA0AgAS0AACIFRQ0BIAJBf2oiAkUNASAEQf8BcSAFRw0BIAFBAWohASAALQABIQQgAEEBaiEAIAQNAAwCCwALIAQhAwsgA0H/AXEgAS0AAGsLiAEBBH8CQCAAQT0QlgEiASAARw0AQQAPC0EAIQICQCAAIAEgAGsiA2otAAANAEEAKALciAIiAUUNACABKAIAIgRFDQACQANAAkAgACAEIAMQswQNACABKAIAIANqIgQtAABBPUYNAgsgASgCBCEEIAFBBGohASAEDQAMAgsACyAEQQFqIQILIAIL/AIBA38CQCABLQAADQACQEG6EBC0BCIBRQ0AIAEtAAANAQsCQCAAQQxsQbCMAWoQtAQiAUUNACABLQAADQELAkBBwRAQtAQiAUUNACABLQAADQELQYYXIQELQQAhAgJAAkADQCABIAJqLQAAIgNFDQEgA0EvRg0BQRchAyACQQFqIgJBF0cNAAwCCwALIAIhAwtBhhchBAJAAkACQAJAAkAgAS0AACICQS5GDQAgASADai0AAA0AIAEhBCACQcMARw0BCyAELQABRQ0BCyAEQYYXELEERQ0AIARBoRAQsQQNAQsCQCAADQBB1IsBIQIgBC0AAUEuRg0CC0EADwsCQEEAKALkiAIiAkUNAANAIAQgAkEIahCxBEUNAiACKAIgIgINAAsLAkBBJBCLASICRQ0AIAJBACkC1IsB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DSAJIRYgFyERDAULIAwtAAEhDiAMQQFqIQwMAAsACyAADQggCkUNA0EBIQwCQANAIAQgDEECdGooAgAiDkUNASADIAxBA3RqIA4gAiAGEMIEQQEhCyAMQQFqIgxBCkcNAAwKCwALQQEhCyAMQQpPDQgDQCAEIAxBAnRqKAIADQFBASELIAxBAWoiDEEKRg0JDAALAAtBHCEWDAULIAkhFgsgFCAWIA1rIhIgFCASShsiFCAQQf////8Hc0oNAkE9IRYgEyAQIBRqIg8gEyAPShsiDCAOSg0DIABBICAMIA8gERDGBCAAIBggEBDABCAAQTAgDCAPIBFBgIAEcxDGBCAAQTAgFCASQQAQxgQgACANIBIQwAQgAEEgIAwgDyARQYDAAHMQxgQMAQsLQQAhCwwDC0E9IRYLEIoBIBY2AgALQX8hCwsgB0HQAGokACALCxkAAkAgAC0AAEEgcQ0AIAEgAiAAEKwBGgsLdAEDf0EAIQECQCAAKAIALAAAEIwEDQBBAA8LA0AgACgCACECQX8hAwJAIAFBzJmz5gBLDQBBfyACLAAAQVBqIgMgAUEKbCIBaiADIAFB/////wdzShshAwsgACACQQFqNgIAIAMhASACLAABEIwEDQALIAMLtgQAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkAgAUF3ag4SAAECBQMEBgcICQoLDA0ODxAREgsgAiACKAIAIgFBBGo2AgAgACABKAIANgIADwsgAiACKAIAIgFBBGo2AgAgACABNAIANwMADwsgAiACKAIAIgFBBGo2AgAgACABNQIANwMADwsgAiACKAIAIgFBBGo2AgAgACABNAIANwMADwsgAiACKAIAIgFBBGo2AgAgACABNQIANwMADwsgAiACKAIAQQdqQXhxIgFBCGo2AgAgACABKQMANwMADwsgAiACKAIAIgFBBGo2AgAgACABMgEANwMADwsgAiACKAIAIgFBBGo2AgAgACABMwEANwMADwsgAiACKAIAIgFBBGo2AgAgACABMAAANwMADwsgAiACKAIAIgFBBGo2AgAgACABMQAANwMADwsgAiACKAIAQQdqQXhxIgFBCGo2AgAgACABKQMANwMADwsgAiACKAIAIgFBBGo2AgAgACABNQIANwMADwsgAiACKAIAQQdqQXhxIgFB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AkACQCAARQ0AIAogARC5ByIBELoHIAIgCigCADYAACAKIAEQuwcgCCAKELICGiAKEJANGiAKIAEQvAcgByAKELICGiAKEJANGiADIAEQvQc6AAAgBCABEL4HOgAAIAogARC/ByAFIAoQsgIaIAoQkA0aIAogARDAByAGIAoQsgIaIAoQkA0aIAEQwQchAQwBCyAKIAEQwgciARDDByACIAooAgA2AAAgCiABEMQHIAggChCyAhogChCQDRogCiABEMUHIAcgChCyAhogChCQDRogAyABEMYHOgAAIAQgARDHBzoAACAKIAEQyAcgBSAKELICGiAKEJANGiAKIAEQyQcgBiAKELICGiAKEJANGiABEMoHIQELIAkgATYCACAKQRBqJAALFgAgACABKAIAEN0BwCABKAIAEMsHGgsHACAALAAACw4AIAAgARDMBzYCACAACwwAIAAgARDNB0EBcwsHACAAKAIACxEAIAAgACgCAEEBajYCACAACw0AIAAQzgcgARDMB2sLDAAgAEEAIAFrENAHCwsAIAAgASACEM8HC+EBAQZ/IwBBEGsiAyQAIAAQ0QcoAgAhBAJAAkAgAigCACAAEJ0HayIFEKQDQQF2Tw0AIAVBAXQhBQwBCxCkAyEFCyAFQQEgBRshBSABKAIAIQYgABCdByEHAkACQCAEQdgARw0AQQAhCAwBCyAAEJ0HIQgLAkAgCCAFEI0BIghFDQACQCAEQdgARg0AIAAQ0gcaCyADQdcANgIEIAAgA0EIaiAIIANBBGoQ9QUiBBDTBxogBBD5BRogASAAEJ0HIAYgB2tqNgIAIAIgABCdByAFajYCACADQRBqJAAPCxD/DAAL5AEBBn8jAEEQayIDJAAgABDUBygCACEEAkACQCACKAIAIAAQoQdrIgUQpANBAXZPDQAgBUEBdCEFDAELEKQDIQULIAVBBCAFGyEFIAEoAgAhBiAAEKEHIQcCQAJAIARB2ABHDQBBACEIDAELIAAQoQchCAsCQCAIIAUQjQEiCEUNAAJAIARB2ABGDQAgABDVBxoLIANB1wA2AgQgACADQQhqIAggA0EEahCgByIEENYHGiAEEK4HGiABIAAQoQcgBiAHa2o2AgAgAiAAEKEHIAVBfHFqNgIAIANBEGokAA8LEP8MAAsLACAAQQAQ2AcgAAsHACAAEOwMCwcAIAAQ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AQsgBSAFKAIAQQRyNgIAQQAhAAwDCyAAEJwCGiAKQQFqIQoMAAsAC0EBIQAgDBChByALKAKEAUYNAEEAIQAgC0EANgIQIA0gDBChByALKAKEASALQRBqEI0FAkAgCygCEEUNACAFIAUoAgBBBHI2AgAMAQtBASEACyAREKENGiAQEKENGiAPEKENGiAOEKENGiANEJANGiAMEK4HGgwDCyACIQELIANBAWohAwwACwALIAtBsARqJAAgAAsKACAAEOoHKAIACwcAIABBKGoLFgAgACABEPMMIgFBBGogAhC/AxogAQuyAgEBfyMAQRBrIgokAAJAAkAgAEUNACAKIAEQ+gciARD7ByACIAooAgA2AAAgCiABEPwHIAggChD9BxogChChDRogCiABEP4HIAcgChD9BxogChChDRogAyABEP8HNgIAIAQgARCACDYCACAKIAEQgQggBSAKELICGiAKEJANGiAKIAEQggggBiAKEP0HGiAKEKENGiABEIMIIQEMAQsgCiABEIQIIgEQhQggAiAKKAIANgAAIAogARCGCCAIIAoQ/QcaIAoQoQ0aIAogARCHCCAHIAoQ/QcaIAoQoQ0aIAMgARCICDYCACAEIAEQiQg2AgAgCiABEIoIIAUgChCyAhogChCQDRogCiABEIsIIAYgChD9BxogChChDRogARCMCCEBCyAJIAE2AgAgCkEQaiQACxUAIAAgASgCABCjAiABKAIAEI0IGgsHACAAKAIACw0AIAAQhgYgAUECdGoLDgAgACABEI4INgIAIAALDAAgACABEI8IQQFzCwcAIAAoAgALEQAgACAAKAIAQQRqNgIAIAALEAAgABCQCCABEI4Ia0ECdQsMACAAQQAgAWsQkggLCwAgACABIAIQkQgL5AEBBn8jAEEQayIDJAAgABCTCCgCACEEAkACQCACKAIAIAAQ2wdrIgUQpANBAXZPDQAgBUEBdCEFDAELEKQDIQULIAVBBCAFGyEFIAEoAgAhBiAAENsHIQcCQAJAIARB2ABHDQBBACEIDAELIAAQ2wchCAsCQCAIIAUQjQEiCEUNAAJAIARB2ABGDQAgABCUCBoLIANB1wA2AgQgACADQQhqIAggA0EEahCVBiIEEJUIGiAEEJgGGiABIAAQ2wcgBiAHa2o2AgAgAiAAENsHIAVBfHFqNgIAIANBEGokAA8LEP8MAAsHACAAEPQMC64CAQJ/IwBBwANrIgckACAHIAI2ArADIAcgATYCuAMgB0HYADYCFCAHQRhqIAdBIGogB0EUahCVBiEIIAdBEGogBBC3AyAHQRBqEJgCIQEgB0EAOgAPAkAgB0G4A2ogAiADIAdBEGogBBDQASAFIAdBD2ogASAIIAdBFGogB0GwA2oQ2gdFDQAgBhDsBwJAIActAA9FDQAgBiABQS0QswMQrA0LIAFBMBCzAyEBIAgQ2wchAiAHKAIUIgNBfGohBAJAA0AgAiAETw0BIAIoAgAgAUcNASACQQRqIQIMAAsACyAGIAIgAxDtBxoLAkAgB0G4A2ogB0GwA2oQmQJFDQAgBSAFKAIAQQJyNgIACyAHKAK4AyECIAdBEGoQxQkaIAgQmAYaIAdBwANqJAAgAgtnAQJ/IwBBEGsiASQAIAAQ7gcCQAJAIAAQwgZFDQAgABDvByECIAFBADYCDCACIAFBDGoQ8AcgAEEAEPEHDAELIAAQ8gchAiABQQA2AgggAiABQQhqEPAHIABBABDzBwsgAUEQaiQAC9MBAQR/IwBBEGsiAyQAIAAQtgUhBCAAEPQHIQUCQCABIAIQ9QciBkUNAAJAIAAgARD2Bw0AAkAgBSAEayAGTw0AIAAgBSAGIARqIAVrIAQgBEEAQQAQow0LIAAQhgYgBEECdGohBQJAA0AgASACRg0BIAUgARDwByABQQRqIQEgBUEEaiEFDAALAAsgA0EANgIAIAUgAxDwByAAIAYgBGoQ9wcMAQsgACADIAEgAiAAEPgHEPkHIgEQwAYgARC2BRCqDRogARChDRoLIANBEGokACAACwIACwoAIAAQmAcoAgALDAAgACABKAIANgIACwwAIAAQmAcgATYCBAsKACAAEJgHEI4LCy0BAX8gABCYByICIAItAAtBgAFxIAFyOgALIAAQmAciACAALQALQf8AcToACwsfAQF/QQEhAQJAIAAQwgZFDQAgABCcC0F/aiEBCyABCwkAIAAgARDECwsqAQF/QQAhAgJAIAAQwAYgAUsNACAAEMAGIAAQtgVBAnRqIAFPIQILIAILHAACQCAAEMIGRQ0AIAAgARDxBw8LIAAgARDzBwsHACAAEJALCzABAX8jAEEQayIEJAAgACAEQQhqIAMQxQsiAyABIAIQxgsgAxD2BCAEQRBqJAAgAwsLACAAQYiKAhD9BAsRACAAIAEgASgCACgCLBECAAsRACAAIAEgASgCACgCIBECAAsLACAAIAEQlgggAAsRACAAIAEgASgCACgCHBECAAsPACAAIAAoAgAoAgwRAAALDwAgACAAKAIAKAIQEQAACxEAIAAgASABKAIAKAIUEQIACxEAIAAgASABKAIAKAIYEQIACw8AIAAgACgCACgCJBEAAAsLACAAQYCKAhD9BAsRACAAIAEgASgCACgCLBECAAsRACAAIAEgASgCACgCIBECAAsRACAAIAEgASgCACgCHBECAAsPACAAIAAoAgAoAgwRAAALDwAgACAAKAIAKAIQEQAACxEAIAAgASABKAIAKAIUEQIACxEAIAAgASABKAIAKAIYEQIACw8AIAAgACgCACgCJBEAAAsSACAAIAI2AgQgACABNgIAIAALBwAgACgCAAsNACAAEJAIIAEQjghGCwcAIAAoAgALcwEBfyMAQSBrIgMkACADIAE2AhAgAyAANgIYIAMgAjYCCAJAA0AgA0EYaiADQRBqEIMGIgFFDQEgAyADQRhqEIQGIANBCGoQhAYQyAtFDQEgA0EYahCFBhogA0EIahCFBhoMAAsACyADQSBqJAAgAUEBcwsyAQF/IwBBEGsiAiQAIAIgACgCADYCCCACQQhqIAEQyQsaIAIoAgghACACQRBqJAAgAAsHACAAEKkICxoBAX8gABCoCCgCACEBIAAQqAhBADYCACABCyIAIAAgARCUCBCWBiABEJMIKAIAIQEgABCpCCABNgIAIAALfQECfyMAQRBrIgIkAAJAIAAQwgZFDQAgABD4ByAAEO8HIAAQnAsQmgsLIAAgARDKCyABEJgHIQMgABCYByIAQQhqIANBCGooAgA2AgAgACADKQIANwIAIAFBABDzByABEPIHIQAgAkEANgIMIAAgAkEMahDwByACQRBqJAALgQUBDH8jAEHQA2siByQAIAcgBTcDECAHIAY3AxggByAHQeACajYC3AIgB0HgAmpB5ABBzw0gB0EQahDQBCEIIAdB1wA2AvABQQAhCSAHQegBakEAIAdB8AFqEPUFIQogB0HXADYC8AEgB0HgAWpBACAHQfABahD1BSELIAdB8AFqIQwCQAJAIAhB5ABJDQAQqgUhCCAHIAU3AwAgByAGNwMIIAdB3AJqIAhBzw0gBxD2BSIIQX9GDQEgCiAHKALcAhD3BSALIAgQiwEQ9wUgC0EAEJgIDQEgCxCdByEMCyAHQdgBaiADELcDIAdB2AFqENEBIg0gBygC3AIiDiAOIAhqIAwQqQUaAkAgCEEBSA0AIAcoAtwCLQAAQS1GIQkLIAIgCSAHQdgBaiAHQdABaiAHQc8BaiAHQc4BaiAHQcABahCxAiIPIAdBsAFqELECIg4gB0GgAWoQsQIiECAHQZwBahCZCCAHQdcANgIwIAdBKGpBACAHQTBqEPUFIRECQAJAIAggBygCnAEiAkwNACAQEMMCIAggAmtBAXRqIA4QwwJqIAcoApwBakEBaiESDAELIBAQwwIgDhDDAmogBygCnAFqQQJqIRILIAdBMGohAgJAIBJB5QBJDQAgESASEIsBEPcFIBEQnQciAkUNAQsgAiAHQSRqIAdBIGogAxDQASAMIAwgCGogDSAJIAdB0AFqIAcsAM8BIAcsAM4BIA8gDiAQIAcoApwBEJoIIAEgAiAHKAIkIAcoAiAgAyAEEEkhCCAREPkFGiAQEJANGiAOEJANGiAPEJANGiAHQdgBahDFCRogCxD5BRogChD5BRogB0HQA2okACAIDwsQ/wwACwoAIAAQmwhBAXML8gIBAX8jAEEQayIKJAACQAJAIABFDQAgAhC5ByECAkACQCABRQ0AIAogAhC6ByADIAooAgA2AAAgCiACELsHIAggChCyAhogChCQDRoMAQsgCiACEJwIIAMgCigCADYAACAKIAIQvAcgCCAKELICGiAKEJANGgsgBCACEL0HOgAAIAUgAhC+BzoAACAKIAIQvwcgBiAKELICGiAKEJANGiAKIAIQwAcgByAKELICGiAKEJANGiACEMEHIQIMAQsgAhDCByECAkACQCABRQ0AIAogAhDDByADIAooAgA2AAAgCiACEMQHIAggChCyAhogChCQDRoMAQsgCiACEJ0IIAMgCigCADYAACAKIAIQxQcgCCAKELICGiAKEJANGgsgBCACEMYHOgAAIAUgAhDHBzoAACAKIAIQyAcgBiAKELICGiAKEJANGiAKIAIQyQcgByAKELICGiAKEJANGiACEMoHIQILIAkgAjYCACAKQRBqJAALnQYBCn8jAEEQayIPJAAgAiAANgIAIANBgARxIRBBACERA0ACQCARQQRHDQACQCANEMMCQQFNDQAgDyANEJ4INgIIIAIgD0EIakEBEJ8IIA0QoAggAigCABChCDYCAAsCQCADQbABcSISQRBGDQACQCASQSBHDQAgAigCACEACyABIAA2AgALIA9BEGokAA8LAkACQAJAAkACQAJAIAggEWosAAAOBQABAwIEBQsgASACKAIANgIADAQLIAEgAigCADYCACAGQSAQsQMhEiACIAIoAgAiE0EBajYCACATIBI6AAAMAwsgDRCDBQ0CIA1BABCCBS0AACESIAIgAigCACITQQFqNgIAIBMgEjoAAAwCCyAMEIMFIRIgEEUNASASDQEgAiAMEJ4IIAwQoAggAigCABChCDYCAAwBCyACKAIAIRQgBCAHaiIEIRICQANAIBIgBU8NASAGQcAAIBIsAAAQ1AFFDQEgEkEBaiESDAALAAsgDiETAkAgDkEBSA0AAkADQCASIARNDQEgE0UNASASQX9qIhItAAAhFSACIAIoAgAiFkEBajYCACAWIBU6AAAgE0F/aiETDAALAAsCQAJAIBMNAEEAIRYMAQsgBkEwELEDIRYLAkADQCACIAIoAgAiFUEBajYCACATQQFIDQEgFSAWOgAAIBNBf2ohEwwACwALIBUgCToAAAsCQAJAIBIgBEcNACAGQTAQsQMhEiACIAIoAgAiE0EBajYCACATIBI6AAAMAQsCQAJAIAsQgwVFDQAQogghFwwBCyALQQAQggUsAAAhFwtBACETQQAhGANAIBIgBEYNAQJAAkAgEyAXRg0AIBMhFgwBCyACIAIoAgAiFUEBajYCACAVIAo6AABBACEWAkAgGEEBaiIYIAsQwwJJDQAgEyEXDAELAkAgCyAYEIIFLQAAEOcGQf8BcUcNABCiCCEXDAELIAsgGBCCBSwAACEXCyASQX9qIhItAAAhEyACIAIoAgAiFUEBajYCACAVIBM6AAAgFkEBaiETDAALAAsgFCACKAIAEJ4GCyARQQFqIREMAAsACw0AIAAQrwcoAgBBAEcLEQAgACABIAEoAgAoAigRAgALEQAgACABIAEoAgAoAigRAgALKgEBfyMAQRBrIgEkACABQQhqIAAgABCrAxCzCCgCACEAIAFBEGokACAACzIBAX8jAEEQayICJAAgAiAAKAIANgIIIAJBCGogARC1CBogAigCCCEAIAJBEGokACAACzABAX8jAEEQayIBJAAgAUEIaiAAIAAQqwMgABDDAmoQswgoAgAhACABQRBqJAAgAAsrAQF/IwBBEGsiAyQAIANBCGogACABIAIQsgggAygCDCECIANBEGokACACCwUAELQIC68DAQh/IwBBwAFrIgYkACAGQbgBaiADELcDIAZBuAFqENEBIQdBACEIAkAgBRDDAkUNACAFQQAQggUtAAAgB0EtELEDQf8BcUYhCAsgAiAIIAZBuAFqIAZBsAFqIAZBrwFqIAZBrgFqIAZBoAFqELECIgkgBkGQAWoQsQIiCiAGQYABahCxAiILIAZB/ABqEJkIIAZB1wA2AhAgBkEIakEAIAZBEGoQ9QUhDAJAAkAgBRDDAiAGKAJ8TA0AIAUQwwIhAiAGKAJ8IQ0gCxDDAiACIA1rQQF0aiAKEMMCaiAGKAJ8akEBaiENDAELIAsQwwIgChDDAmogBigCfGpBAmohDQsgBkEQaiECAkAgDUHlAEkNACAMIA0QiwEQ9wUgDBCdByICDQAQ/wwACyACIAZBBGogBiADENABIAUQxwIgBRDHAiAFEMMCaiAHIAggBkGwAWogBiwArwEgBiwArgEgCSAKIAsgBigCfBCaCCABIAIgBigCBCAGKAIAIAMgBBBJIQUgDBD5BRogCxCQDRogChCQDRogCRCQDRogBkG4AWoQxQkaIAZBwAFqJAAgBQuLBQEMfyMAQbAIayIHJAAgByAFNwMQIAcgBjcDGCAHIAdBwAdqNgK8ByAHQcAHakHkAEHPDSAHQRBqENAEIQggB0HXADYCoARBACEJIAdBmARqQQAgB0GgBGoQ9QUhCiAHQdcANgKgBCAHQZAEakEAIAdBoARqEJUGIQsgB0GgBGohDAJAAkAgCEHkAEkNABCqBSEIIAcgBTcDACAHIAY3AwggB0G8B2ogCEHPDSAHEPYFIghBf0YNASAKIAcoArwHEPcFIAsgCEECdBCLARCWBiALQQAQpQgNASALENsHIQwLIAdBiARqIAMQtwMgB0GIBGoQmAIiDSAHKAK8ByIOIA4gCGogDBDRBRoCQCAIQQFIDQAgBygCvActAABBLUYhCQsgAiAJIAdBiARqIAdBgARqIAdB/ANqIAdB+ANqIAdB6ANqELECIg8gB0HYA2oQgAciDiAHQcgDahCAByIQIAdBxANqEKYIIAdB1wA2AjAgB0EoakEAIAdBMGoQlQYhEQJAAkAgCCAHKALEAyICTA0AIBAQtgUgCCACa0EBdGogDhC2BWogBygCxANqQQFqIRIMAQsgEBC2BSAOELYFaiAHKALEA2pBAmohEgsgB0EwaiECAkAgEkHlAEkNACARIBJBAnQQiwEQlgYgERDbByICRQ0BCyACIAdBJGogB0EgaiADENABIAwgDCAIQQJ0aiANIAkgB0GABGogBygC/AMgBygC+AMgDyAOIBAgBygCxAMQpwggASACIAcoAiQgBygCICADIAQQjAYhCCAREJgGGiAQEKENGiAOEKENGiAPEJANGiAHQYgEahDFCRogCxCYBhogChD5BRogB0GwCGokACAIDwsQ/wwACwoAIAAQqghBAXML8gIBAX8jAEEQayIKJAACQAJAIABFDQAgAhD6ByECAkACQCABRQ0AIAogAhD7ByADIAooAgA2AAAgCiACEPwHIAggChD9BxogChChDRoMAQsgCiACEKsIIAMgCigCADYAACAKIAIQ/gcgCCAKEP0HGiAKEKENGgsgBCACEP8HNgIAIAUgAhCACDYCACAKIAIQgQggBiAKELICGiAKEJANGiAKIAIQggggByAKEP0HGiAKEKENGiACEIMIIQIMAQsgAhCECCECAkACQCABRQ0AIAogAhCFCCADIAooAgA2AAAgCiACEIYIIAggChD9BxogChChDRoMAQsgCiACEKwIIAMgCigCADYAACAKIAIQhwggCCAKEP0HGiAKEKENGgsgBCACEIgINgIAIAUgAhCJCDYCACAKIAIQigggBiAKELICGiAKEJANGiAKIAIQiwggByAKEP0HGiAKEKENGiACEIwIIQILIAkgAjYCACAKQRBqJAALvwYBCn8jAEEQayIPJAAgAiAANgIAIANBgARxIRAgB0ECdCERQQAhEgNAAkAgEkEERw0AAkAgDRC2BUEBTQ0AIA8gDRCtCDYCCCACIA9BCGpBARCuCCANEK8IIAIoAgAQsAg2AgALAkAgA0GwAXEiB0EQRg0AAkAgB0EgRw0AIAIoAgAhAAsgASAANgIACyAPQRBqJAAPCwJAAkACQAJAAkACQCAIIBJqLAAADgUAAQMCBAULIAEgAigCADYCAAwECyABIAIoAgA2AgAgBkEgELMDIQcgAiACKAIAIhNBBGo2AgAgEyAHNgIA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EOgEEIENCwoAIAAQ6AQQgQ0LCgAgABDoBBCBDQsKACAAEOgEEIENCwkAIAAgARD+CgsHACABIABrCwQAIAALBwAgABCKCwsJACAAIAEQjAsLGQAgABCUBxCNCyIAIAAQpANBAXZLdkFwagsHACAAQQJJCy0BAX9BASEBAkAgAEECSQ0AIABBAWoQkQsiACAAQX9qIgAgAEECRhshAQsgAQsZACABIAIQjwshASAAIAI2AgQgACABNgIACwIACwwAIAAQmAcgATYCAAs6AQF/IAAQmAciAiACKAIIQYCAgIB4cSABQf////8HcXI2AgggABCYByIAIAAoAghBgICAgHhyNgIICwgAQZQNEDwACwcAIAAQiwsLBAAgAAsKACABIABrQQJ1CwgAEKQDQQJ2CwQAIAALHAACQCAAEI0LIAFPDQAQJgALIAFBAnRBBBCoAwsHACAAEJULCwoAIABBA2pBfHELBwAgABCTCwsEACAACwQAIAALBAAgAAsSACAAIAAQtwIQuAIgARCXCxoLOAEBfyMAQRBrIgMkACAAIAIQtgcgACACEJkLIANBADoADyABIAJqIANBD2oQiwMgA0EQaiQAIAALBAAgAAsCAAsLACAAIAEgAhCbCwsOACABIAJBAnRBBBCPAwsRACAAEJcHKAIIQf////8HcQsEACAAC2EBAX8jAEEQayICJAAgAiAANgIMAkAgACABRg0AA0AgAiABQX9qIgE2AgggACABTw0BIAJBDGogAkEIahCfCyACIAIoAgxBAWoiADYCDCACKAIIIQEMAAsACyACQRBqJAALDwAgACgCACABKAIAEKALCwkAIAAgARDcBgthAQF/IwBBEGsiAiQAIAIgADYCDAJAIAAgAUYNAANAIAIgAUF8aiIBNgIIIAAgAU8NASACQQxqIAJBCGoQogsgAiACKAIMQQRqIgA2AgwgAigCCCEBDAALAAsgAkEQaiQACw8AIAAoAgAgASgCABCjCwsJACAAIAEQpAsLHAEBfyAAKAIAIQIgACABKAIANgIAIAEgAjYCAAsKACAAEJcHEKYLCwQAIAALCwAgACABIAIQrQsLBwAgABCvCwtsAQF/IwBBEGsiBCQAIAQgATYCBCAEIAM2AggCQANAIAEgAkYNASABLAAAIQMgBEEIahD2ASADEPcBGiAEIAFBAWoiATYCBCAEQQhqEPgBGgwACwALIAAgBEEEaiAEQQhqEK4LGiAEQRBqJAALCQAgACABELALCwkAIAAgARCxCwsMACAAIAEgAhCuCxoLOAEBfyMAQRBrIgMkACADIAEQ2gI2AgwgAyACENoCNgIIIAAgA0EMaiADQQhqELILGiADQRBqJAALGAAgACABKAIANgIAIAAgAigCADYCBCAACwQAIAALCQAgACABEN0CCwQAIAELGAAgACABKAIANgIAIAAgAigCADYCBCAACwsAIAAgASACELkLCwcAIAAQuwsLbAEBfyMAQRBrIgQkACAEIAE2AgQgBCADNgIIAkADQCABIAJGDQEgASgCACEDIARBCGoQrQIgAxCuAhogBCABQQRqIgE2AgQgBEEIahCvAhoMAAsACyAAIARBBGogBEEIahC6CxogBEEQaiQACwkAIAAgARC8CwsJACAAIAEQvQsLDAAgACABIAIQugsaCzgBAX8jAEEQayIDJAAgAyABEO0CNgIMIAMgAhDtAjYCCCAAIANBDGogA0EIahC+CxogA0EQaiQACxgAIAAgASgCADYCACAAIAIoAgA2AgQgAAsEACAACwkAIAAgARDwAgsEACABCxgAIAAgASgCADYCACAAIAIoAgA2AgQgAAsYACAAEJgHIgBCADcCACAAQQhqQQA2AgALBAAgAAsEACAACw0AIAEtAAAgAi0AAEYLEQAgACAAKAIAIAFqNgIAIAALCgAgASAAa0ECdQsMACAAEP8KIAIQxwsLvwEBA38jAEEQayIDJAACQCABIAIQ9QciBCAAEIILSw0AAkACQCAEEIMLRQ0AIAAgBBDzByAAEPIHIQUMAQsgA0EIaiAAEPgHIAQQhAtBAWoQhQsgAygCCCIFIAMoAgwQhgsgACAFEIcLIAAgAygCDBCICyAAIAQQ8QcLAkADQCABIAJGDQEgBSABEPAHIAVBBGohBSABQQRqIQEMAAsACyADQQA2AgQgBSADQQRqEPAHIANBEGokAA8LIAAQiQsACwQAIAALDQAgASgCACACKAIARgsUACAAIAAoAgAgAUECdGo2AgAgAAsJACAAIAEQywsLDgAgARD4BxogABD4BxoLCwAgACABIAIQzwsLCQAgACABENELCwwAIAAgASACENALGgs4AQF/IwBBEGsiAyQAIAMgARDSCzYCDCADIAIQ0gs2AgggACADQQxqIANBCGoQ5QIaIANBEGokAAsYACAAIAEoAgA2AgAgACACKAIANgIEIAALCQAgACABENcLCwcAIAAQ0wsLJwEBfyMAQRBrIgEkACABIAA2AgggAUEIahDUCyEAIAFBEGokACAACwcAIAAQ1QsLCgAgACgCABDWCwsqAQF/IwBBEGsiASQAIAEgADYCCCABQQhqEM4HEOcCIQAgAUEQaiQAIAALCQAgACABENgLCzIBAX8jAEEQayICJAAgAiAANgIIIAJBCGogASACQQhqENQLaxCfCCEAIAJBEGokACAACwsAIAAgASACENwLCwkAIAAgARDeCwsMACAAIAEgAhDdCxoLOAEBfyMAQRBrIgMkACADIAEQ3ws2AgwgAyACEN8LNgIIIAAgA0EMaiADQQhqEPgCGiADQRBqJAALGAAgACABKAIANgIAIAAgAigCADYCBCAACwkAIAAgARDkCwsHACAAEOALCycBAX8jAEEQayIBJAAgASAANgIIIAFBCGoQ4QshACABQRBqJAAgAAsHACAAEOILCwoAIAAoAgAQ4wsLKgEBfyMAQRBrIgEkACABIAA2AgggAUEIahCQCBD6AiEAIAFBEGokACAACwkAIAAgARDlCws1AQF/IwBBEGsiAiQAIAIgADYCCCACQQhqIAEgAkEIahDhC2tBAnUQrgghACACQRBqJAAgAAsLACAAQQA2AgAgAAsHACAAEPMLCxIAIABBADoABCAAIAE2AgAgAAs9AQF/IwBBEGsiASQAIAEgABD0CxD1CzYCDCABEOIBNgIIIAFBDGogAUEIahDPAigCACEAIAFBEGokACAACwgAQbwKEDwACwoAIABBCGoQ9wsLGwAgASACQQAQ9gshASAAIAI2AgQgACABNgIACwoAIABBCGoQ+AsLMwAgACAAEPkLIAAQ+QsgABD6C0ECdGogABD5CyAAEPoLQQJ0aiAAEPkLIAFBAnRqEPsLCyQAIAAgATYCACAAIAEoAgQiATYCBCAAIAEgAkECdGo2AgggAAsRACAAKAIAIAAoAgQ2AgQgAAsEACAACwgAIAEQiAwaCwsAIABBADoAeCAACwoAIABBCGoQ/QsLBwAgABD8CwtGAQF/IwBBEGsiAyQAAkACQCABQR5LDQAgAC0AeEH/AXENACAAQQE6AHgMAQsgA0EIahD/CyABEIAMIQALIANBEGokACAACwoAIABBCGoQgwwLBwAgABCEDAsKACAAKAIAEPELCxMAIAAQhQwoAgAgACgCAGtBAnULAgALCABB/////wMLCgAgAEEIahD+CwsEACAACwcAIAAQgQwLHAACQCAAEIIMIAFPDQAQJgALIAFBAnRBBBCoAwsEACAACwgAEKQDQQJ2CwQAIAALBAAgAAsKACAAQQhqEIYMCwcAIAAQhwwLBAAgAAsLACAAQQA2AgAgAAs2ACAAIAAQ+QsgABD5CyAAEPoLQQJ0aiAAEPkLIAAQiQlBAnRqIAAQ+QsgABD6C0ECdGoQ+wsLAgALCwAgACABIAIQjQwLNAEBfyAAKAIEIQICQANAIAIgAUYNASAAEOsLIAJBfGoiAhDxCxCODAwACwALIAAgATYCBAs5AQF/IwBBEGsiAyQAAkACQCABIABHDQAgAUEAOgB4DAELIANBCGoQ/wsgASACEJEMCyADQRBqJAALBwAgARCPDAsHACAAEJAMCwIACw4AIAEgAkECdEEEEI8DC2EBAn8jAEEQayICJAAgAiABNgIMAkAgABDpCyIDIAFJDQACQCAAEPoLIgEgA0EBdk8NACACIAFBAXQ2AgggAkEIaiACQQxqELgDKAIAIQMLIAJBEGokACADDwsgABDqCwALAgALBwAgABCXDAsJACAAIAEQmQwLDAAgACABIAIQmAwaCwcAIAAQ8QsLGAAgACABKAIANgIAIAAgAigCADYCBCAACw0AIAAgASAAEPELa2oLiAEBAn8jAEEQayIEJABBACEFIARBADYCDCAAQQxqIARBDGogAxCeDBoCQAJAIAENAEEAIQEMAQsgBCAAEJ8MIAEQ7AsgBCgCBCEBIAQoAgAhBQsgACAFNgIAIAAgBSACQQJ0aiIDNgIIIAAgAzYCBCAAEKAMIAUgAUECdGo2AgAgBEEQaiQAIAALXwECfyMAQRBrIgIkACACIABBCGogARChDCIBKAIAIQMCQANAIAMgASgCBEYNASAAEJ8MIAEoAgAQ8QsQ8gsgASABKAIAQQRqIgM2AgAMAAsACyABEKIMGiACQRBqJAALrQEBBX8jAEEgayICJAAgABCJDCAAEOsLIQMgAkEQaiAAKAIEEKMMIQQgAkEIaiAAKAIAEKMMIQUgAiABKAIEEKMMIQYgAiADIAQoAgAgBSgCACAGKAIAEKQMNgIYIAEgAkEYahClDDYCBCAAIAFBBGoQpgwgAEEEaiABQQhqEKYMIAAQ7QsgARCgDBCmDCABIAEoAgQ2AgAgACAAEIkJEO4LIAAQjAkgAkEgaiQACyYAIAAQpwwCQCAAKAIARQ0AIAAQnwwgACgCACAAEKgMEIsMCyAACxYAIAAgARDmCyIBQQRqIAIQqQwaIAELCgAgAEEMahCqDAsKACAAQQxqEKsMCysBAX8gACABKAIANgIAIAEoAgAhAyAAIAE2AgggACADIAJBAnRqNgIEIAALEQAgACgCCCAAKAIANgIAIAALCwAgACABNgIAIAALCwAgASACIAMQrQwLBwAgACgCAAscAQF/IAAoAgAhAiAAIAEoAgA2AgAgASACNgIACwwAIAAgACgCBBC5DAsTACAAELoMKAIAIAAoAgBrQQJ1CwsAIAAgATYCACAACwoAIABBBGoQrAwLBwAgABCEDAsHACAAKAIACysBAX8jAEEQayIDJAAgA0EIaiAAIAEgAhCuDCADKAIMIQIgA0EQaiQAIAILWAEBfyMAQSBrIgQkACAEQRhqIAEQrwwgAhCvDCADEK8MELAMIAQgASAEKAIYELEMNgIQIAQgAyAEKAIcELEMNgIIIAAgBEEQaiAEQQhqELIMIARBIGokAAsHACAAELUMC3kBAX8jAEEgayIEJAAgBCACNgIQIAQgATYCGCAEIAM2AgggBEEYahClDBCUDCECIAQgBEEQahClDBCUDCIBIAIgBEEIahClDBCUDCABIAJraiIBELMMIAAgBEEQaiAEIARBCGoQpQwgARCVDBCjDBC0DCAEQSBqJAALCQAgACABELcMCwwAIAAgASACELYMGgtDAQJ/IwBBEGsiBCQAIAMgASACIAFrIgUQYSEBIAQgAjYCDCAEIAEgBWo2AgggACAEQQxqIARBCGoQlgwgBEEQaiQACwwAIAAgASACELgMGgsEACAACxgAIAAgASgCADYCACAAIAIoAgA2AgQgAAsEACABCxgAIAAgASgCADYCACAAIAIoAgA2AgQgAAsJACAAIAEQuwwLCgAgAEEMahC8DAs3AQJ/AkADQCAAKAIIIAFGDQEgABCfDCECIAAgACgCCEF8aiIDNgIIIAIgAxDxCxCODAwACwALCwcAIAAQhwwLYQEBfyMAQRBrIgIkACACIAA2AgwCQCAAIAFGDQADQCACIAFBfGoiATYCCCAAIAFPDQEgAkEMaiACQQhqEL4MIAIgAigCDEEEaiIANgIMIAIoAgghAQwACwALIAJBEGokAAsPACAAKAIAIAEoAgAQvwwLCQAgACABELoCCzsBAX8jAEEQayIDJAAgACACEPcHIAAgAhDiCiADQQA2AgwgASACQQJ0aiADQQxqEPAHIANBEGokACAACwQAIAALBAAgAAsEACAACwQAIAALBAAgAAsQACAAQZjeAUEIajYCACAACxAAIABBvN4BQQhqNgIAIAALDAAgABCqBTYCACAACwQAIAALDgAgACABKAIANgIAIAALCAAgABCzCRoLBAAgAAsJACAAIAEQzwwLBwAgABDQDAsLACAAIAE2AgAgAAsNACAAKAIAENEMENIMCwcAIAAQ1AwLBwAgABDTDAs/AQJ/IAAoAgAgAEEIaigCACIBQQF1aiECIAAoAgQhAAJAIAFBAXFFDQAgAigCACAAaigCACEACyACIAARBAALBwAgACgCAAsWACAAIAEQ2AwiAUEEaiACEL8DGiABCwcAIAAQ2QwLCgAgAEEEahDAAwsOACAAIAEoAgA2AgAgAAsEACAACwoAIAEgAGtBDG0LCwAgACABIAIQ3wQLBQAQ3QwLCABBgICAgHgLBQAQ4AwLBQAQ4QwLDQBCgICAgICAgICAfwsNAEL///////////8ACwsAIAAgASACEN0ECwUAEOQMCwYAQf//AwsFABDmDAsEAEJ/CwwAIAAgARCqBRDkBAsMACAAIAEQqgUQ5QQLPQIBfwF+IwBBEGsiAyQAIAMgASACEKoFEOYEIAMpAwAhBCAAIANBCGopAwA3AwggACAENwMAIANBEGokAAsKACABIABrQQxtCw4AIAAgASgCADYCACAACwQAIAALBAAgAAsOACAAIAEoAgA2AgAgAAsHACAAEPEMCwoAIABBBGoQwAMLBAAgAAsEACAACw4AIAAgASgCADYCACAACwQAIAALBAAgAAsEACAACwMAAAsHACAAEJ8BCwcAIAAQoAELbQBB4JgCEPgMGgJAA0AgACgCAEEBRw0BQfiYAkHgmAIQ+wwaDAALAAsCQCAAKAIADQAgABD8DEHgmAIQ+QwaIAEgAhEEAEHgmAIQ+AwaIAAQ/QxB4JgCEPkMGkH4mAIQ/gwaDwtB4JgCEPkMGgsJACAAIAEQoQELCQAgAEEBNgIACwkAIABBfzYCAAsHACAAEKIBCwUAEA8ACzMBAX8gAEEBIAAbIQECQANAIAEQiwEiAA0BAkAQuQ0iAEUNACAAEQcADAELCxAPAAsgAAsHACAAEIwBCwcAIAAQgQ0LPAECfyABQQQgAUEESxshAiAAQQEgABshAAJAA0AgAiAAEIQNIgMNARC5DSIBRQ0BIAERBwAMAAsACyADCzEBAX8jAEEQayICJAAgAkEANgIMIAJBDGogACABEJABGiACKAIMIQEgAkEQaiQAIAELBwAgABCGDQsHACAAEIwBCxAAIABB5OQBQQhqNgIAIAALOwECfyABEIkBIgJBDWoQgA0iA0EANgIIIAMgAjYCBCADIAI2AgAgACADEIkNIAEgAkEBahBgNgIAIAALBwAgAEEMagsgACAAEIcNIgBB1OUBQQhqNgIAIABBBGogARCIDRogAAsEAEEBC5EBAQN/IwBBEGsiAiQAIAIgAToADwJAAkAgACgCECIDDQBBfyEDIAAQqwENASAAKAIQIQMLAkAgACgCFCIEIANGDQAgACgCUCABQf8BcSIDRg0AIAAgBEEBajYCFCAEIAE6AAAMAQtBfyEDIAAgAkEPakEBIAAoAiQRAwBBAUcNACACLQAPIQMLIAJBEGokACADCwsAIAAgASACEI8NC8ACAQN/IwBBEGsiCCQAAkAgABCaAyIJIAFBf3NqIAJJDQAgABC3AiEKAkAgCUEBdkFwaiABTQ0AIAggAUEBdDYCDCAIIAIgAWo2AgAgCCAIQQxqELgDKAIAEJwDQQFqIQkLIAggABC+AiAJEJ0DIAgoAgAiCSAIKAIEEJ4DIAAQvAICQCAERQ0AIAkQuAIgChC4AiAEELwBGgsCQCAGRQ0AIAkQuAIgBGogByAGELwBGgsgAyAFIARqIgdrIQICQCADIAdGDQAgCRC4AiAEaiAGaiAKELgCIARqIAVqIAIQvAEaCwJAIAFBAWoiAUELRg0AIAAQvgIgCiABEIgDCyAAIAkQnwMgACAIKAIEEKADIAAgBiAEaiACaiIEEKEDIAhBADoADCAJIARqIAhBDGoQiwMgCEEQaiQADwsgABBKAAsKACAAIAEgAhBhCyYAIAAQkQ0CQCAAELsCRQ0AIAAQvgIgABCEAyAAEMoCEIgDCyAACwIAC/4BAQN/IwBBEGsiByQAAkAgABCaAyIIIAFrIAJJDQAgABC3AiEJAkAgCEEBdkFwaiABTQ0AIAcgAUEBdDYCDCAHIAIgAWo2AgAgByAHQQxqELgDKAIAEJwDQQFqIQgLIAcgABC+AiAIEJ0DIAcoAgAiCCAHKAIEEJ4DIAAQvAICQCAERQ0AIAgQuAIgCRC4AiAEELwBGgsCQCAFIARqIgIgA0YNACAIELgCIARqIAZqIAkQuAIgBGogBWogAyACaxC8ARoLAkAgAUEBaiIBQQtGDQAgABC+AiAJIAEQiAMLIAAgCBCfAyAAIAcoAgQQoAMgB0EQaiQADwsgABBKAAsqAQF/IwBBEGsiAyQAIAMgAjoADyAAIAEgA0EPahCUDRogA0EQaiQAIAALDgAgACABEJgLIAIQrQ0LogEBAn8jAEEQayIDJAACQCAAEJoDIAJJDQACQAJAIAIQmwNFDQAgACACEIoDIAAQhQMhBAwBCyADQQhqIAAQvgIgAhCcA0EBahCdAyADKAIIIgQgAygCDBCeAyAAIAQQnwMgACADKAIMEKADIAAgAhChAwsgBBC4AiABIAIQvAEaIANBADoAByAEIAJqIANBB2oQiwMgA0EQaiQADwsgABBKAAuRAQECfyMAQRBrIgMkAAJAAkACQCACEJsDRQ0AIAAQhQMhBCAAIAIQigMMAQsgABCaAyACSQ0BIANBCGogABC+AiACEJwDQQFqEJ0DIAMoAggiBCADKAIMEJ4DIAAgBBCfAyAAIAMoAgwQoAMgACACEKEDCyAEELgCIAEgAkEBahC8ARogA0EQaiQADwsgABBKAAtMAQJ/AkAgABDEAiIDIAJJDQAgABC3AhC4AiIDIAEgAhCNDRogACADIAIQlwsPCyAAIAMgAiADayAAEMMCIgRBACAEIAIgARCODSAACw4AIAAgASABELUDEJcNC4UBAQN/IwBBEGsiAyQAAkACQCAAEMQCIgQgABDDAiIFayACSQ0AIAJFDQEgABC3AhC4AiIEIAVqIAEgAhC8ARogACAFIAJqIgIQtgcgA0EAOgAPIAQgAmogA0EPahCLAwwBCyAAIAQgBSACaiAEayAFIAVBACACIAEQjg0LIANBEGokACAAC6IBAQJ/IwBBEGsiAyQAAkAgABCaAyABSQ0AAkACQCABEJsDRQ0AIAAgARCKAyAAEIUDIQQMAQsgA0EIaiAAEL4CIAEQnANBAWoQnQMgAygCCCIEIAMoAgwQngMgACAEEJ8DIAAgAygCDBCgAyAAIAEQoQMLIAQQuAIgASACEJMNGiADQQA6AAcgBCABaiADQQdqEIsDIANBEGokAA8LIAAQSgALwgEBA38jAEEQayICJAAgAiABOgAPAkACQCAAELsCIgMNAEEKIQQgABDJAiEBDAELIAAQygJBf2ohBCAAEMgCIQELAkACQAJAIAEgBEcNACAAIARBASAEIARBAEEAEJINIAAQtwIaDAELIAAQtwIaIAMNACAAEIUDIQQgACABQQFqEIoDDAELIAAQhAMhBCAAIAFBAWoQoQMLIAQgAWoiACACQQ9qEIsDIAJBADoADiAAQQFqIAJBDmoQiwMgAkEQaiQAC4IBAQR/IwBBEGsiAyQAAkAgAUUNACAAEMQCIQQgABDDAiIFIAFqIQYCQCAEIAVrIAFPDQAgACAEIAYgBGsgBSAFQQBBABCSDQsgABC3AiIEELgCIAVqIAEgAhCTDRogACAGELYHIANBADoADyAEIAZqIANBD2oQiwMLIANBEGokACAACygBAX8CQCAAEMMCIgMgAU8NACAAIAEgA2sgAhCcDRoPCyAAIAEQlgsLCwAgACABIAIQoA0L0gIBA38jAEEQayIIJAACQCAAEIILIgkgAUF/c2ogAkkNACAAEIYGIQoCQCAJQQF2QXBqIAFNDQAgCCABQQF0NgIMIAggAiABajYCACAIIAhBDGoQuAMoAgAQhAtBAWohCQsgCCAAEPgHIAkQhQsgCCgCACIJIAgoAgQQhgsgABDuBwJAIARFDQAgCRD7AiAKEPsCIAQQhQIaCwJAIAZFDQAgCRD7AiAEQQJ0aiAHIAYQhQIaCyADIAUgBGoiB2shAgJAIAMgB0YNACAJEPsCIARBAnQiA2ogBkECdGogChD7AiADaiAFQQJ0aiACEIUCGgsCQCABQQFqIgFBAkYNACAAEPgHIAogARCaCwsgACAJEIcLIAAgCCgCBBCICyAAIAYgBGogAmoiBBDxByAIQQA2AgwgCSAEQQJ0aiAIQQxqEPAHIAhBEGokAA8LIAAQiQsACw0AIAAgASACQQJ0EGELJgAgABCiDQJAIAAQwgZFDQAgABD4ByAAEO8HIAAQnAsQmgsLIAALAgALigIBA38jAEEQayIHJAACQCAAEIILIgggAWsgAkkNACAAEIYGIQkCQCAIQQF2QXBqIAFNDQAgByABQQF0NgIMIAcgAiABajYCACAHIAdBDGoQuAMoAgAQhAtBAWohCAsgByAAEPgHIAgQhQsgBygCACIIIAcoAgQQhgsgABDuBwJAIARFDQAgCBD7AiAJEPsCIAQQhQIaCwJAIAUgBGoiAiADRg0AIAgQ+wIgBEECdCIEaiAGQQJ0aiAJEPsCIARqIAVBAnRqIAMgAmsQhQIaCwJAIAFBAWoiAUECRg0AIAAQ+AcgCSABEJoLCyAAIAgQhwsgACAHKAIEEIgLIAdBEGokAA8LIAAQiQsACyoBAX8jAEEQayIDJAAgAyACNgIMIAAgASADQQxqEKUNGiADQRBqJAAgAAsOACAAIAEQmAsgAhCuDQumAQECfyMAQRBrIgMkAAJAIAAQggsgAkkNAAJAAkAgAhCDC0UNACAAIAIQ8wcgABDyByEEDAELIANBCGogABD4ByACEIQLQQFqEIULIAMoAggiBCADKAIMEIYLIAAgBBCHCyAAIAMoAgwQiAsgACACEPEHCyAEEPsCIAEgAhCFAhogA0EANgIEIAQgAkECdGogA0EEahDwByADQRBqJAAPCyAAEIkLAAuSAQECfyMAQRBrIgMkAAJAAkACQCACEIMLRQ0AIAAQ8gchBCAAIAIQ8wcMAQsgABCCCyACSQ0BIANBCGogABD4ByACEIQLQQFqEIULIAMoAggiBCADKAIMEIYLIAAgBBCHCyAAIAMoAgwQiAsgACACEPEHCyAEEPsCIAEgAkEBahCFAhogA0EQaiQADwsgABCJCwALTAECfwJAIAAQ9AciAyACSQ0AIAAQhgYQ+wIiAyABIAIQng0aIAAgAyACEMAMDwsgACADIAIgA2sgABC2BSIEQQAgBCACIAEQnw0gAAsOACAAIAEgARC5ChCoDQuLAQEDfyMAQRBrIgMkAAJAAkAgABD0ByIEIAAQtgUiBWsgAkkNACACRQ0BIAAQhgYQ+wIiBCAFQQJ0aiABIAIQhQIaIAAgBSACaiICEPcHIANBADYCDCAEIAJBAnRqIANBDGoQ8AcMAQsgACAEIAUgAmogBGsgBSAFQQAgAiABEJ8NCyADQRBqJAAgAAumAQECfyMAQRBrIgMkAAJAIAAQggsgAUkNAAJAAkAgARCDC0UNACAAIAEQ8wcgABDyByEEDAELIANBCGogABD4ByABEIQLQQFqEIULIAMoAggiBCADKAIMEIYLIAAgBBCHCyAAIAMoAgwQiAsgACABEPEHCyAEEPsCIAEgAhCkDRogA0EANgIEIAQgAUECdGogA0EEahDwByADQRBqJAAPCyAAEIkLAAvFAQEDfyMAQRBrIgIkACACIAE2AgwCQAJAIAAQwgYiAw0AQQEhBCAAEMQGIQEMAQsgABCcC0F/aiEEIAAQwwYhAQsCQAJAAkAgASAERw0AIAAgBEEBIAQgBEEAQQAQow0gABCGBhoMAQsgABCGBhogAw0AIAAQ8gchBCAAIAFBAWoQ8wcMAQsgABDvByEEIAAgAUEBahDxBwsgBCABQQJ0aiIAIAJBDGoQ8AcgAkEANgIIIABBBGogAkEIahDwByACQRBqJAALKgACQANAIAFFDQEgACACLQAAOgAAIAFBf2ohASAAQQFqIQAMAAsACyAACyoAAkADQCABRQ0BIAAgAigCADYCACABQX9qIQEgAEEEaiEADAALAAsgAAsOACAAQdAAahCLARCwDQsIACAAQdAAagsJACAAIAEQsg0LcgECfwJAAkAgASgCTCICQQBIDQAgAkUNASACQf////97cRDGAygCGEcNAQsCQCAAQf8BcSICIAEoAlBGDQAgASgCFCIDIAEoAhBGDQAgASADQQFqNgIUIAMgADoAACACDwsgASACEIwNDwsgACABELMNC3UBA38CQCABQcwAaiICELQNRQ0AIAEQpwEaCwJAAkAgAEH/AXEiAyABKAJQRg0AIAEoAhQiBCABKAIQRg0AIAEgBEEBajYCFCAEIAA6AAAMAQsgASADEIwNIQMLAkAgAhC1DUGAgICABHFFDQAgAhC2DQsgAwsbAQF/IAAgACgCACIBQf////8DIAEbNgIAIAELFAEBfyAAKAIAIQEgAEEANgIAIAELCgAgAEEBEJ4BGgs9AQJ/IwBBEGsiAiQAQfQZQQtBAUEAKALsgwEiAxCtARogAiABNgIMIAMgACABEMcEGkEKIAMQsQ0aEA8ACwcAIAAoAgALCQBBqJkCELgNCwQAQQALCwBB1hlBABC3DQALBwAgABDqDQsCAAsCAAsKACAAELwNEIENCwoAIAAQvA0QgQ0LCgAgABC8DRCBDQsKACAAELwNEIENCwsAIAAgAUEAEMQNCzAAAkAgAg0AIAAoAgQgASgCBEYPCwJAIAAgAUcNAEEBDwsgABDFDSABEMUNELEERQsHACAAKAIEC68BAQJ/IwBBwABrIgMkAEEBIQQCQCAAIAFBABDEDQ0AQQAhBCABRQ0AQQAhBCABQbzfAUHs3wFBABDHDSIBRQ0AIANBCGpBBHJBAEE0EGIaIANBATYCOCADQX82AhQgAyAANgIQIAMgATYCCCABIANBCGogAigCAEEBIAEoAgAoAhwRCwACQCADKAIgIgRBAUcNACACIAMoAhg2AgALIARBAUYhBAsgA0HAAGokACAEC8wCAQN/IwBBwABrIgQkACAAKAIAIgVBfGooAgAhBiAFQXhqKAIAIQUgBEEgakIANwMAIARBKGpCADcDACAEQTBqQgA3AwAgBEE3akIANwAAIARCADcDGCAEIAM2AhQgBCABNgIQIAQgADYCDCAEIAI2AgggACAFaiEAQQAhAwJAAkAgBiACQQAQxA1FDQAgBEEBNgI4IAYgBEEIaiAAIABBAUEAIAYoAgAoAhQRCgAgAEEAIAQoAiBBAUYbIQMMAQsgBiAEQQhqIABBAUEAIAYoAgAoAhgRDgACQAJAIAQoAiwOAgABAgsgBCgCHEEAIAQoAihBAUYbQQAgBCgCJEEBRhtBACAEKAIwQQFGGyEDDAELAkAgBCgCIEEBRg0AIAQoAjANASAEKAIkQQFHDQEgBCgCKEEBRw0BCyAEKAIYIQMLIARBwABqJAAgAwtgAQF/AkAgASgCECIEDQAgAUEBNgIkIAEgAzYCGCABIAI2AhAPCwJAAkAgBCACRw0AIAEoAhhBAkcNASABIAM2AhgPCyABQQE6ADYgAUECNgIYIAEgASgCJEEBajYCJAsLHwACQCAAIAEoAghBABDEDUUNACABIAEgAiADEMgNCws4AAJAIAAgASgCCEEAEMQNRQ0AIAEgASACIAMQyA0PCyAAKAIIIgAgASACIAMgACgCACgCHBELAAtZAQJ/IAAoAgQhBAJAAkAgAg0AQQAhBQwBCyAEQQh1IQUgBEEBcUUNACACKAIAIAUQzA0hBQsgACgCACIAIAEgAiAFaiADQQIgBEECcRsgACgCACgCHBELAAsKACAAIAFqKAIAC3EBAn8CQCAAIAEoAghBABDEDUUNACAAIAEgAiADEMgNDwsgACgCDCEEIABBEGoiBSABIAIgAxDLDQJAIABBGGoiACAFIARBA3RqIgRPDQADQCAAIAEgAiADEMsNIAEtADYNASAAQQhqIgAgBEkNAAsLC58BACABQQE6ADUCQCABKAIEIANHDQAgAUEBOgA0AkACQCABKAIQIgMNACABQQE2AiQgASAENgIYIAEgAjYCECAEQQFHDQIgASgCMEEBRg0BDAILAkAgAyACRw0AAkAgASgCGCIDQQJHDQAgASAENgIYIAQhAwsgASgCMEEBRw0CIANBAUYNAQwCCyABIAEoAiRBAWo2AiQLIAFBAToANgsLIAACQCABKAIEIAJHDQAgASgCHEEBRg0AIAEgAzYCHAsLzAQBBH8CQCAAIAEoAgggBBDEDUUNACABIAEgAiADEM8NDwsCQAJAIAAgASgCACAEEMQNRQ0AAkACQCABKAIQIAJGDQAgASgCFCACRw0BCyADQQFHDQIgAUEBNgIgDwsgASADNgIgAkAgASgCLEEERg0AIABBEGoiBSAAKAIMQQN0aiEDQQAhBkEAIQcCQAJAAkADQCAFIANPDQEgAUEAOwE0IAUgASACIAJBASAEENENIAEtADYNAQJAIAEtADVFDQACQCABLQA0RQ0AQQEhCCABKAIYQQFGDQRBASEGQQEhB0EBIQggAC0ACEECcQ0BDAQLQQEhBiAHIQggAC0ACEEBcUUNAwsgBUEIaiEFDAALAAtBBCEFIAchCCAGQQFxRQ0BC0EDIQULIAEgBTYCLCAIQQFxDQILIAEgAjYCFCABIAEoAihBAWo2AiggASgCJEEBRw0BIAEoAhhBAkcNASABQQE6ADYPCyAAKAIMIQggAEEQaiIGIAEgAiADIAQQ0g0gAEEYaiIFIAYgCEEDdGoiCE8NAAJAAkAgACgCCCIAQQJxDQAgASgCJEEBRw0BCwNAIAEtADYNAiAFIAEgAiADIAQQ0g0gBUEIaiIFIAhJDQAMAgsACwJAIABBAXENAANAIAEtADYNAiABKAIkQQFGDQIgBSABIAIgAyAEENINIAVBCGoiBSAISQ0ADAILAAsDQCABLQA2DQECQCABKAIkQQFHDQAgASgCGEEBRg0CCyAFIAEgAiADIAQQ0g0gBUEIaiIFIAhJDQALCwtOAQJ/IAAoAgQiBkEIdSEHAkAgBkEBcUUNACADKAIAIAcQzA0hBwsgACgCACIAIAEgAiADIAdqIARBAiAGQQJxGyAFIAAoAgAoAhQRCgALTAECfyAAKAIEIgVBCHUhBgJAIAVBAXFFDQAgAigCACAGEMwNIQYLIAAoAgAiACABIAIgBmogA0ECIAVBAnEbIAQgACgCACgCGBEOAAuCAgACQCAAIAEoAgggBBDEDUUNACABIAEgAiADEM8NDwsCQAJAIAAgASgCACAEEMQNRQ0AAkACQCABKAIQIAJGDQAgASgCFCACRw0BCyADQQFHDQIgAUEBNgIgDwsgASADNgIgAkAgASgCLEEERg0AIAFBADsBNCAAKAIIIgAgASACIAJBASAEIAAoAgAoAhQRCgACQCABLQA1RQ0AIAFBAzYCLCABLQA0RQ0BDAMLIAFBBDYCLAsgASACNgIUIAEgASgCKEEBajYCKCABKAIkQQFHDQEgASgCGEECRw0BIAFBAToANg8LIAAoAggiACABIAIgAyAEIAAoAgAoAhgRDgALC5sBAAJAIAAgASgCCCAEEMQNRQ0AIAEgASACIAMQzw0PCwJAIAAgASgCACAEEMQNRQ0AAkACQCABKAIQIAJGDQAgASgCFCACRw0BCyADQQFHDQEgAUEBNgIgDwsgASACNgIUIAEgAzYCICABIAEoAihBAWo2AigCQCABKAIkQQFHDQAgASgCGEECRw0AIAFBAToANgsgAUEENgIsCwuxAgEHfwJAIAAgASgCCCAFEMQNRQ0AIAEgASACIAMgBBDODQ8LIAEtADUhBiAAKAIMIQcgAUEAOgA1IAEtADQhCCABQQA6ADQgAEEQaiIJIAEgAiADIAQgBRDRDSAGIAEtADUiCnIhBiAIIAEtADQiC3IhCAJAIABBGGoiDCAJIAdBA3RqIgdPDQADQCAIQQFxIQggBkEBcSEGIAEtADYNAQJAAkAgC0H/AXFFDQAgASgCGEEBRg0DIAAtAAhBAnENAQwDCyAKQf8BcUUNACAALQAIQQFxRQ0CCyABQQA7ATQgDCABIAIgAyAEIAUQ0Q0gAS0ANSIKIAZyIQYgAS0ANCILIAhyIQggDEEIaiIMIAdJDQALCyABIAZB/wFxQQBHOgA1IAEgCEH/AXFBAEc6ADQLPgACQCAAIAEoAgggBRDEDUUNACABIAEgAiADIAQQzg0PCyAAKAIIIgAgASACIAMgBCAFIAAoAgAoAhQRCgALIQACQCAAIAEoAgggBRDEDUUNACABIAEgAiADIAQQzg0LCx4AAkAgAA0AQQAPCyAAQbzfAUHM4AFBABDHDUEARwsEACAACw0AIAAQ2Q0aIAAQgQ0LBQBB6AsLFQAgABCHDSIAQbzkAUEIajYCACAACw0AIAAQ2Q0aIAAQgQ0LBQBB9Q8LFQAgABDcDSIAQdDkAUEIajYCACAACw0AIAAQ2Q0aIAAQgQ0LBQBBrwwLHAAgAEHU5QFBCGo2AgAgAEEEahDjDRogABDZDQsrAQF/AkAgABCLDUUNACAAKAIAEOQNIgFBCGoQ5Q1Bf0oNACABEIENCyAACwcAIABBdGoLFQEBfyAAIAAoAgBBf2oiATYCACABCw0AIAAQ4g0aIAAQgQ0LCgAgAEEEahDoDQsHACAAKAIACw0AIAAQ4g0aIAAQgQ0LBAAgAAsUAEGwmQYkAkGwmQJBD2pBcHEkAQsHACMAIwFrCwQAIwILBAAjAQsEACMACwYAIAAkAAsSAQJ/IwAgAGtBcHEiASQAIAELBAAjAAsGACAAJAMLBAAjAwsRACABIAIgAyAEIAUgABEgAAsNACABIAIgAyAAERYACxEAIAEgAiADIAQgBSAAERIACxMAIAEgAiADIAQgBSAGIAARIwALFQAgASACIAMgBCAFIAYgByAAERwACxkAIAAgASACIAOtIAStQiCGhCAFIAYQ9Q0LJQEBfiAAIAEgAq0gA61CIIaEIAQQ9g0hBSAFQiCIpxDzDSAFpwsZACAAIAEgAiADIAQgBa0gBq1CIIaEEPcNCyMAIAAgASACIAMgBCAFrSAGrUIghoQgB60gCK1CIIaEEPgNCyUAIAAgASACIAMgBCAFIAatIAetQiCGhCAIrSAJrUIghoQQ+Q0LHAAgACABIAIgA6cgA0IgiKcgBKcgBEIgiKcQEwsTACAAIAGnIAFCIIinIAIgAxAUCwul4oGAAAIAQYAIC9DeAUh6AGluZmluaXR5AEZlYnJ1YXJ5AEphbnVhcnkASnVseQBUaHVyc2RheQBUdWVzZGF5AFdlZG5lc2RheQBTYXR1cmRheQBTdW5kYXkATW9uZGF5AEZyaWRheQBNYXkAJW0vJWQvJXkALSsgICAwWDB4AC0wWCswWCAwWC0weCsweCAweABOb3YAVGh1AHVuc3VwcG9ydGVkIGxvY2FsZSBmb3Igc3RhbmRhcmQgaW5wdXQAQXVndXN0AHJvd19hZGRfZGVzdAB1bnNpZ25lZCBzaG9ydAB1bnNpZ25lZCBpbnQAZ2V0AE9jdABmbG9hdABTYXQAdWludDY0X3QAbXNjLm9jdGF2ZXMuc2l6ZSgpID09IG5fb2N0YXZlcwBtYWtlX3pvbmVzAG9ibm8gPCBuX2JhbmRzAEFwcgB2ZWN0b3IAYW5hbHl6ZXIAYWNjdW11bGF0ZV9wb3dlcgBPY3RvYmVyAE5vdmVtYmVyAFNlcHRlbWJlcgBEZWNlbWJlcgB1bnNpZ25lZCBjaGFyAGlvc19iYXNlOjpjbGVhcgBNYXIAU2VwACVJOiVNOiVTICVwAHpvbmVzLnNpemUoKSA9PSB6bm8AbGVuIDw9IG9mZnNldFtpICsgMV0gLSBvAFN1bgBKdW4Ac3RkOjpleGNlcHRpb24ATW9uAG5hbgBKYW4ASnVsAGJvb2wAbGwAQXByaWwAZW1zY3JpcHRlbjo6dmFsAHAtPm9rAEZyaQBiYWRfYXJyYXlfbmV3X2xlbmd0aABNYXJjaAAuL2dhYm9yYXRvci9nYWJvcmF0b3IuaAAuL2dhYm9yYXRvci9wb29sLmgAQXVnAHVuc2lnbmVkIGxvbmcAc3RkOjp3c3RyaW5nAGJhc2ljX3N0cmluZwBzdGQ6OnN0cmluZwBzdGQ6OnUxNnN0cmluZwBzdGQ6OnUzMnN0cmluZwBpbmYAJS4wTGYAJUxmAGRkYXRhLnNpemUoKSA+PSBwbGFuLmRzcGFyYW1zLnNmdHNpemUAaWkgPj0gMCAmJiBpaSA8IHBsYW4uZmZ0c2l6ZQBwbGFuLmZmdHNpemUgLSBoYWxmX3NpemUgPT0gMyAqIGhhbGZfc2l6ZQBHYWJiZXI6IEluaXRpYWxpemUAdHJ1ZQBUdWUAZmFsc2UAR2FiYmVyOiBtZW1vcnkgcmVsZWFzZQBKdW5lAG1ha2Vfem9uZQBkb3VibGUAYm5vX21lcmdlAGFwcGx5X3RvX3NsaWNlAHNhbmVfZm1vZAB2b2lkAHZhbGlkAEdhYmJlcjogV0FTTSBicmlkZ2UgbG9hZGVkAGFuYWx5emVfc2xpY2VkAFdlZABhZGQAc3RkOjpiYWRfYWxsb2MARGVjAEZlYgAlYSAlYiAlZCAlSDolTTolUyAlWQBQT1NJWAAlSDolTTolUwBOQU4AUE0AQU0ATENfQUxMAExBTkcASU5GAEMAZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8c2hvcnQ+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PHVuc2lnbmVkIHNob3J0PgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzxpbnQ+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PHVuc2lnbmVkIGludD4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8ZmxvYXQ+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PHVpbnQ4X3Q+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PGludDhfdD4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8dWludDE2X3Q+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PGludDE2X3Q+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PHVpbnQzMl90PgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzxpbnQzMl90PgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzxjaGFyPgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzx1bnNpZ25lZCBjaGFyPgBzdGQ6OmJhc2ljX3N0cmluZzx1bnNpZ25lZCBjaGFyPgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzxzaWduZWQgY2hhcj4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8bG9uZz4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8dW5zaWduZWQgbG9uZz4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8ZG91YmxlPgAKCUYgbWF4OgAKCUYgbWluOgAKCUYgcmVmOgAKCUFuYWx5c2lzIGRlbGF5IChzYW1wbGVzKToACglBbmFseXNpcyBkZWxheSAocyk6AAoJQmFuZCBtYXggKCMpOgAKCUJhbmRzIG9mIGludGVyZXN0ICgjKToACglUb3RhbCBiYW5kcyAoIyk6AAoJQmFuZCBtaW4gKCMpOgAKCWJhbmRwYXNzIGJhbmRzIGJlZ2luICgjKToACgliYW5kcGFzcyBiYW5kcyBlbmQgKCMpOgAwMTIzNDU2Nzg5AEMuVVRGLTgAcGFyYW1zLmZmX21pbiA8IDAuNQB3aGljaHAyAGkxIDw9IGJ1Zl9pMQBpMCA8PSBpMQBmMCA8IGYxAGFuYWx5emUxAG5fYmFuZHNfdG9wX29jdGF2ZSA+PSAxAHotPmJhbmRwYXJhbXMuc2l6ZSgpID49IDEAdDEgPj0gdDAAaTAgPj0gYnVmX2kwAGkxID49IGkwAGIgPiAwACgqKHIuZmlyc3QpKS5zZWNvbmQgPT0gMAAodG1wICYgMSkgPT0gMAAoKHNsaWNlX3QwIC0gKGludClwbGFuLmZhdF9zaXplKSAmICgoMSA8PCBjb2VmX3NoaWZ0KSAtIDEpKSA9PSAwAC4AaXNfcG93ZXJfb2ZfdHdvKHYpAChudWxsKQBvcGVyYXRvcigpAG9jdCA8IChpbnQpbXNjLm9jdGF2ZXMuc2l6ZSgpAFB1cmUgdmlydHVhbCBmdW5jdGlvbiBjYWxsZWQhAGxpYmMrK2FiaTogAAoJYmFuZHNfcGVyX29jdGF2ZTogAAoJc2FtcGxlIHJhdGU6IAAgZjEgAGYwIAAKAE5TdDNfXzIxMmJhc2ljX3N0cmluZ0ljTlNfMTFjaGFyX3RyYWl0c0ljRUVOU185YWxsb2NhdG9ySWNFRUVFAABkcQAAMA0AAE5TdDNfXzIxMmJhc2ljX3N0cmluZ0loTlNfMTFjaGFyX3RyYWl0c0loRUVOU185YWxsb2NhdG9ySWhFRUVFAABkcQAAeA0AAE5TdDNfXzIxMmJhc2ljX3N0cmluZ0l3TlNfMTFjaGFyX3RyYWl0c0l3RUVOU185YWxsb2NhdG9ySXdFRUVFAABkcQAAwA0AAE5TdDNfXzIxMmJhc2ljX3N0cmluZ0lEc05TXzExY2hhcl90cmFpdHNJRHNFRU5TXzlhbGxvY2F0b3JJRHNFRUVFAAAAZHEAAAgOAABOU3QzX18yMTJiYXNpY19zdHJpbmdJRGlOU18xMWNoYXJfdHJhaXRzSURpRUVOU185YWxsb2NhdG9ySURpRUVFRQAAAGRxAABUDgAATjEwZW1zY3JpcHRlbjN2YWxFAABkcQAAoA4AAE4xMGVtc2NyaXB0ZW4xMW1lbW9yeV92aWV3SWNFRQAAZHEAALwOAABOMTBlbXNjcmlwdGVuMTFtZW1vcnlfdmlld0lhRUUAAGRxAADkDgAATjEwZW1zY3JpcHRlbjExbWVt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AAAAAAAA/////////////////////////////////////////////////////////////////wABAgMEBQYHCAn/////////CgsMDQ4PEBESExQVFhcYGRobHB0eHyAhIiP///////8KCwwNDg8QERITFBUWFxgZGhscHR4fICEiI/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8AAQIEBwMGBQAAAAAAAAACAADAAwAAwAQAAMAFAADABgAAwAcAAMAIAADACQAAwAoAAMALAADADAAAwA0AAMAOAADADwAAwBAAAMARAADAEgAAwBMAAMAUAADAFQAAwBYAAMAXAADAGAAAwBkAAMAaAADAGwAAwBwAAMAdAADAHgAAwB8AAMAAAACzAQAAwwIAAMMDAADDBAAAwwUAAMMGAADDBwAAwwgAAMMJAADDCgAAwwsAAMMMAADDDQAA0w4AAMMPAADDAAAMuwEADMMCAAzDAwAMwwQADNsAAAAA3hIElQAAAAD////////////////ARQAAFAAAAEMuVVRGLTgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADURQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAExDX0NUWVBFAAAAAExDX05VTUVSSUMAAExDX1RJTUUAAAAAAExDX0NPTExBVEUAAExDX01PTkVUQVJZAExDX01FU1NBR0VTAAAAAAAAAAAAGQAKABkZGQAAAAAFAAAAAAAACQAAAAALAAAAAAAAAAAZABEKGRkZAwoHAAEACQsYAAAJBgsAAAsABhkAAAAZGRkAAAAAAAAAAAAAAAAAAAAADgAAAAAAAAAAGQAKDRkZGQANAAACAAkOAAAACQAOAAAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwAAAAAAAAAAAAAABMAAAAAEwAAAAAJDAAAAAAADAAADAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAPAAAABA8AAAAACRAAAAAAABAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEgAAAAAAAAAAAAAAEQAAAAARAAAAAAkSAAAAAAASAAASAAAaAAAAGhoaAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABoAAAAaGhoAAAAAAAAJAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUAAAAAAAAAAAAAAAXAAAAABcAAAAACRQAAAAAABQAABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFgAAAAAAAAAAAAAAFQAAAAAVAAAAAAkWAAAAAAAWAAAWAAAwMTIzNDU2Nzg5QUJDREVGcEoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAACAAAAAwAAAAQAAAAFAAAABgAAAAcAAAAIAAAACQAAAAoAAAALAAAADAAAAA0AAAAOAAAADwAAABAAAAARAAAAEgAAABMAAAAUAAAAFQAAABYAAAAXAAAAGAAAABkAAAAaAAAAGwAAABwA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AAAAAAAAxF4AAGkAAABqAAAAawAAAAAAAAAkXwAAbAAAAG0AAABrAAAAbgAAAG8AAABwAAAAcQAAAHIAAABzAAAAdAAAAHUAAAAAAAAAAAAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAAAAUCAAAFAAAABQAAAAUAAAAFAAAABAAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAAAAQAAAAEAAAAAwIAAIIAAACCAAAAggAAAIIAAACCAAAAggAAAIIAAACCAAAAggAAAIIAAACCAAAAggAAAIIAAACCAAAAggAAAEIBAABCAQAAQgEAAEIBAABCAQAAQgEAAEIBAABCAQAAQgEAAEIBAACCAAAAggAAAIIAAACCAAAAggAAAIIAAACCAAAAKgEAACoBAAAqAQAAKgEAACoBAAAqAQAAKgAAACoAAAAqAAAAKgAAACoAAAAqAAAAKgAAACoAAAAqAAAAKgAAACoAAAAqAAAAKgAAACoAAAAqAAAAKgAAACoAAAAqAAAAKgAAACoAAACCAAAAggAAAIIAAACCAAAAggAAAIIAAAAyAQAAMgEAADIBAAAyAQAAMgEAADIBAAAyAAAAMgAAADIAAAAyAAAAMgAAADIAAAAyAAAAMgAAADIAAAAyAAAAMgAAADIAAAAyAAAAMgAAADIAAAAyAAAAMgAAADIAAAAyAAAAMgAAAIIAAACCAAAAggAAAIIAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA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';
  if (!isDataURI(wasmBinaryFile)) {
    wasmBinaryFile = locateFile(wasmBinaryFile);
  }

function getBinary(file) {
  try {
    if (file == wasmBinaryFile && wasmBinary) {
      return new Uint8Array(wasmBinary);
    }
    var binary = tryParseAsDataURI(file);
    if (binary) {
      return binary;
    }
    if (readBinary) {
      return readBinary(file);
    }
    throw "sync fetching of the wasm failed: you can preload it to Module['wasmBinary'] manually, or emcc.py will do that for you when generating HTML (but not JS)";
  }
  catch (err) {
    abort(err);
  }
}

function getBinaryPromise() {
  // If we don't have the binary yet, try to to load it asynchronously.
  // Fetch has some additional restrictions over XHR, like it can't be used on a file:// url.
  // See https://github.com/github/fetch/pull/92#issuecomment-140665932
  // Cordova or Electron apps are typically loaded from a file:// url.
  // So use fetch if it is available and the url is not a file, otherwise fall back to XHR.
  if (!wasmBinary && (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER)) {
    if (typeof fetch == 'function'
    ) {
      return fetch(wasmBinaryFile, { credentials: 'same-origin' }).then(function(response) {
        if (!response['ok']) {
          throw "failed to load wasm binary file at '" + wasmBinaryFile + "'";
        }
        return response['arrayBuffer']();
      }).catch(function () {
          return getBinary(wasmBinaryFile);
      });
    }
  }

  // Otherwise, getBinary should be able to get it synchronously
  return Promise.resolve().then(function() { return getBinary(wasmBinaryFile); });
}

function instantiateSync(file, info) {
  var instance;
  var module;
  var binary;
  try {
    binary = getBinary(file);
    module = new WebAssembly.Module(binary);
    instance = new WebAssembly.Instance(module, info);
  } catch (e) {
    var str = e.toString();
    err('failed to compile wasm module: ' + str);
    if (str.includes('imported Memory') ||
        str.includes('memory import')) {
      err('Memory size incompatibility issues may be due to changing INITIAL_MEMORY at runtime to something too large. Use ALLOW_MEMORY_GROWTH to allow any size memory (and also make sure not to set INITIAL_MEMORY at runtime to something smaller than it was at compile time).');
    }
    throw e;
  }
  return [instance, module];
}

// Create the wasm instance.
// Receives the wasm imports, returns the exports.
function createWasm() {
  // prepare imports
  var info = {
    'env': wasmImports,
    'wasi_snapshot_preview1': wasmImports,
  };
  // Load the wasm module and create an instance of using native support in the JS engine.
  // handle a generated wasm instance, receiving its exports and
  // performing other necessary setup
  /** @param {WebAssembly.Module=} module*/
  function receiveInstance(instance, module) {
    var exports = instance.exports;

    Module['asm'] = exports;

    wasmMemory = Module['asm']['memory'];
    assert(wasmMemory, "memory not found in wasm exports");
    // This assertion doesn't hold when emscripten is run in --post-link
    // mode.
    // TODO(sbc): Read INITIAL_MEMORY out of the wasm file in post-link mode.
    //assert(wasmMemory.buffer.byteLength === 16777216);
    updateMemoryViews();

    wasmTable = Module['asm']['__indirect_function_table'];
    assert(wasmTable, "table not found in wasm exports");

    addOnInit(Module['asm']['__wasm_call_ctors']);

    removeRunDependency('wasm-instantiate');

  }
  // wait for the pthread pool (if any)
  addRunDependency('wasm-instantiate');

  // Prefer streaming instantiation if available.

  // User shell pages can write their own Module.instantiateWasm = function(imports, successCallback) callback
  // to manually instantiate the Wasm module themselves. This allows pages to run the instantiation parallel
  // to any other async startup actions they are performing.
  // Also pthreads and wasm workers initialize the wasm instance through this path.
  if (Module['instantiateWasm']) {
    try {
      var exports = Module['instantiateWasm'](info, receiveInstance);
      return exports;
    } catch(e) {
      err('Module.instantiateWasm callback failed with error: ' + e);
        // If instantiation fails, reject the module ready promise.
        readyPromiseReject(e);
    }
  }

  var result = instantiateSync(wasmBinaryFile, info);
  // TODO: Due to Closure regression https://github.com/google/closure-compiler/issues/3193,
  // the above line no longer optimizes out down to the following line.
  // When the regression is fixed, we can remove this if/else.
  receiveInstance(result[0]);
  return Module['asm']; // exports were assigned here
}

// Globals used by JS i64 conversions (see makeSetValue)
var tempDouble;
var tempI64;

// include: runtime_debug.js
function legacyModuleProp(prop, newName) {
  if (!Object.getOwnPropertyDescriptor(Module, prop)) {
    Object.defineProperty(Module, prop, {
      configurable: true,
      get: function() {
        abort('Module.' + prop + ' has been replaced with plain ' + newName + ' (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)');
      }
    });
  }
}

function ignoredModuleProp(prop) {
  if (Object.getOwnPropertyDescriptor(Module, prop)) {
    abort('`Module.' + prop + '` was supplied but `' + prop + '` not included in INCOMING_MODULE_JS_API');
  }
}

// forcing the filesystem exports a few things by default
function isExportedByForceFilesystem(name) {
  return name === 'FS_createPath' ||
         name === 'FS_createDataFile' ||
         name === 'FS_createPreloadedFile' ||
         name === 'FS_unlink' ||
         name === 'addRunDependency' ||
         // The old FS has some functionality that WasmFS lacks.
         name === 'FS_createLazyFile' ||
         name === 'FS_createDevice' ||
         name === 'removeRunDependency';
}

function missingGlobal(sym, msg) {
  if (typeof globalThis !== 'undefined') {
    Object.defineProperty(globalThis, sym, {
      configurable: true,
      get: function() {
        warnOnce('`' + sym + '` is not longer defined by emscripten. ' + msg);
        return undefined;
      }
    });
  }
}

missingGlobal('buffer', 'Please use HEAP8.buffer or wasmMemory.buffer');

function missingLibrarySymbol(sym) {
  if (typeof globalThis !== 'undefined' && !Object.getOwnPropertyDescriptor(globalThis, sym)) {
    Object.defineProperty(globalThis, sym, {
      configurable: true,
      get: function() {
        // Can't `abort()` here because it would break code that does runtime
        // checks.  e.g. `if (typeof SDL === 'undefined')`.
        var msg = '`' + sym + '` is a library symbol and not included by default; add it to your library.js __deps or to DEFAULT_LIBRARY_FUNCS_TO_INCLUDE on the command line';
        // DEFAULT_LIBRARY_FUNCS_TO_INCLUDE requires the name as it appears in
        // library.js, which means $name for a JS name with no prefix, or name
        // for a JS name like _name.
        var librarySymbol = sym;
        if (!librarySymbol.startsWith('_')) {
          librarySymbol = '$' + sym;
        }
        msg += " (e.g. -sDEFAULT_LIBRARY_FUNCS_TO_INCLUDE=" + librarySymbol + ")";
        if (isExportedByForceFilesystem(sym)) {
          msg += '. Alternatively, forcing filesystem support (-sFORCE_FILESYSTEM) can export this for you';
        }
        warnOnce(msg);
        return undefined;
      }
    });
  }
  // Any symbol that is not included from the JS libary is also (by definttion)
  // not exported on the Module object.
  unexportedRuntimeSymbol(sym);
}

function unexportedRuntimeSymbol(sym) {
  if (!Object.getOwnPropertyDescriptor(Module, sym)) {
    Object.defineProperty(Module, sym, {
      configurable: true,
      get: function() {
        var msg = "'" + sym + "' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)";
        if (isExportedByForceFilesystem(sym)) {
          msg += '. Alternatively, forcing filesystem support (-sFORCE_FILESYSTEM) can export this for you';
        }
        abort(msg);
      }
    });
  }
}

// Used by XXXXX_DEBUG settings to output debug messages.
function dbg(text) {
  // TODO(sbc): Make this configurable somehow.  Its not always convenient for
  // logging to show up as errors.
  console.error(text);
}

// end include: runtime_debug.js
// === Body ===


// end include: preamble.js

  /** @constructor */
  function ExitStatus(status) {
      this.name = 'ExitStatus';
      this.message = 'Program terminated with exit(' + status + ')';
      this.status = status;
    }

  function callRuntimeCallbacks(callbacks) {
      while (callbacks.length > 0) {
        // Pass the module as the first argument.
        callbacks.shift()(Module);
      }
    }

  
    /**
     * @param {number} ptr
     * @param {string} type
     */
  function getValue(ptr, type = 'i8') {
      if (type.endsWith('*')) type = '*';
      switch (type) {
        case 'i1': return HEAP8[((ptr)>>0)];
        case 'i8': return HEAP8[((ptr)>>0)];
        case 'i16': return HEAP16[((ptr)>>1)];
        case 'i32': return HEAP32[((ptr)>>2)];
        case 'i64': return HEAP32[((ptr)>>2)];
        case 'float': return HEAPF32[((ptr)>>2)];
        case 'double': return HEAPF64[((ptr)>>3)];
        case '*': return HEAPU32[((ptr)>>2)];
        default: abort('invalid type for getValue: ' + type);
      }
      return null;
    }

  function intArrayToString(array) {
    var ret = [];
    for (var i = 0; i < array.length; i++) {
      var chr = array[i];
      if (chr > 0xFF) {
        assert(false, 'Character code ' + chr + ' (' + String.fromCharCode(chr) + ')  at offset ' + i + ' not in 0x00-0xFF.');
        chr &= 0xFF;
      }
      ret.push(String.fromCharCode(chr));
    }
    return ret.join('');
  }

  function ptrToString(ptr) {
      assert(typeof ptr === 'number');
      return '0x' + ptr.toString(16).padStart(8, '0');
    }

  
    /**
     * @param {number} ptr
     * @param {number} value
     * @param {string} type
     */
  function setValue(ptr, value, type = 'i8') {
      if (type.endsWith('*')) type = '*';
      switch (type) {
        case 'i1': HEAP8[((ptr)>>0)] = value; break;
        case 'i8': HEAP8[((ptr)>>0)] = value; break;
        case 'i16': HEAP16[((ptr)>>1)] = value; break;
        case 'i32': HEAP32[((ptr)>>2)] = value; break;
        case 'i64': (tempI64 = [value>>>0,(tempDouble=value,(+(Math.abs(tempDouble))) >= 1.0 ? (tempDouble > 0.0 ? ((Math.min((+(Math.floor((tempDouble)/4294967296.0))), 4294967295.0))|0)>>>0 : (~~((+(Math.ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296.0)))))>>>0) : 0)],HEAP32[((ptr)>>2)] = tempI64[0],HEAP32[(((ptr)+(4))>>2)] = tempI64[1]); break;
        case 'float': HEAPF32[((ptr)>>2)] = value; break;
        case 'double': HEAPF64[((ptr)>>3)] = value; break;
        case '*': HEAPU32[((ptr)>>2)] = value; break;
        default: abort('invalid type for setValue: ' + type);
      }
    }

  function warnOnce(text) {
      if (!warnOnce.shown) warnOnce.shown = {};
      if (!warnOnce.shown[text]) {
        warnOnce.shown[text] = 1;
        err(text);
      }
    }

  function ___assert_fail(condition, filename, line, func) {
      abort('Assertion failed: ' + UTF8ToString(condition) + ', at: ' + [filename ? UTF8ToString(filename) : 'unknown filename', line, func ? UTF8ToString(func) : 'unknown function']);
    }

  /** @constructor */
  function ExceptionInfo(excPtr) {
      this.excPtr = excPtr;
      this.ptr = excPtr - 24;
  
      this.set_type = function(type) {
        HEAPU32[(((this.ptr)+(4))>>2)] = type;
      };
  
      this.get_type = function() {
        return HEAPU32[(((this.ptr)+(4))>>2)];
      };
  
      this.set_destructor = function(destructor) {
        HEAPU32[(((this.ptr)+(8))>>2)] = destructor;
      };
  
      this.get_destructor = function() {
        return HEAPU32[(((this.ptr)+(8))>>2)];
      };
  
      this.set_refcount = function(refcount) {
        HEAP32[((this.ptr)>>2)] = refcount;
      };
  
      this.set_caught = function (caught) {
        caught = caught ? 1 : 0;
        HEAP8[(((this.ptr)+(12))>>0)] = caught;
      };
  
      this.get_caught = function () {
        return HEAP8[(((this.ptr)+(12))>>0)] != 0;
      };
  
      this.set_rethrown = function (rethrown) {
        rethrown = rethrown ? 1 : 0;
        HEAP8[(((this.ptr)+(13))>>0)] = rethrown;
      };
  
      this.get_rethrown = function () {
        return HEAP8[(((this.ptr)+(13))>>0)] != 0;
      };
  
      // Initialize native structure fields. Should be called once after allocated.
      this.init = function(type, destructor) {
        this.set_adjusted_ptr(0);
        this.set_type(type);
        this.set_destructor(destructor);
        this.set_refcount(0);
        this.set_caught(false);
        this.set_rethrown(false);
      }
  
      this.add_ref = function() {
        var value = HEAP32[((this.ptr)>>2)];
        HEAP32[((this.ptr)>>2)] = value + 1;
      };
  
      // Returns true if last reference released.
      this.release_ref = function() {
        var prev = HEAP32[((this.ptr)>>2)];
        HEAP32[((this.ptr)>>2)] = prev - 1;
        assert(prev > 0);
        return prev === 1;
      };
  
      this.set_adjusted_ptr = function(adjustedPtr) {
        HEAPU32[(((this.ptr)+(16))>>2)] = adjustedPtr;
      };
  
      this.get_adjusted_ptr = function() {
        return HEAPU32[(((this.ptr)+(16))>>2)];
      };
  
      // Get pointer which is expected to be received by catch clause in C++ code. It may be adjusted
      // when the pointer is casted to some of the exception object base classes (e.g. when virtual
      // inheritance is used). When a pointer is thrown this method should return the thrown pointer
      // itself.
      this.get_exception_ptr = function() {
        // Work around a fastcomp bug, this code is still included for some reason in a build without
        // exceptions support.
        var isPointer = ___cxa_is_pointer_type(this.get_type());
        if (isPointer) {
          return HEAPU32[((this.excPtr)>>2)];
        }
        var adjusted = this.get_adjusted_ptr();
        if (adjusted !== 0) return adjusted;
        return this.excPtr;
      };
    }
  
  var exceptionLast = 0;
  
  var uncaughtExceptionCount = 0;
  function ___cxa_throw(ptr, type, destructor) {
      var info = new ExceptionInfo(ptr);
      // Initialize ExceptionInfo content after it was allocated in __cxa_allocate_exception.
      info.init(type, destructor);
      exceptionLast = ptr;
      uncaughtExceptionCount++;
      throw ptr + " - Exception catching is disabled, this exception cannot be caught. Compile with -sNO_DISABLE_EXCEPTION_CATCHING or -sEXCEPTION_CATCHING_ALLOWED=[..] to catch.";
    }

  function __embind_register_bigint(primitiveType, name, size, minRange, maxRange) {}

  function getShiftFromSize(size) {
      switch (size) {
          case 1: return 0;
          case 2: return 1;
          case 4: return 2;
          case 8: return 3;
          default:
              throw new TypeError('Unknown type size: ' + size);
      }
    }
  
  function embind_init_charCodes() {
      var codes = new Array(256);
      for (var i = 0; i < 256; ++i) {
          codes[i] = String.fromCharCode(i);
      }
      embind_charCodes = codes;
    }
  var embind_charCodes = undefined;
  function readLatin1String(ptr) {
      var ret = "";
      var c = ptr;
      while (HEAPU8[c]) {
          ret += embind_charCodes[HEAPU8[c++]];
      }
      return ret;
    }
  
  var awaitingDependencies = {};
  
  var registeredTypes = {};
  
  var typeDependencies = {};
  
  var char_0 = 48;
  
  var char_9 = 57;
  function makeLegalFunctionName(name) {
      if (undefined === name) {
        return '_unknown';
      }
      name = name.replace(/[^a-zA-Z0-9_]/g, '$');
      var f = name.charCodeAt(0);
      if (f >= char_0 && f <= char_9) {
        return '_' + name;
      }
      return name;
    }
  function createNamedFunction(name, body) {
      name = makeLegalFunctionName(name);
      /*jshint evil:true*/
      return new Function(
          "body",
          "return function " + name + "() {\n" +
          "    \"use strict\";" +
          "    return body.apply(this, arguments);\n" +
          "};\n"
      )(body);
    }
  function extendError(baseErrorType, errorName) {
      var errorClass = createNamedFunction(errorName, function(message) {
        this.name = errorName;
        this.message = message;
  
        var stack = (new Error(message)).stack;
        if (stack !== undefined) {
          this.stack = this.toString() + '\n' +
              stack.replace(/^Error(:[^\n]*)?\n/, '');
        }
      });
      errorClass.prototype = Object.create(baseErrorType.prototype);
      errorClass.prototype.constructor = errorClass;
      errorClass.prototype.toString = function() {
        if (this.message === undefined) {
          return this.name;
        } else {
          return this.name + ': ' + this.message;
        }
      };
  
      return errorClass;
    }
  var BindingError = undefined;
  function throwBindingError(message) {
      throw new BindingError(message);
    }
  
  
  
  
  var InternalError = undefined;
  function throwInternalError(message) {
      throw new InternalError(message);
    }
  function whenDependentTypesAreResolved(myTypes, dependentTypes, getTypeConverters) {
      myTypes.forEach(function(type) {
          typeDependencies[type] = dependentTypes;
      });
  
      function onComplete(typeConverters) {
          var myTypeConverters = getTypeConverters(typeConverters);
          if (myTypeConverters.length !== myTypes.length) {
              throwInternalError('Mismatched type converter count');
          }
          for (var i = 0; i < myTypes.length; ++i) {
              registerType(myTypes[i], myTypeConverters[i]);
          }
      }
  
      var typeConverters = new Array(dependentTypes.length);
      var unregisteredTypes = [];
      var registered = 0;
      dependentTypes.forEach((dt, i) => {
        if (registeredTypes.hasOwnProperty(dt)) {
          typeConverters[i] = registeredTypes[dt];
        } else {
          unregisteredTypes.push(dt);
          if (!awaitingDependencies.hasOwnProperty(dt)) {
            awaitingDependencies[dt] = [];
          }
          awaitingDependencies[dt].push(() => {
            typeConverters[i] = registeredTypes[dt];
            ++registered;
            if (registered === unregisteredTypes.length) {
              onComplete(typeConverters);
            }
          });
        }
      });
      if (0 === unregisteredTypes.length) {
        onComplete(typeConverters);
      }
    }
  /** @param {Object=} options */
  function registerType(rawType, registeredInstance, options = {}) {
      if (!('argPackAdvance' in registeredInstance)) {
          throw new TypeError('registerType registeredInstance requires argPackAdvance');
      }
  
      var name = registeredInstance.name;
      if (!rawType) {
          throwBindingError('type "' + name + '" must have a positive integer typeid pointer');
      }
      if (registeredTypes.hasOwnProperty(rawType)) {
          if (options.ignoreDuplicateRegistrations) {
              return;
          } else {
              throwBindingError("Cannot register type '" + name + "' twice");
          }
      }
  
      registeredTypes[rawType] = registeredInstance;
      delete typeDependencies[rawType];
  
      if (awaitingDependencies.hasOwnProperty(rawType)) {
        var callbacks = awaitingDependencies[rawType];
        delete awaitingDependencies[rawType];
        callbacks.forEach((cb) => cb());
      }
    }
  function __embind_register_bool(rawType, name, size, trueValue, falseValue) {
      var shift = getShiftFromSize(size);
  
      name = readLatin1String(name);
      registerType(rawType, {
          name: name,
          'fromWireType': function(wt) {
              // ambiguous emscripten ABI: sometimes return values are
              // true or false, and sometimes integers (0 or 1)
              return !!wt;
          },
          'toWireType': function(destructors, o) {
              return o ? trueValue : falseValue;
          },
          'argPackAdvance': 8,
          'readValueFromPointer': function(pointer) {
              // TODO: if heap is fixed (like in asm.js) this could be executed outside
              var heap;
              if (size === 1) {
                  heap = HEAP8;
              } else if (size === 2) {
                  heap = HEAP16;
              } else if (size === 4) {
                  heap = HEAP32;
              } else {
                  throw new TypeError("Unknown boolean type size: " + name);
              }
              return this['fromWireType'](heap[pointer >> shift]);
          },
          destructorFunction: null, // This type does not need a destructor
      });
    }

  var emval_free_list = [];
  
  var emval_handle_array = [{},{value:undefined},{value:null},{value:true},{value:false}];
  function __emval_decref(handle) {
      if (handle > 4 && 0 === --emval_handle_array[handle].refcount) {
        emval_handle_array[handle] = undefined;
        emval_free_list.push(handle);
      }
    }
  
  
  
  
  function count_emval_handles() {
      var count = 0;
      for (var i = 5; i < emval_handle_array.length; ++i) {
        if (emval_handle_array[i] !== undefined) {
          ++count;
        }
      }
      return count;
    }
  
  function get_first_emval() {
      for (var i = 5; i < emval_handle_array.length; ++i) {
        if (emval_handle_array[i] !== undefined) {
          return emval_handle_array[i];
        }
      }
      return null;
    }
  function init_emval() {
      Module['count_emval_handles'] = count_emval_handles;
      Module['get_first_emval'] = get_first_emval;
    }
  var Emval = {toValue:(handle) => {
        if (!handle) {
            throwBindingError('Cannot use deleted val. handle = ' + handle);
        }
        return emval_handle_array[handle].value;
      },toHandle:(value) => {
        switch (value) {
          case undefined: return 1;
          case null: return 2;
          case true: return 3;
          case false: return 4;
          default:{
            var handle = emval_free_list.length ?
                emval_free_list.pop() :
                emval_handle_array.length;
  
            emval_handle_array[handle] = {refcount: 1, value: value};
            return handle;
          }
        }
      }};
  
  
  
  function simpleReadValueFromPointer(pointer) {
      return this['fromWireType'](HEAP32[((pointer)>>2)]);
    }
  function __embind_register_emval(rawType, name) {
      name = readLatin1String(name);
      registerType(rawType, {
        name: name,
        'fromWireType': function(handle) {
          var rv = Emval.toValue(handle);
          __emval_decref(handle);
          return rv;
        },
        'toWireType': function(destructors, value) {
          return Emval.toHandle(value);
        },
        'argPackAdvance': 8,
        'readValueFromPointer': simpleReadValueFromPointer,
        destructorFunction: null, // This type does not need a destructor
  
        // TODO: do we need a deleteObject here?  write a test where
        // emval is passed into JS via an interface
      });
    }

  function embindRepr(v) {
      if (v === null) {
          return 'null';
      }
      var t = typeof v;
      if (t === 'object' || t === 'array' || t === 'function') {
          return v.toString();
      } else {
          return '' + v;
      }
    }
  
  function floatReadValueFromPointer(name, shift) {
      switch (shift) {
          case 2: return function(pointer) {
              return this['fromWireType'](HEAPF32[pointer >> 2]);
          };
          case 3: return function(pointer) {
              return this['fromWireType'](HEAPF64[pointer >> 3]);
          };
          default:
              throw new TypeError("Unknown float type: " + name);
      }
    }
  
  
  
  function __embind_register_float(rawType, name, size) {
      var shift = getShiftFromSize(size);
      name = readLatin1String(name);
      registerType(rawType, {
        name: name,
        'fromWireType': function(value) {
           return value;
        },
        'toWireType': function(destructors, value) {
          if (typeof value != "number" && typeof value != "boolean") {
            throw new TypeError('Cannot convert "' + embindRepr(value) + '" to ' + this.name);
          }
          // The VM will perform JS to Wasm value conversion, according to the spec:
          // https://www.w3.org/TR/wasm-js-api-1/#towebassemblyvalue
          return value;
        },
        'argPackAdvance': 8,
        'readValueFromPointer': floatReadValueFromPointer(name, shift),
        destructorFunction: null, // This type does not need a destructor
      });
    }

  
  
  function integerReadValueFromPointer(name, shift, signed) {
      // integers are quite common, so generate very specialized functions
      switch (shift) {
          case 0: return signed ?
              function readS8FromPointer(pointer) { return HEAP8[pointer]; } :
              function readU8FromPointer(pointer) { return HEAPU8[pointer]; };
          case 1: return signed ?
              function readS16FromPointer(pointer) { return HEAP16[pointer >> 1]; } :
              function readU16FromPointer(pointer) { return HEAPU16[pointer >> 1]; };
          case 2: return signed ?
              function readS32FromPointer(pointer) { return HEAP32[pointer >> 2]; } :
              function readU32FromPointer(pointer) { return HEAPU32[pointer >> 2]; };
          default:
              throw new TypeError("Unknown integer type: " + name);
      }
    }
  
  
  function __embind_register_integer(primitiveType, name, size, minRange, maxRange) {
      name = readLatin1String(name);
      // LLVM doesn't have signed and unsigned 32-bit types, so u32 literals come
      // out as 'i32 -1'. Always treat those as max u32.
      if (maxRange === -1) {
          maxRange = 4294967295;
      }
  
      var shift = getShiftFromSize(size);
  
      var fromWireType = (value) => value;
  
      if (minRange === 0) {
          var bitshift = 32 - 8*size;
          fromWireType = (value) => (value << bitshift) >>> bitshift;
      }
  
      var isUnsignedType = (name.includes('unsigned'));
      var checkAssertions = (value, toTypeName) => {
        if (typeof value != "number" && typeof value != "boolean") {
          throw new TypeError('Cannot convert "' + embindRepr(value) + '" to ' + toTypeName);
        }
        if (value < minRange || value > maxRange) {
          throw new TypeError('Passing a number "' + embindRepr(value) + '" from JS side to C/C++ side to an argument of type "' + name + '", which is outside the valid range [' + minRange + ', ' + maxRange + ']!');
        }
      }
      var toWireType;
      if (isUnsignedType) {
        toWireType = function(destructors, value) {
          checkAssertions(value, this.name);
          return value >>> 0;
        }
      } else {
        toWireType = function(destructors, value) {
          checkAssertions(value, this.name);
          // The VM will perform JS to Wasm value conversion, according to the spec:
          // https://www.w3.org/TR/wasm-js-api-1/#towebassemblyvalue
          return value;
        }
      }
      registerType(primitiveType, {
        name: name,
        'fromWireType': fromWireType,
        'toWireType': toWireType,
        'argPackAdvance': 8,
        'readValueFromPointer': integerReadValueFromPointer(name, shift, minRange !== 0),
        destructorFunction: null, // This type does not need a destructor
      });
    }

  
  function __embind_register_memory_view(rawType, dataTypeIndex, name) {
      var typeMapping = [
        Int8Array,
        Uint8Array,
        Int16Array,
        Uint16Array,
        Int32Array,
        Uint32Array,
        Float32Array,
        Float64Array,
      ];
  
      var TA = typeMapping[dataTypeIndex];
  
      function decodeMemoryView(handle) {
        handle = handle >> 2;
        var heap = HEAPU32;
        var size = heap[handle]; // in elements
        var data = heap[handle + 1]; // byte offset into emscripten heap
        return new TA(heap.buffer, data, size);
      }
  
      name = readLatin1String(name);
      registerType(rawType, {
        name: name,
        'fromWireType': decodeMemoryView,
        'argPackAdvance': 8,
        'readValueFromPointer': decodeMemoryView,
      }, {
        ignoreDuplicateRegistrations: true,
      });
    }

  
  
  
  function __embind_register_std_string(rawType, name) {
      name = readLatin1String(name);
      var stdStringIsUTF8
      //process only std::string bindings with UTF8 support, in contrast to e.g. std::basic_string<unsigned char>
      = (name === "std::string");
  
      registerType(rawType, {
        name: name,
        'fromWireType': function(value) {
          var length = HEAPU32[((value)>>2)];
          var payload = value + 4;
  
          var str;
          if (stdStringIsUTF8) {
            var decodeStartPtr = payload;
            // Looping here to support possible embedded '0' bytes
            for (var i = 0; i <= length; ++i) {
              var currentBytePtr = payload + i;
              if (i == length || HEAPU8[currentBytePtr] == 0) {
                var maxRead = currentBytePtr - decodeStartPtr;
                var stringSegment = UTF8ToString(decodeStartPtr, maxRead);
                if (str === undefined) {
                  str = stringSegment;
                } else {
                  str += String.fromCharCode(0);
                  str += stringSegment;
                }
                decodeStartPtr = currentBytePtr + 1;
              }
            }
          } else {
            var a = new Array(length);
            for (var i = 0; i < length; ++i) {
              a[i] = String.fromCharCode(HEAPU8[payload + i]);
            }
            str = a.join('');
          }
  
          _free(value);
  
          return str;
        },
        'toWireType': function(destructors, value) {
          if (value instanceof ArrayBuffer) {
            value = new Uint8Array(value);
          }
  
          var length;
          var valueIsOfTypeString = (typeof value == 'string');
  
          if (!(valueIsOfTypeString || value instanceof Uint8Array || value instanceof Uint8ClampedArray || value instanceof Int8Array)) {
            throwBindingError('Cannot pass non-string to std::string');
          }
          if (stdStringIsUTF8 && valueIsOfTypeString) {
            length = lengthBytesUTF8(value);
          } else {
            length = value.length;
          }
  
          // assumes 4-byte alignment
          var base = _malloc(4 + length + 1);
          var ptr = base + 4;
          HEAPU32[((base)>>2)] = length;
          if (stdStringIsUTF8 && valueIsOfTypeString) {
            stringToUTF8(value, ptr, length + 1);
          } else {
            if (valueIsOfTypeString) {
              for (var i = 0; i < length; ++i) {
                var charCode = value.charCodeAt(i);
                if (charCode > 255) {
                  _free(ptr);
                  throwBindingError('String has UTF-16 code units that do not fit in 8 bits');
                }
                HEAPU8[ptr + i] = charCode;
              }
            } else {
              for (var i = 0; i < length; ++i) {
                HEAPU8[ptr + i] = value[i];
              }
            }
          }
  
          if (destructors !== null) {
            destructors.push(_free, base);
          }
          return base;
        },
        'argPackAdvance': 8,
        'readValueFromPointer': simpleReadValueFromPointer,
        destructorFunction: function(ptr) { _free(ptr); },
      });
    }

  
  
  
  var UTF16Decoder = typeof TextDecoder != 'undefined' ? new TextDecoder('utf-16le') : undefined;;
  function UTF16ToString(ptr, maxBytesToRead) {
      assert(ptr % 2 == 0, 'Pointer passed to UTF16ToString must be aligned to two bytes!');
      var endPtr = ptr;
      // TextDecoder needs to know the byte length in advance, it doesn't stop on
      // null terminator by itself.
      // Also, use the length info to avoid running tiny strings through
      // TextDecoder, since .subarray() allocates garbage.
      var idx = endPtr >> 1;
      var maxIdx = idx + maxBytesToRead / 2;
      // If maxBytesToRead is not passed explicitly, it will be undefined, and this
      // will always evaluate to true. This saves on code size.
      while (!(idx >= maxIdx) && HEAPU16[idx]) ++idx;
      endPtr = idx << 1;
  
      if (endPtr - ptr > 32 && UTF16Decoder)
        return UTF16Decoder.decode(HEAPU8.subarray(ptr, endPtr));
  
      // Fallback: decode without UTF16Decoder
      var str = '';
  
      // If maxBytesToRead is not passed explicitly, it will be undefined, and the
      // for-loop's condition will always evaluate to true. The loop is then
      // terminated on the first null char.
      for (var i = 0; !(i >= maxBytesToRead / 2); ++i) {
        var codeUnit = HEAP16[(((ptr)+(i*2))>>1)];
        if (codeUnit == 0) break;
        // fromCharCode constructs a character from a UTF-16 code unit, so we can
        // pass the UTF16 string right through.
        str += String.fromCharCode(codeUnit);
      }
  
      return str;
    }
  
  function stringToUTF16(str, outPtr, maxBytesToWrite) {
      assert(outPtr % 2 == 0, 'Pointer passed to stringToUTF16 must be aligned to two bytes!');
      assert(typeof maxBytesToWrite == 'number', 'stringToUTF16(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!');
      // Backwards compatibility: if max bytes is not specified, assume unsafe unbounded write is allowed.
      if (maxBytesToWrite === undefined) {
        maxBytesToWrite = 0x7FFFFFFF;
      }
      if (maxBytesToWrite < 2) return 0;
      maxBytesToWrite -= 2; // Null terminator.
      var startPtr = outPtr;
      var numCharsToWrite = (maxBytesToWrite < str.length*2) ? (maxBytesToWrite / 2) : str.length;
      for (var i = 0; i < numCharsToWrite; ++i) {
        // charCodeAt returns a UTF-16 encoded code unit, so it can be directly written to the HEAP.
        var codeUnit = str.charCodeAt(i); // possibly a lead surrogate
        HEAP16[((outPtr)>>1)] = codeUnit;
        outPtr += 2;
      }
      // Null-terminate the pointer to the HEAP.
      HEAP16[((outPtr)>>1)] = 0;
      return outPtr - startPtr;
    }
  
  function lengthBytesUTF16(str) {
      return str.length*2;
    }
  
  function UTF32ToString(ptr, maxBytesToRead) {
      assert(ptr % 4 == 0, 'Pointer passed to UTF32ToString must be aligned to four bytes!');
      var i = 0;
  
      var str = '';
      // If maxBytesToRead is not passed explicitly, it will be undefined, and this
      // will always evaluate to true. This saves on code size.
      while (!(i >= maxBytesToRead / 4)) {
        var utf32 = HEAP32[(((ptr)+(i*4))>>2)];
        if (utf32 == 0) break;
        ++i;
        // Gotcha: fromCharCode constructs a character from a UTF-16 encoded code (pair), not from a Unicode code point! So encode the code point to UTF-16 for constructing.
        // See http://unicode.org/faq/utf_bom.html#utf16-3
        if (utf32 >= 0x10000) {
          var ch = utf32 - 0x10000;
          str += String.fromCharCode(0xD800 | (ch >> 10), 0xDC00 | (ch & 0x3FF));
        } else {
          str += String.fromCharCode(utf32);
        }
      }
      return str;
    }
  
  function stringToUTF32(str, outPtr, maxBytesToWrite) {
      assert(outPtr % 4 == 0, 'Pointer passed to stringToUTF32 must be aligned to four bytes!');
      assert(typeof maxBytesToWrite == 'number', 'stringToUTF32(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!');
      // Backwards compatibility: if max bytes is not specified, assume unsafe unbounded write is allowed.
      if (maxBytesToWrite === undefined) {
        maxBytesToWrite = 0x7FFFFFFF;
      }
      if (maxBytesToWrite < 4) return 0;
      var startPtr = outPtr;
      var endPtr = startPtr + maxBytesToWrite - 4;
      for (var i = 0; i < str.length; ++i) {
        // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! We must decode the string to UTF-32 to the heap.
        // See http://unicode.org/faq/utf_bom.html#utf16-3
        var codeUnit = str.charCodeAt(i); // possibly a lead surrogate
        if (codeUnit >= 0xD800 && codeUnit <= 0xDFFF) {
          var trailSurrogate = str.charCodeAt(++i);
          codeUnit = 0x10000 + ((codeUnit & 0x3FF) << 10) | (trailSurrogate & 0x3FF);
        }
        HEAP32[((outPtr)>>2)] = codeUnit;
        outPtr += 4;
        if (outPtr + 4 > endPtr) break;
      }
      // Null-terminate the pointer to the HEAP.
      HEAP32[((outPtr)>>2)] = 0;
      return outPtr - startPtr;
    }
  
  function lengthBytesUTF32(str) {
      var len = 0;
      for (var i = 0; i < str.length; ++i) {
        // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! We must decode the string to UTF-32 to the heap.
        // See http://unicode.org/faq/utf_bom.html#utf16-3
        var codeUnit = str.charCodeAt(i);
        if (codeUnit >= 0xD800 && codeUnit <= 0xDFFF) ++i; // possibly a lead surrogate, so skip over the tail surrogate.
        len += 4;
      }
  
      return len;
    }
  function __embind_register_std_wstring(rawType, charSize, name) {
      name = readLatin1String(name);
      var decodeString, encodeString, getHeap, lengthBytesUTF, shift;
      if (charSize === 2) {
        decodeString = UTF16ToString;
        encodeString = stringToUTF16;
        lengthBytesUTF = lengthBytesUTF16;
        getHeap = () => HEAPU16;
        shift = 1;
      } else if (charSize === 4) {
        decodeString = UTF32ToString;
        encodeString = stringToUTF32;
        lengthBytesUTF = lengthBytesUTF32;
        getHeap = () => HEAPU32;
        shift = 2;
      }
      registerType(rawType, {
        name: name,
        'fromWireType': function(value) {
          // Code mostly taken from _embind_register_std_string fromWireType
          var length = HEAPU32[value >> 2];
          var HEAP = getHeap();
          var str;
  
          var decodeStartPtr = value + 4;
          // Looping here to support possible embedded '0' bytes
          for (var i = 0; i <= length; ++i) {
            var currentBytePtr = value + 4 + i * charSize;
            if (i == length || HEAP[currentBytePtr >> shift] == 0) {
              var maxReadBytes = currentBytePtr - decodeStartPtr;
              var stringSegment = decodeString(decodeStartPtr, maxReadBytes);
              if (str === undefined) {
                str = stringSegment;
              } else {
                str += String.fromCharCode(0);
                str += stringSegment;
              }
              decodeStartPtr = currentBytePtr + charSize;
            }
          }
  
          _free(value);
  
          return str;
        },
        'toWireType': function(destructors, value) {
          if (!(typeof value == 'string')) {
            throwBindingError('Cannot pass non-string to C++ string type ' + name);
          }
  
          // assumes 4-byte alignment
          var length = lengthBytesUTF(value);
          var ptr = _malloc(4 + length + charSize);
          HEAPU32[ptr >> 2] = length >> shift;
  
          encodeString(value, ptr + 4, length + charSize);
  
          if (destructors !== null) {
            destructors.push(_free, ptr);
          }
          return ptr;
        },
        'argPackAdvance': 8,
        'readValueFromPointer': simpleReadValueFromPointer,
        destructorFunction: function(ptr) { _free(ptr); },
      });
    }

  
  function __embind_register_void(rawType, name) {
      name = readLatin1String(name);
      registerType(rawType, {
          isVoid: true, // void return values can be optimized out sometimes
          name: name,
          'argPackAdvance': 0,
          'fromWireType': function() {
              return undefined;
          },
          'toWireType': function(destructors, o) {
              // TODO: assert if anything else is given?
              return undefined;
          },
      });
    }

  function _abort() {
      abort('native code called abort()');
    }

  function _emscripten_memcpy_big(dest, src, num) {
      HEAPU8.copyWithin(dest, src, src + num);
    }

  function getHeapMax() {
      // Stay one Wasm page short of 4GB: while e.g. Chrome is able to allocate
      // full 4GB Wasm memories, the size will wrap back to 0 bytes in Wasm side
      // for any code that deals with heap sizes, which would require special
      // casing all heap size related code to treat 0 specially.
      return 2147483648;
    }
  
  function emscripten_realloc_buffer(size) {
      var b = wasmMemory.buffer;
      try {
        // round size grow request up to wasm page size (fixed 64KB per spec)
        wasmMemory.grow((size - b.byteLength + 65535) >>> 16); // .grow() takes a delta compared to the previous size
        updateMemoryViews();
        return 1 /*success*/;
      } catch(e) {
        err('emscripten_realloc_buffer: Attempted to grow heap from ' + b.byteLength  + ' bytes to ' + size + ' bytes, but got error: ' + e);
      }
      // implicit 0 return to save code size (caller will cast "undefined" into 0
      // anyhow)
    }
  function _emscripten_resize_heap(requestedSize) {
      var oldSize = HEAPU8.length;
      requestedSize = requestedSize >>> 0;
      // With multithreaded builds, races can happen (another thread might increase the size
      // in between), so return a failure, and let the caller retry.
      assert(requestedSize > oldSize);
  
      // Memory resize rules:
      // 1.  Always increase heap size to at least the requested size, rounded up
      //     to next page multiple.
      // 2a. If MEMORY_GROWTH_LINEAR_STEP == -1, excessively resize the heap
      //     geometrically: increase the heap size according to
      //     MEMORY_GROWTH_GEOMETRIC_STEP factor (default +20%), At most
      //     overreserve by MEMORY_GROWTH_GEOMETRIC_CAP bytes (default 96MB).
      // 2b. If MEMORY_GROWTH_LINEAR_STEP != -1, excessively resize the heap
      //     linearly: increase the heap size by at least
      //     MEMORY_GROWTH_LINEAR_STEP bytes.
      // 3.  Max size for the heap is capped at 2048MB-WASM_PAGE_SIZE, or by
      //     MAXIMUM_MEMORY, or by ASAN limit, depending on which is smallest
      // 4.  If we were unable to allocate as much memory, it may be due to
      //     over-eager decision to excessively reserve due to (3) above.
      //     Hence if an allocation fails, cut down on the amount of excess
      //     growth, in an attempt to succeed to perform a smaller allocation.
  
      // A limit is set for how much we can grow. We should not exceed that
      // (the wasm binary specifies it, so if we tried, we'd fail anyhow).
      var maxHeapSize = getHeapMax();
      if (requestedSize > maxHeapSize) {
        err('Cannot enlarge memory, asked to go up to ' + requestedSize + ' bytes, but the limit is ' + maxHeapSize + ' bytes!');
        return false;
      }
  
      let alignUp = (x, multiple) => x + (multiple - x % multiple) % multiple;
  
      // Loop through potential heap size increases. If we attempt a too eager
      // reservation that fails, cut down on the attempted size and reserve a
      // smaller bump instead. (max 3 times, chosen somewhat arbitrarily)
      for (var cutDown = 1; cutDown <= 4; cutDown *= 2) {
        var overGrownHeapSize = oldSize * (1 + 0.2 / cutDown); // ensure geometric growth
        // but limit overreserving (default to capping at +96MB overgrowth at most)
        overGrownHeapSize = Math.min(overGrownHeapSize, requestedSize + 100663296 );
  
        var newSize = Math.min(maxHeapSize, alignUp(Math.max(requestedSize, overGrownHeapSize), 65536));
  
        var replacement = emscripten_realloc_buffer(newSize);
        if (replacement) {
  
          return true;
        }
      }
      err('Failed to grow the heap from ' + oldSize + ' bytes to ' + newSize + ' bytes, not enough memory!');
      return false;
    }

  var ENV = {};
  
  function getExecutableName() {
      return thisProgram || './this.program';
    }
  function getEnvStrings() {
      if (!getEnvStrings.strings) {
        // Default values.
        // Browser language detection #8751
        var lang = ((typeof navigator == 'object' && navigator.languages && navigator.languages[0]) || 'C').replace('-', '_') + '.UTF-8';
        var env = {
          'USER': 'web_user',
          'LOGNAME': 'web_user',
          'PATH': '/',
          'PWD': '/',
          'HOME': '/home/web_user',
          'LANG': lang,
          '_': getExecutableName()
        };
        // Apply the user-provided values, if any.
        for (var x in ENV) {
          // x is a key in ENV; if ENV[x] is undefined, that means it was
          // explicitly set to be so. We allow user code to do that to
          // force variables with default values to remain unset.
          if (ENV[x] === undefined) delete env[x];
          else env[x] = ENV[x];
        }
        var strings = [];
        for (var x in env) {
          strings.push(x + '=' + env[x]);
        }
        getEnvStrings.strings = strings;
      }
      return getEnvStrings.strings;
    }
  
  /** @param {boolean=} dontAddNull */
  function writeAsciiToMemory(str, buffer, dontAddNull) {
      for (var i = 0; i < str.length; ++i) {
        assert(str.charCodeAt(i) === (str.charCodeAt(i) & 0xff));
        HEAP8[((buffer++)>>0)] = str.charCodeAt(i);
      }
      // Null-terminate the pointer to the HEAP.
      if (!dontAddNull) HEAP8[((buffer)>>0)] = 0;
    }
  
  var PATH = {isAbs:(path) => path.charAt(0) === '/',splitPath:(filename) => {
        var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
        return splitPathRe.exec(filename).slice(1);
      },normalizeArray:(parts, allowAboveRoot) => {
        // if the path tries to go above the root, `up` ends up > 0
        var up = 0;
        for (var i = parts.length - 1; i >= 0; i--) {
          var last = parts[i];
          if (last === '.') {
            parts.splice(i, 1);
          } else if (last === '..') {
            parts.splice(i, 1);
            up++;
          } else if (up) {
            parts.splice(i, 1);
            up--;
          }
        }
        // if the path is allowed to go above the root, restore leading ..s
        if (allowAboveRoot) {
          for (; up; up--) {
            parts.unshift('..');
          }
        }
        return parts;
      },normalize:(path) => {
        var isAbsolute = PATH.isAbs(path),
            trailingSlash = path.substr(-1) === '/';
        // Normalize the path
        path = PATH.normalizeArray(path.split('/').filter((p) => !!p), !isAbsolute).join('/');
        if (!path && !isAbsolute) {
          path = '.';
        }
        if (path && trailingSlash) {
          path += '/';
        }
        return (isAbsolute ? '/' : '') + path;
      },dirname:(path) => {
        var result = PATH.splitPath(path),
            root = result[0],
            dir = result[1];
        if (!root && !dir) {
          // No dirname whatsoever
          return '.';
        }
        if (dir) {
          // It has a dirname, strip trailing slash
          dir = dir.substr(0, dir.length - 1);
        }
        return root + dir;
      },basename:(path) => {
        // EMSCRIPTEN return '/'' for '/', not an empty string
        if (path === '/') return '/';
        path = PATH.normalize(path);
        path = path.replace(/\/$/, "");
        var lastSlash = path.lastIndexOf('/');
        if (lastSlash === -1) return path;
        return path.substr(lastSlash+1);
      },join:function() {
        var paths = Array.prototype.slice.call(arguments);
        return PATH.normalize(paths.join('/'));
      },join2:(l, r) => {
        return PATH.normalize(l + '/' + r);
      }};
  
  function getRandomDevice() {
      if (typeof crypto == 'object' && typeof crypto['getRandomValues'] == 'function') {
        // for modern web browsers
        var randomBuffer = new Uint8Array(1);
        return () => { crypto.getRandomValues(randomBuffer); return randomBuffer[0]; };
      } else
      // we couldn't find a proper implementation, as Math.random() is not suitable for /dev/random, see emscripten-core/emscripten/pull/7096
      return () => abort("no cryptographic support found for randomDevice. consider polyfilling it if you want to use something insecure like Math.random(), e.g. put this in a --pre-js: var crypto = { getRandomValues: function(array) { for (var i = 0; i < array.length; i++) array[i] = (Math.random()*256)|0 } };");
    }
  
  
  
  var PATH_FS = {resolve:function() {
        var resolvedPath = '',
          resolvedAbsolute = false;
        for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
          var path = (i >= 0) ? arguments[i] : FS.cwd();
          // Skip empty and invalid entries
          if (typeof path != 'string') {
            throw new TypeError('Arguments to path.resolve must be strings');
          } else if (!path) {
            return ''; // an invalid portion invalidates the whole thing
          }
          resolvedPath = path + '/' + resolvedPath;
          resolvedAbsolute = PATH.isAbs(path);
        }
        // At this point the path should be resolved to a full absolute path, but
        // handle relative paths to be safe (might happen when process.cwd() fails)
        resolvedPath = PATH.normalizeArray(resolvedPath.split('/').filter((p) => !!p), !resolvedAbsolute).join('/');
        return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
      },relative:(from, to) => {
        from = PATH_FS.resolve(from).substr(1);
        to = PATH_FS.resolve(to).substr(1);
        function trim(arr) {
          var start = 0;
          for (; start < arr.length; start++) {
            if (arr[start] !== '') break;
          }
          var end = arr.length - 1;
          for (; end >= 0; end--) {
            if (arr[end] !== '') break;
          }
          if (start > end) return [];
          return arr.slice(start, end - start + 1);
        }
        var fromParts = trim(from.split('/'));
        var toParts = trim(to.split('/'));
        var length = Math.min(fromParts.length, toParts.length);
        var samePartsLength = length;
        for (var i = 0; i < length; i++) {
          if (fromParts[i] !== toParts[i]) {
            samePartsLength = i;
            break;
          }
        }
        var outputParts = [];
        for (var i = samePartsLength; i < fromParts.length; i++) {
          outputParts.push('..');
        }
        outputParts = outputParts.concat(toParts.slice(samePartsLength));
        return outputParts.join('/');
      }};
  
  
  /** @type {function(string, boolean=, number=)} */
  function intArrayFromString(stringy, dontAddNull, length) {
    var len = length > 0 ? length : lengthBytesUTF8(stringy)+1;
    var u8array = new Array(len);
    var numBytesWritten = stringToUTF8Array(stringy, u8array, 0, u8array.length);
    if (dontAddNull) u8array.length = numBytesWritten;
    return u8array;
  }
  var TTY = {ttys:[],init:function () {
        // https://github.com/emscripten-core/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // currently, FS.init does not distinguish if process.stdin is a file or TTY
        //   // device, it always assumes it's a TTY device. because of this, we're forcing
        //   // process.stdin to UTF8 encoding to at least make stdin reading compatible
        //   // with text files until FS.init can be refactored.
        //   process['stdin']['setEncoding']('utf8');
        // }
      },shutdown:function() {
        // https://github.com/emscripten-core/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // inolen: any idea as to why node -e 'process.stdin.read()' wouldn't exit immediately (with process.stdin being a tty)?
        //   // isaacs: because now it's reading from the stream, you've expressed interest in it, so that read() kicks off a _read() which creates a ReadReq operation
        //   // inolen: I thought read() in that case was a synchronous operation that just grabbed some amount of buffered data if it exists?
        //   // isaacs: it is. but it also triggers a _read() call, which calls readStart() on the handle
        //   // isaacs: do process.stdin.pause() and i'd think it'd probably close the pending call
        //   process['stdin']['pause']();
        // }
      },register:function(dev, ops) {
        TTY.ttys[dev] = { input: [], output: [], ops: ops };
        FS.registerDevice(dev, TTY.stream_ops);
      },stream_ops:{open:function(stream) {
          var tty = TTY.ttys[stream.node.rdev];
          if (!tty) {
            throw new FS.ErrnoError(43);
          }
          stream.tty = tty;
          stream.seekable = false;
        },close:function(stream) {
          // flush any pending line data
          stream.tty.ops.fsync(stream.tty);
        },fsync:function(stream) {
          stream.tty.ops.fsync(stream.tty);
        },read:function(stream, buffer, offset, length, pos /* ignored */) {
          if (!stream.tty || !stream.tty.ops.get_char) {
            throw new FS.ErrnoError(60);
          }
          var bytesRead = 0;
          for (var i = 0; i < length; i++) {
            var result;
            try {
              result = stream.tty.ops.get_char(stream.tty);
            } catch (e) {
              throw new FS.ErrnoError(29);
            }
            if (result === undefined && bytesRead === 0) {
              throw new FS.ErrnoError(6);
            }
            if (result === null || result === undefined) break;
            bytesRead++;
            buffer[offset+i] = result;
          }
          if (bytesRead) {
            stream.node.timestamp = Date.now();
          }
          return bytesRead;
        },write:function(stream, buffer, offset, length, pos) {
          if (!stream.tty || !stream.tty.ops.put_char) {
            throw new FS.ErrnoError(60);
          }
          try {
            for (var i = 0; i < length; i++) {
              stream.tty.ops.put_char(stream.tty, buffer[offset+i]);
            }
          } catch (e) {
            throw new FS.ErrnoError(29);
          }
          if (length) {
            stream.node.timestamp = Date.now();
          }
          return i;
        }},default_tty_ops:{get_char:function(tty) {
          if (!tty.input.length) {
            var result = null;
            if (typeof window != 'undefined' &&
              typeof window.prompt == 'function') {
              // Browser.
              result = window.prompt('Input: ');  // returns null on cancel
              if (result !== null) {
                result += '\n';
              }
            } else if (typeof readline == 'function') {
              // Command line.
              result = readline();
              if (result !== null) {
                result += '\n';
              }
            }
            if (!result) {
              return null;
            }
            tty.input = intArrayFromString(result, true);
          }
          return tty.input.shift();
        },put_char:function(tty, val) {
          if (val === null || val === 10) {
            out(UTF8ArrayToString(tty.output, 0));
            tty.output = [];
          } else {
            if (val != 0) tty.output.push(val); // val == 0 would cut text output off in the middle.
          }
        },fsync:function(tty) {
          if (tty.output && tty.output.length > 0) {
            out(UTF8ArrayToString(tty.output, 0));
            tty.output = [];
          }
        }},default_tty1_ops:{put_char:function(tty, val) {
          if (val === null || val === 10) {
            err(UTF8ArrayToString(tty.output, 0));
            tty.output = [];
          } else {
            if (val != 0) tty.output.push(val);
          }
        },fsync:function(tty) {
          if (tty.output && tty.output.length > 0) {
            err(UTF8ArrayToString(tty.output, 0));
            tty.output = [];
          }
        }}};
  
  
  function zeroMemory(address, size) {
      HEAPU8.fill(0, address, address + size);
      return address;
    }
  
  function alignMemory(size, alignment) {
      assert(alignment, "alignment argument is required");
      return Math.ceil(size / alignment) * alignment;
    }
  function mmapAlloc(size) {
      abort('internal error: mmapAlloc called but `emscripten_builtin_memalign` native symbol not exported');
    }
  var MEMFS = {ops_table:null,mount:function(mount) {
        return MEMFS.createNode(null, '/', 16384 | 511 /* 0777 */, 0);
      },createNode:function(parent, name, mode, dev) {
        if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
          // no supported
          throw new FS.ErrnoError(63);
        }
        if (!MEMFS.ops_table) {
          MEMFS.ops_table = {
            dir: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr,
                lookup: MEMFS.node_ops.lookup,
                mknod: MEMFS.node_ops.mknod,
                rename: MEMFS.node_ops.rename,
                unlink: MEMFS.node_ops.unlink,
                rmdir: MEMFS.node_ops.rmdir,
                readdir: MEMFS.node_ops.readdir,
                symlink: MEMFS.node_ops.symlink
              },
              stream: {
                llseek: MEMFS.stream_ops.llseek
              }
            },
            file: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr
              },
              stream: {
                llseek: MEMFS.stream_ops.llseek,
                read: MEMFS.stream_ops.read,
                write: MEMFS.stream_ops.write,
                allocate: MEMFS.stream_ops.allocate,
                mmap: MEMFS.stream_ops.mmap,
                msync: MEMFS.stream_ops.msync
              }
            },
            link: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr,
                readlink: MEMFS.node_ops.readlink
              },
              stream: {}
            },
            chrdev: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr
              },
              stream: FS.chrdev_stream_ops
            }
          };
        }
        var node = FS.createNode(parent, name, mode, dev);
        if (FS.isDir(node.mode)) {
          node.node_ops = MEMFS.ops_table.dir.node;
          node.stream_ops = MEMFS.ops_table.dir.stream;
          node.contents = {};
        } else if (FS.isFile(node.mode)) {
          node.node_ops = MEMFS.ops_table.file.node;
          node.stream_ops = MEMFS.ops_table.file.stream;
          node.usedBytes = 0; // The actual number of bytes used in the typed array, as opposed to contents.length which gives the whole capacity.
          // When the byte data of the file is populated, this will point to either a typed array, or a normal JS array. Typed arrays are preferred
          // for performance, and used by default. However, typed arrays are not resizable like normal JS arrays are, so there is a small disk size
          // penalty involved for appending file writes that continuously grow a file similar to std::vector capacity vs used -scheme.
          node.contents = null; 
        } else if (FS.isLink(node.mode)) {
          node.node_ops = MEMFS.ops_table.link.node;
          node.stream_ops = MEMFS.ops_table.link.stream;
        } else if (FS.isChrdev(node.mode)) {
          node.node_ops = MEMFS.ops_table.chrdev.node;
          node.stream_ops = MEMFS.ops_table.chrdev.stream;
        }
        node.timestamp = Date.now();
        // add the new node to the parent
        if (parent) {
          parent.contents[name] = node;
          parent.timestamp = node.timestamp;
        }
        return node;
      },getFileDataAsTypedArray:function(node) {
        if (!node.contents) return new Uint8Array(0);
        if (node.contents.subarray) return node.contents.subarray(0, node.usedBytes); // Make sure to not return excess unused bytes.
        return new Uint8Array(node.contents);
      },expandFileStorage:function(node, newCapacity) {
        var prevCapacity = node.contents ? node.contents.length : 0;
        if (prevCapacity >= newCapacity) return; // No need to expand, the storage was already large enough.
        // Don't expand strictly to the given requested limit if it's only a very small increase, but instead geometrically grow capacity.
        // For small filesizes (<1MB), perform size*2 geometric increase, but for large sizes, do a much more conservative size*1.125 increase to
        // avoid overshooting the allocation cap by a very large margin.
        var CAPACITY_DOUBLING_MAX = 1024 * 1024;
        newCapacity = Math.max(newCapacity, (prevCapacity * (prevCapacity < CAPACITY_DOUBLING_MAX ? 2.0 : 1.125)) >>> 0);
        if (prevCapacity != 0) newCapacity = Math.max(newCapacity, 256); // At minimum allocate 256b for each file when expanding.
        var oldContents = node.contents;
        node.contents = new Uint8Array(newCapacity); // Allocate new storage.
        if (node.usedBytes > 0) node.contents.set(oldContents.subarray(0, node.usedBytes), 0); // Copy old data over to the new storage.
      },resizeFileStorage:function(node, newSize) {
        if (node.usedBytes == newSize) return;
        if (newSize == 0) {
          node.contents = null; // Fully decommit when requesting a resize to zero.
          node.usedBytes = 0;
        } else {
          var oldContents = node.contents;
          node.contents = new Uint8Array(newSize); // Allocate new storage.
          if (oldContents) {
            node.contents.set(oldContents.subarray(0, Math.min(newSize, node.usedBytes))); // Copy old data over to the new storage.
          }
          node.usedBytes = newSize;
        }
      },node_ops:{getattr:function(node) {
          var attr = {};
          // device numbers reuse inode numbers.
          attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
          attr.ino = node.id;
          attr.mode = node.mode;
          attr.nlink = 1;
          attr.uid = 0;
          attr.gid = 0;
          attr.rdev = node.rdev;
          if (FS.isDir(node.mode)) {
            attr.size = 4096;
          } else if (FS.isFile(node.mode)) {
            attr.size = node.usedBytes;
          } else if (FS.isLink(node.mode)) {
            attr.size = node.link.length;
          } else {
            attr.size = 0;
          }
          attr.atime = new Date(node.timestamp);
          attr.mtime = new Date(node.timestamp);
          attr.ctime = new Date(node.timestamp);
          // NOTE: In our implementation, st_blocks = Math.ceil(st_size/st_blksize),
          //       but this is not required by the standard.
          attr.blksize = 4096;
          attr.blocks = Math.ceil(attr.size / attr.blksize);
          return attr;
        },setattr:function(node, attr) {
          if (attr.mode !== undefined) {
            node.mode = attr.mode;
          }
          if (attr.timestamp !== undefined) {
            node.timestamp = attr.timestamp;
          }
          if (attr.size !== undefined) {
            MEMFS.resizeFileStorage(node, attr.size);
          }
        },lookup:function(parent, name) {
          throw FS.genericErrors[44];
        },mknod:function(parent, name, mode, dev) {
          return MEMFS.createNode(parent, name, mode, dev);
        },rename:function(old_node, new_dir, new_name) {
          // if we're overwriting a directory at new_name, make sure it's empty.
          if (FS.isDir(old_node.mode)) {
            var new_node;
            try {
              new_node = FS.lookupNode(new_dir, new_name);
            } catch (e) {
            }
            if (new_node) {
              for (var i in new_node.contents) {
                throw new FS.ErrnoError(55);
              }
            }
          }
          // do the internal rewiring
          delete old_node.parent.contents[old_node.name];
          old_node.parent.timestamp = Date.now()
          old_node.name = new_name;
          new_dir.contents[new_name] = old_node;
          new_dir.timestamp = old_node.parent.timestamp;
          old_node.parent = new_dir;
        },unlink:function(parent, name) {
          delete parent.contents[name];
          parent.timestamp = Date.now();
        },rmdir:function(parent, name) {
          var node = FS.lookupNode(parent, name);
          for (var i in node.contents) {
            throw new FS.ErrnoError(55);
          }
          delete parent.contents[name];
          parent.timestamp = Date.now();
        },readdir:function(node) {
          var entries = ['.', '..'];
          for (var key in node.contents) {
            if (!node.contents.hasOwnProperty(key)) {
              continue;
            }
            entries.push(key);
          }
          return entries;
        },symlink:function(parent, newname, oldpath) {
          var node = MEMFS.createNode(parent, newname, 511 /* 0777 */ | 40960, 0);
          node.link = oldpath;
          return node;
        },readlink:function(node) {
          if (!FS.isLink(node.mode)) {
            throw new FS.ErrnoError(28);
          }
          return node.link;
        }},stream_ops:{read:function(stream, buffer, offset, length, position) {
          var contents = stream.node.contents;
          if (position >= stream.node.usedBytes) return 0;
          var size = Math.min(stream.node.usedBytes - position, length);
          assert(size >= 0);
          if (size > 8 && contents.subarray) { // non-trivial, and typed array
            buffer.set(contents.subarray(position, position + size), offset);
          } else {
            for (var i = 0; i < size; i++) buffer[offset + i] = contents[position + i];
          }
          return size;
        },write:function(stream, buffer, offset, length, position, canOwn) {
          // The data buffer should be a typed array view
          assert(!(buffer instanceof ArrayBuffer));
          // If the buffer is located in main memory (HEAP), and if
          // memory can grow, we can't hold on to references of the
          // memory buffer, as they may get invalidated. That means we
          // need to do copy its contents.
          if (buffer.buffer === HEAP8.buffer) {
            canOwn = false;
          }
  
          if (!length) return 0;
          var node = stream.node;
          node.timestamp = Date.now();
  
          if (buffer.subarray && (!node.contents || node.contents.subarray)) { // This write is from a typed array to a typed array?
            if (canOwn) {
              assert(position === 0, 'canOwn must imply no weird position inside the file');
              node.contents = buffer.subarray(offset, offset + length);
              node.usedBytes = length;
              return length;
            } else if (node.usedBytes === 0 && position === 0) { // If this is a simple first write to an empty file, do a fast set since we don't need to care about old data.
              node.contents = buffer.slice(offset, offset + length);
              node.usedBytes = length;
              return length;
            } else if (position + length <= node.usedBytes) { // Writing to an already allocated and used subrange of the file?
              node.contents.set(buffer.subarray(offset, offset + length), position);
              return length;
            }
          }
  
          // Appending to an existing file and we need to reallocate, or source data did not come as a typed array.
          MEMFS.expandFileStorage(node, position+length);
          if (node.contents.subarray && buffer.subarray) {
            // Use typed array write which is available.
            node.contents.set(buffer.subarray(offset, offset + length), position);
          } else {
            for (var i = 0; i < length; i++) {
             node.contents[position + i] = buffer[offset + i]; // Or fall back to manual write if not.
            }
          }
          node.usedBytes = Math.max(node.usedBytes, position + length);
          return length;
        },llseek:function(stream, offset, whence) {
          var position = offset;
          if (whence === 1) {
            position += stream.position;
          } else if (whence === 2) {
            if (FS.isFile(stream.node.mode)) {
              position += stream.node.usedBytes;
            }
          }
          if (position < 0) {
            throw new FS.ErrnoError(28);
          }
          return position;
        },allocate:function(stream, offset, length) {
          MEMFS.expandFileStorage(stream.node, offset + length);
          stream.node.usedBytes = Math.max(stream.node.usedBytes, offset + length);
        },mmap:function(stream, length, position, prot, flags) {
          if (!FS.isFile(stream.node.mode)) {
            throw new FS.ErrnoError(43);
          }
          var ptr;
          var allocated;
          var contents = stream.node.contents;
          // Only make a new copy when MAP_PRIVATE is specified.
          if (!(flags & 2) && contents.buffer === HEAP8.buffer) {
            // We can't emulate MAP_SHARED when the file is not backed by the
            // buffer we're mapping to (e.g. the HEAP buffer).
            allocated = false;
            ptr = contents.byteOffset;
          } else {
            // Try to avoid unnecessary slices.
            if (position > 0 || position + length < contents.length) {
              if (contents.subarray) {
                contents = contents.subarray(position, position + length);
              } else {
                contents = Array.prototype.slice.call(contents, position, position + length);
              }
            }
            allocated = true;
            ptr = mmapAlloc(length);
            if (!ptr) {
              throw new FS.ErrnoError(48);
            }
            HEAP8.set(contents, ptr);
          }
          return { ptr: ptr, allocated: allocated };
        },msync:function(stream, buffer, offset, length, mmapFlags) {
          MEMFS.stream_ops.write(stream, buffer, 0, length, offset, false);
          // should we check if bytesWritten and length are the same?
          return 0;
        }}};
  
  /** @param {boolean=} noRunDep */
  function asyncLoad(url, onload, onerror, noRunDep) {
      var dep = !noRunDep ? getUniqueRunDependency('al ' + url) : '';
      readAsync(url, (arrayBuffer) => {
        assert(arrayBuffer, 'Loading data file "' + url + '" failed (no arrayBuffer).');
        onload(new Uint8Array(arrayBuffer));
        if (dep) removeRunDependency(dep);
      }, (event) => {
        if (onerror) {
          onerror();
        } else {
          throw 'Loading data file "' + url + '" failed.';
        }
      });
      if (dep) addRunDependency(dep);
    }
  
  
  var ERRNO_MESSAGES = {0:"Success",1:"Arg list too long",2:"Permission denied",3:"Address already in use",4:"Address not available",5:"Address family not supported by protocol family",6:"No more processes",7:"Socket already connected",8:"Bad file number",9:"Trying to read unreadable message",10:"Mount device busy",11:"Operation canceled",12:"No children",13:"Connection aborted",14:"Connection refused",15:"Connection reset by peer",16:"File locking deadlock error",17:"Destination address required",18:"Math arg out of domain of func",19:"Quota exceeded",20:"File exists",21:"Bad address",22:"File too large",23:"Host is unreachable",24:"Identifier removed",25:"Illegal byte sequence",26:"Connection already in progress",27:"Interrupted system call",28:"Invalid argument",29:"I/O error",30:"Socket is already connected",31:"Is a directory",32:"Too many symbolic links",33:"Too many open files",34:"Too many links",35:"Message too long",36:"Multihop attempted",37:"File or path name too long",38:"Network interface is not configured",39:"Connection reset by network",40:"Network is unreachable",41:"Too many open files in system",42:"No buffer space available",43:"No such device",44:"No such file or directory",45:"Exec format error",46:"No record locks available",47:"The link has been severed",48:"Not enough core",49:"No message of desired type",50:"Protocol not available",51:"No space left on device",52:"Function not implemented",53:"Socket is not connected",54:"Not a directory",55:"Directory not empty",56:"State not recoverable",57:"Socket operation on non-socket",59:"Not a typewriter",60:"No such device or address",61:"Value too large for defined data type",62:"Previous owner died",63:"Not super-user",64:"Broken pipe",65:"Protocol error",66:"Unknown protocol",67:"Protocol wrong type for socket",68:"Math result not representable",69:"Read only file system",70:"Illegal seek",71:"No such process",72:"Stale file handle",73:"Connection timed out",74:"Text file busy",75:"Cross-device link",100:"Device not a stream",101:"Bad font file fmt",102:"Invalid slot",103:"Invalid request code",104:"No anode",105:"Block device required",106:"Channel number out of range",107:"Level 3 halted",108:"Level 3 reset",109:"Link number out of range",110:"Protocol driver not attached",111:"No CSI structure available",112:"Level 2 halted",113:"Invalid exchange",114:"Invalid request descriptor",115:"Exchange full",116:"No data (for no delay io)",117:"Timer expired",118:"Out of streams resources",119:"Machine is not on the network",120:"Package not installed",121:"The object is remote",122:"Advertise error",123:"Srmount error",124:"Communication error on send",125:"Cross mount point (not really error)",126:"Given log. name not unique",127:"f.d. invalid for this operation",128:"Remote address changed",129:"Can   access a needed shared lib",130:"Accessing a corrupted shared lib",131:".lib section in a.out corrupted",132:"Attempting to link in too many libs",133:"Attempting to exec a shared library",135:"Streams pipe error",136:"Too many users",137:"Socket type not supported",138:"Not supported",139:"Protocol family not supported",140:"Can't send after socket shutdown",141:"Too many references",142:"Host is down",148:"No medium (in tape drive)",156:"Level 2 not synchronized"};
  
  var ERRNO_CODES = {};
  
  function demangle(func) {
      warnOnce('warning: build with -sDEMANGLE_SUPPORT to link in libcxxabi demangling');
      return func;
    }
  function demangleAll(text) {
      var regex =
        /\b_Z[\w\d_]+/g;
      return text.replace(regex,
        function(x) {
          var y = demangle(x);
          return x === y ? x : (y + ' [' + x + ']');
        });
    }
  var FS = {root:null,mounts:[],devices:{},streams:[],nextInode:1,nameTable:null,currentPath:"/",initialized:false,ignorePermissions:true,ErrnoError:null,genericErrors:{},filesystems:null,syncFSRequests:0,lookupPath:(path, opts = {}) => {
        path = PATH_FS.resolve(path);
  
        if (!path) return { path: '', node: null };
  
        var defaults = {
          follow_mount: true,
          recurse_count: 0
        };
        opts = Object.assign(defaults, opts)
  
        if (opts.recurse_count > 8) {  // max recursive lookup of 8
          throw new FS.ErrnoError(32);
        }
  
        // split the absolute path
        var parts = path.split('/').filter((p) => !!p);
  
        // start at the root
        var current = FS.root;
        var current_path = '/';
  
        for (var i = 0; i < parts.length; i++) {
          var islast = (i === parts.length-1);
          if (islast && opts.parent) {
            // stop resolving
            break;
          }
  
          current = FS.lookupNode(current, parts[i]);
          current_path = PATH.join2(current_path, parts[i]);
  
          // jump to the mount's root node if this is a mountpoint
          if (FS.isMountpoint(current)) {
            if (!islast || (islast && opts.follow_mount)) {
              current = current.mounted.root;
            }
          }
  
          // by default, lookupPath will not follow a symlink if it is the final path component.
          // setting opts.follow = true will override this behavior.
          if (!islast || opts.follow) {
            var count = 0;
            while (FS.isLink(current.mode)) {
              var link = FS.readlink(current_path);
              current_path = PATH_FS.resolve(PATH.dirname(current_path), link);
  
              var lookup = FS.lookupPath(current_path, { recurse_count: opts.recurse_count + 1 });
              current = lookup.node;
  
              if (count++ > 40) {  // limit max consecutive symlinks to 40 (SYMLOOP_MAX).
                throw new FS.ErrnoError(32);
              }
            }
          }
        }
  
        return { path: current_path, node: current };
      },getPath:(node) => {
        var path;
        while (true) {
          if (FS.isRoot(node)) {
            var mount = node.mount.mountpoint;
            if (!path) return mount;
            return mount[mount.length-1] !== '/' ? mount + '/' + path : mount + path;
          }
          path = path ? node.name + '/' + path : node.name;
          node = node.parent;
        }
      },hashName:(parentid, name) => {
        var hash = 0;
  
        for (var i = 0; i < name.length; i++) {
          hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
        }
        return ((parentid + hash) >>> 0) % FS.nameTable.length;
      },hashAddNode:(node) => {
        var hash = FS.hashName(node.parent.id, node.name);
        node.name_next = FS.nameTable[hash];
        FS.nameTable[hash] = node;
      },hashRemoveNode:(node) => {
        var hash = FS.hashName(node.parent.id, node.name);
        if (FS.nameTable[hash] === node) {
          FS.nameTable[hash] = node.name_next;
        } else {
          var current = FS.nameTable[hash];
          while (current) {
            if (current.name_next === node) {
              current.name_next = node.name_next;
              break;
            }
            current = current.name_next;
          }
        }
      },lookupNode:(parent, name) => {
        var errCode = FS.mayLookup(parent);
        if (errCode) {
          throw new FS.ErrnoError(errCode, parent);
        }
        var hash = FS.hashName(parent.id, name);
        for (var node = FS.nameTable[hash]; node; node = node.name_next) {
          var nodeName = node.name;
          if (node.parent.id === parent.id && nodeName === name) {
            return node;
          }
        }
        // if we failed to find it in the cache, call into the VFS
        return FS.lookup(parent, name);
      },createNode:(parent, name, mode, rdev) => {
        assert(typeof parent == 'object')
        var node = new FS.FSNode(parent, name, mode, rdev);
  
        FS.hashAddNode(node);
  
        return node;
      },destroyNode:(node) => {
        FS.hashRemoveNode(node);
      },isRoot:(node) => {
        return node === node.parent;
      },isMountpoint:(node) => {
        return !!node.mounted;
      },isFile:(mode) => {
        return (mode & 61440) === 32768;
      },isDir:(mode) => {
        return (mode & 61440) === 16384;
      },isLink:(mode) => {
        return (mode & 61440) === 40960;
      },isChrdev:(mode) => {
        return (mode & 61440) === 8192;
      },isBlkdev:(mode) => {
        return (mode & 61440) === 24576;
      },isFIFO:(mode) => {
        return (mode & 61440) === 4096;
      },isSocket:(mode) => {
        return (mode & 49152) === 49152;
      },flagModes:{"r":0,"r+":2,"w":577,"w+":578,"a":1089,"a+":1090},modeStringToFlags:(str) => {
        var flags = FS.flagModes[str];
        if (typeof flags == 'undefined') {
          throw new Error('Unknown file open mode: ' + str);
        }
        return flags;
      },flagsToPermissionString:(flag) => {
        var perms = ['r', 'w', 'rw'][flag & 3];
        if ((flag & 512)) {
          perms += 'w';
        }
        return perms;
      },nodePermissions:(node, perms) => {
        if (FS.ignorePermissions) {
          return 0;
        }
        // return 0 if any user, group or owner bits are set.
        if (perms.includes('r') && !(node.mode & 292)) {
          return 2;
        } else if (perms.includes('w') && !(node.mode & 146)) {
          return 2;
        } else if (perms.includes('x') && !(node.mode & 73)) {
          return 2;
        }
        return 0;
      },mayLookup:(dir) => {
        var errCode = FS.nodePermissions(dir, 'x');
        if (errCode) return errCode;
        if (!dir.node_ops.lookup) return 2;
        return 0;
      },mayCreate:(dir, name) => {
        try {
          var node = FS.lookupNode(dir, name);
          return 20;
        } catch (e) {
        }
        return FS.nodePermissions(dir, 'wx');
      },mayDelete:(dir, name, isdir) => {
        var node;
        try {
          node = FS.lookupNode(dir, name);
        } catch (e) {
          return e.errno;
        }
        var errCode = FS.nodePermissions(dir, 'wx');
        if (errCode) {
          return errCode;
        }
        if (isdir) {
          if (!FS.isDir(node.mode)) {
            return 54;
          }
          if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
            return 10;
          }
        } else {
          if (FS.isDir(node.mode)) {
            return 31;
          }
        }
        return 0;
      },mayOpen:(node, flags) => {
        if (!node) {
          return 44;
        }
        if (FS.isLink(node.mode)) {
          return 32;
        } else if (FS.isDir(node.mode)) {
          if (FS.flagsToPermissionString(flags) !== 'r' || // opening for write
              (flags & 512)) { // TODO: check for O_SEARCH? (== search for dir only)
            return 31;
          }
        }
        return FS.nodePermissions(node, FS.flagsToPermissionString(flags));
      },MAX_OPEN_FDS:4096,nextfd:(fd_start = 0, fd_end = FS.MAX_OPEN_FDS) => {
        for (var fd = fd_start; fd <= fd_end; fd++) {
          if (!FS.streams[fd]) {
            return fd;
          }
        }
        throw new FS.ErrnoError(33);
      },getStream:(fd) => FS.streams[fd],createStream:(stream, fd_start, fd_end) => {
        if (!FS.FSStream) {
          FS.FSStream = /** @constructor */ function() {
            this.shared = { };
          };
          FS.FSStream.prototype = {};
          Object.defineProperties(FS.FSStream.prototype, {
            object: {
              /** @this {FS.FSStream} */
              get: function() { return this.node; },
              /** @this {FS.FSStream} */
              set: function(val) { this.node = val; }
            },
            isRead: {
              /** @this {FS.FSStream} */
              get: function() { return (this.flags & 2097155) !== 1; }
            },
            isWrite: {
              /** @this {FS.FSStream} */
              get: function() { return (this.flags & 2097155) !== 0; }
            },
            isAppend: {
              /** @this {FS.FSStream} */
              get: function() { return (this.flags & 1024); }
            },
            flags: {
              /** @this {FS.FSStream} */
              get: function() { return this.shared.flags; },
              /** @this {FS.FSStream} */
              set: function(val) { this.shared.flags = val; },
            },
            position : {
              /** @this {FS.FSStream} */
              get: function() { return this.shared.position; },
              /** @this {FS.FSStream} */
              set: function(val) { this.shared.position = val; },
            },
          });
        }
        // clone it, so we can return an instance of FSStream
        stream = Object.assign(new FS.FSStream(), stream);
        var fd = FS.nextfd(fd_start, fd_end);
        stream.fd = fd;
        FS.streams[fd] = stream;
        return stream;
      },closeStream:(fd) => {
        FS.streams[fd] = null;
      },chrdev_stream_ops:{open:(stream) => {
          var device = FS.getDevice(stream.node.rdev);
          // override node's stream ops with the device's
          stream.stream_ops = device.stream_ops;
          // forward the open call
          if (stream.stream_ops.open) {
            stream.stream_ops.open(stream);
          }
        },llseek:() => {
          throw new FS.ErrnoError(70);
        }},major:(dev) => ((dev) >> 8),minor:(dev) => ((dev) & 0xff),makedev:(ma, mi) => ((ma) << 8 | (mi)),registerDevice:(dev, ops) => {
        FS.devices[dev] = { stream_ops: ops };
      },getDevice:(dev) => FS.devices[dev],getMounts:(mount) => {
        var mounts = [];
        var check = [mount];
  
        while (check.length) {
          var m = check.pop();
  
          mounts.push(m);
  
          check.push.apply(check, m.mounts);
        }
  
        return mounts;
      },syncfs:(populate, callback) => {
        if (typeof populate == 'function') {
          callback = populate;
          populate = false;
        }
  
        FS.syncFSRequests++;
  
        if (FS.syncFSRequests > 1) {
          err('warning: ' + FS.syncFSRequests + ' FS.syncfs operations in flight at once, probably just doing extra work');
        }
  
        var mounts = FS.getMounts(FS.root.mount);
        var completed = 0;
  
        function doCallback(errCode) {
          assert(FS.syncFSRequests > 0);
          FS.syncFSRequests--;
          return callback(errCode);
        }
  
        function done(errCode) {
          if (errCode) {
            if (!done.errored) {
              done.errored = true;
              return doCallback(errCode);
            }
            return;
          }
          if (++completed >= mounts.length) {
            doCallback(null);
          }
        };
  
        // sync all mounts
        mounts.forEach((mount) => {
          if (!mount.type.syncfs) {
            return done(null);
          }
          mount.type.syncfs(mount, populate, done);
        });
      },mount:(type, opts, mountpoint) => {
        if (typeof type == 'string') {
          // The filesystem was not included, and instead we have an error
          // message stored in the variable.
          throw type;
        }
        var root = mountpoint === '/';
        var pseudo = !mountpoint;
        var node;
  
        if (root && FS.root) {
          throw new FS.ErrnoError(10);
        } else if (!root && !pseudo) {
          var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
  
          mountpoint = lookup.path;  // use the absolute path
          node = lookup.node;
  
          if (FS.isMountpoint(node)) {
            throw new FS.ErrnoError(10);
          }
  
          if (!FS.isDir(node.mode)) {
            throw new FS.ErrnoError(54);
          }
        }
  
        var mount = {
          type: type,
          opts: opts,
          mountpoint: mountpoint,
          mounts: []
        };
  
        // create a root node for the fs
        var mountRoot = type.mount(mount);
        mountRoot.mount = mount;
        mount.root = mountRoot;
  
        if (root) {
          FS.root = mountRoot;
        } else if (node) {
          // set as a mountpoint
          node.mounted = mount;
  
          // add the new mount to the current mount's children
          if (node.mount) {
            node.mount.mounts.push(mount);
          }
        }
  
        return mountRoot;
      },unmount:(mountpoint) => {
        var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
  
        if (!FS.isMountpoint(lookup.node)) {
          throw new FS.ErrnoError(28);
        }
  
        // destroy the nodes for this mount, and all its child mounts
        var node = lookup.node;
        var mount = node.mounted;
        var mounts = FS.getMounts(mount);
  
        Object.keys(FS.nameTable).forEach((hash) => {
          var current = FS.nameTable[hash];
  
          while (current) {
            var next = current.name_next;
  
            if (mounts.includes(current.mount)) {
              FS.destroyNode(current);
            }
  
            current = next;
          }
        });
  
        // no longer a mountpoint
        node.mounted = null;
  
        // remove this mount from the child mounts
        var idx = node.mount.mounts.indexOf(mount);
        assert(idx !== -1);
        node.mount.mounts.splice(idx, 1);
      },lookup:(parent, name) => {
        return parent.node_ops.lookup(parent, name);
      },mknod:(path, mode, dev) => {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        if (!name || name === '.' || name === '..') {
          throw new FS.ErrnoError(28);
        }
        var errCode = FS.mayCreate(parent, name);
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
        if (!parent.node_ops.mknod) {
          throw new FS.ErrnoError(63);
        }
        return parent.node_ops.mknod(parent, name, mode, dev);
      },create:(path, mode) => {
        mode = mode !== undefined ? mode : 438 /* 0666 */;
        mode &= 4095;
        mode |= 32768;
        return FS.mknod(path, mode, 0);
      },mkdir:(path, mode) => {
        mode = mode !== undefined ? mode : 511 /* 0777 */;
        mode &= 511 | 512;
        mode |= 16384;
        return FS.mknod(path, mode, 0);
      },mkdirTree:(path, mode) => {
        var dirs = path.split('/');
        var d = '';
        for (var i = 0; i < dirs.length; ++i) {
          if (!dirs[i]) continue;
          d += '/' + dirs[i];
          try {
            FS.mkdir(d, mode);
          } catch(e) {
            if (e.errno != 20) throw e;
          }
        }
      },mkdev:(path, mode, dev) => {
        if (typeof dev == 'undefined') {
          dev = mode;
          mode = 438 /* 0666 */;
        }
        mode |= 8192;
        return FS.mknod(path, mode, dev);
      },symlink:(oldpath, newpath) => {
        if (!PATH_FS.resolve(oldpath)) {
          throw new FS.ErrnoError(44);
        }
        var lookup = FS.lookupPath(newpath, { parent: true });
        var parent = lookup.node;
        if (!parent) {
          throw new FS.ErrnoError(44);
        }
        var newname = PATH.basename(newpath);
        var errCode = FS.mayCreate(parent, newname);
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
        if (!parent.node_ops.symlink) {
          throw new FS.ErrnoError(63);
        }
        return parent.node_ops.symlink(parent, newname, oldpath);
      },rename:(old_path, new_path) => {
        var old_dirname = PATH.dirname(old_path);
        var new_dirname = PATH.dirname(new_path);
        var old_name = PATH.basename(old_path);
        var new_name = PATH.basename(new_path);
        // parents must exist
        var lookup, old_dir, new_dir;
  
        // let the errors from non existant directories percolate up
        lookup = FS.lookupPath(old_path, { parent: true });
        old_dir = lookup.node;
        lookup = FS.lookupPath(new_path, { parent: true });
        new_dir = lookup.node;
  
        if (!old_dir || !new_dir) throw new FS.ErrnoError(44);
        // need to be part of the same mount
        if (old_dir.mount !== new_dir.mount) {
          throw new FS.ErrnoError(75);
        }
        // source must exist
        var old_node = FS.lookupNode(old_dir, old_name);
        // old path should not be an ancestor of the new path
        var relative = PATH_FS.relative(old_path, new_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(28);
        }
        // new path should not be an ancestor of the old path
        relative = PATH_FS.relative(new_path, old_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(55);
        }
        // see if the new path already exists
        var new_node;
        try {
          new_node = FS.lookupNode(new_dir, new_name);
        } catch (e) {
          // not fatal
        }
        // early out if nothing needs to change
        if (old_node === new_node) {
          return;
        }
        // we'll need to delete the old entry
        var isdir = FS.isDir(old_node.mode);
        var errCode = FS.mayDelete(old_dir, old_name, isdir);
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
        // need delete permissions if we'll be overwriting.
        // need create permissions if new doesn't already exist.
        errCode = new_node ?
          FS.mayDelete(new_dir, new_name, isdir) :
          FS.mayCreate(new_dir, new_name);
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
        if (!old_dir.node_ops.rename) {
          throw new FS.ErrnoError(63);
        }
        if (FS.isMountpoint(old_node) || (new_node && FS.isMountpoint(new_node))) {
          throw new FS.ErrnoError(10);
        }
        // if we are going to change the parent, check write permissions
        if (new_dir !== old_dir) {
          errCode = FS.nodePermissions(old_dir, 'w');
          if (errCode) {
            throw new FS.ErrnoError(errCode);
          }
        }
        // remove the node from the lookup hash
        FS.hashRemoveNode(old_node);
        // do the underlying fs rename
        try {
          old_dir.node_ops.rename(old_node, new_dir, new_name);
        } catch (e) {
          throw e;
        } finally {
          // add the node back to the hash (in case node_ops.rename
          // changed its name)
          FS.hashAddNode(old_node);
        }
      },rmdir:(path) => {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var errCode = FS.mayDelete(parent, name, true);
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
        if (!parent.node_ops.rmdir) {
          throw new FS.ErrnoError(63);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(10);
        }
        parent.node_ops.rmdir(parent, name);
        FS.destroyNode(node);
      },readdir:(path) => {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        if (!node.node_ops.readdir) {
          throw new FS.ErrnoError(54);
        }
        return node.node_ops.readdir(node);
      },unlink:(path) => {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        if (!parent) {
          throw new FS.ErrnoError(44);
        }
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var errCode = FS.mayDelete(parent, name, false);
        if (errCode) {
          // According to POSIX, we should map EISDIR to EPERM, but
          // we instead do what Linux does (and we must, as we use
          // the musl linux libc).
          throw new FS.ErrnoError(errCode);
        }
        if (!parent.node_ops.unlink) {
          throw new FS.ErrnoError(63);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(10);
        }
        parent.node_ops.unlink(parent, name);
        FS.destroyNode(node);
      },readlink:(path) => {
        var lookup = FS.lookupPath(path);
        var link = lookup.node;
        if (!link) {
          throw new FS.ErrnoError(44);
        }
        if (!link.node_ops.readlink) {
          throw new FS.ErrnoError(28);
        }
        return PATH_FS.resolve(FS.getPath(link.parent), link.node_ops.readlink(link));
      },stat:(path, dontFollow) => {
        var lookup = FS.lookupPath(path, { follow: !dontFollow });
        var node = lookup.node;
        if (!node) {
          throw new FS.ErrnoError(44);
        }
        if (!node.node_ops.getattr) {
          throw new FS.ErrnoError(63);
        }
        return node.node_ops.getattr(node);
      },lstat:(path) => {
        return FS.stat(path, true);
      },chmod:(path, mode, dontFollow) => {
        var node;
        if (typeof path == 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(63);
        }
        node.node_ops.setattr(node, {
          mode: (mode & 4095) | (node.mode & ~4095),
          timestamp: Date.now()
        });
      },lchmod:(path, mode) => {
        FS.chmod(path, mode, true);
      },fchmod:(fd, mode) => {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(8);
        }
        FS.chmod(stream.node, mode);
      },chown:(path, uid, gid, dontFollow) => {
        var node;
        if (typeof path == 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(63);
        }
        node.node_ops.setattr(node, {
          timestamp: Date.now()
          // we ignore the uid / gid for now
        });
      },lchown:(path, uid, gid) => {
        FS.chown(path, uid, gid, true);
      },fchown:(fd, uid, gid) => {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(8);
        }
        FS.chown(stream.node, uid, gid);
      },truncate:(path, len) => {
        if (len < 0) {
          throw new FS.ErrnoError(28);
        }
        var node;
        if (typeof path == 'string') {
          var lookup = FS.lookupPath(path, { follow: true });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(63);
        }
        if (FS.isDir(node.mode)) {
          throw new FS.ErrnoError(31);
        }
        if (!FS.isFile(node.mode)) {
          throw new FS.ErrnoError(28);
        }
        var errCode = FS.nodePermissions(node, 'w');
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
        node.node_ops.setattr(node, {
          size: len,
          timestamp: Date.now()
        });
      },ftruncate:(fd, len) => {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(8);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(28);
        }
        FS.truncate(stream.node, len);
      },utime:(path, atime, mtime) => {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        node.node_ops.setattr(node, {
          timestamp: Math.max(atime, mtime)
        });
      },open:(path, flags, mode) => {
        if (path === "") {
          throw new FS.ErrnoError(44);
        }
        flags = typeof flags == 'string' ? FS.modeStringToFlags(flags) : flags;
        mode = typeof mode == 'undefined' ? 438 /* 0666 */ : mode;
        if ((flags & 64)) {
          mode = (mode & 4095) | 32768;
        } else {
          mode = 0;
        }
        var node;
        if (typeof path == 'object') {
          node = path;
        } else {
          path = PATH.normalize(path);
          try {
            var lookup = FS.lookupPath(path, {
              follow: !(flags & 131072)
            });
            node = lookup.node;
          } catch (e) {
            // ignore
          }
        }
        // perhaps we need to create the node
        var created = false;
        if ((flags & 64)) {
          if (node) {
            // if O_CREAT and O_EXCL are set, error out if the node already exists
            if ((flags & 128)) {
              throw new FS.ErrnoError(20);
            }
          } else {
            // node doesn't exist, try to create it
            node = FS.mknod(path, mode, 0);
            created = true;
          }
        }
        if (!node) {
          throw new FS.ErrnoError(44);
        }
        // can't truncate a device
        if (FS.isChrdev(node.mode)) {
          flags &= ~512;
        }
        // if asked only for a directory, then this must be one
        if ((flags & 65536) && !FS.isDir(node.mode)) {
          throw new FS.ErrnoError(54);
        }
        // check permissions, if this is not a file we just created now (it is ok to
        // create and write to a file with read-only permissions; it is read-only
        // for later use)
        if (!created) {
          var errCode = FS.mayOpen(node, flags);
          if (errCode) {
            throw new FS.ErrnoError(errCode);
          }
        }
        // do truncation if necessary
        if ((flags & 512) && !created) {
          FS.truncate(node, 0);
        }
        // we've already handled these, don't pass down to the underlying vfs
        flags &= ~(128 | 512 | 131072);
  
        // register the stream with the filesystem
        var stream = FS.createStream({
          node: node,
          path: FS.getPath(node),  // we want the absolute path to the node
          flags: flags,
          seekable: true,
          position: 0,
          stream_ops: node.stream_ops,
          // used by the file family libc calls (fopen, fwrite, ferror, etc.)
          ungotten: [],
          error: false
        });
        // call the new stream's open function
        if (stream.stream_ops.open) {
          stream.stream_ops.open(stream);
        }
        if (Module['logReadFiles'] && !(flags & 1)) {
          if (!FS.readFiles) FS.readFiles = {};
          if (!(path in FS.readFiles)) {
            FS.readFiles[path] = 1;
          }
        }
        return stream;
      },close:(stream) => {
        if (FS.isClosed(stream)) {
          throw new FS.ErrnoError(8);
        }
        if (stream.getdents) stream.getdents = null; // free readdir state
        try {
          if (stream.stream_ops.close) {
            stream.stream_ops.close(stream);
          }
        } catch (e) {
          throw e;
        } finally {
          FS.closeStream(stream.fd);
        }
        stream.fd = null;
      },isClosed:(stream) => {
        return stream.fd === null;
      },llseek:(stream, offset, whence) => {
        if (FS.isClosed(stream)) {
          throw new FS.ErrnoError(8);
        }
        if (!stream.seekable || !stream.stream_ops.llseek) {
          throw new FS.ErrnoError(70);
        }
        if (whence != 0 && whence != 1 && whence != 2) {
          throw new FS.ErrnoError(28);
        }
        stream.position = stream.stream_ops.llseek(stream, offset, whence);
        stream.ungotten = [];
        return stream.position;
      },read:(stream, buffer, offset, length, position) => {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(28);
        }
        if (FS.isClosed(stream)) {
          throw new FS.ErrnoError(8);
        }
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(8);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(31);
        }
        if (!stream.stream_ops.read) {
          throw new FS.ErrnoError(28);
        }
        var seeking = typeof position != 'undefined';
        if (!seeking) {
          position = stream.position;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(70);
        }
        var bytesRead = stream.stream_ops.read(stream, buffer, offset, length, position);
        if (!seeking) stream.position += bytesRead;
        return bytesRead;
      },write:(stream, buffer, offset, length, position, canOwn) => {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(28);
        }
        if (FS.isClosed(stream)) {
          throw new FS.ErrnoError(8);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(8);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(31);
        }
        if (!stream.stream_ops.write) {
          throw new FS.ErrnoError(28);
        }
        if (stream.seekable && stream.flags & 1024) {
          // seek to the end before writing in append mode
          FS.llseek(stream, 0, 2);
        }
        var seeking = typeof position != 'undefined';
        if (!seeking) {
          position = stream.position;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(70);
        }
        var bytesWritten = stream.stream_ops.write(stream, buffer, offset, length, position, canOwn);
        if (!seeking) stream.position += bytesWritten;
        return bytesWritten;
      },allocate:(stream, offset, length) => {
        if (FS.isClosed(stream)) {
          throw new FS.ErrnoError(8);
        }
        if (offset < 0 || length <= 0) {
          throw new FS.ErrnoError(28);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(8);
        }
        if (!FS.isFile(stream.node.mode) && !FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(43);
        }
        if (!stream.stream_ops.allocate) {
          throw new FS.ErrnoError(138);
        }
        stream.stream_ops.allocate(stream, offset, length);
      },mmap:(stream, length, position, prot, flags) => {
        // User requests writing to file (prot & PROT_WRITE != 0).
        // Checking if we have permissions to write to the file unless
        // MAP_PRIVATE flag is set. According to POSIX spec it is possible
        // to write to file opened in read-only mode with MAP_PRIVATE flag,
        // as all modifications will be visible only in the memory of
        // the current process.
        if ((prot & 2) !== 0
            && (flags & 2) === 0
            && (stream.flags & 2097155) !== 2) {
          throw new FS.ErrnoError(2);
        }
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(2);
        }
        if (!stream.stream_ops.mmap) {
          throw new FS.ErrnoError(43);
        }
        return stream.stream_ops.mmap(stream, length, position, prot, flags);
      },msync:(stream, buffer, offset, length, mmapFlags) => {
        if (!stream.stream_ops.msync) {
          return 0;
        }
        return stream.stream_ops.msync(stream, buffer, offset, length, mmapFlags);
      },munmap:(stream) => 0,ioctl:(stream, cmd, arg) => {
        if (!stream.stream_ops.ioctl) {
          throw new FS.ErrnoError(59);
        }
        return stream.stream_ops.ioctl(stream, cmd, arg);
      },readFile:(path, opts = {}) => {
        opts.flags = opts.flags || 0;
        opts.encoding = opts.encoding || 'binary';
        if (opts.encoding !== 'utf8' && opts.encoding !== 'binary') {
          throw new Error('Invalid encoding type "' + opts.encoding + '"');
        }
        var ret;
        var stream = FS.open(path, opts.flags);
        var stat = FS.stat(path);
        var length = stat.size;
        var buf = new Uint8Array(length);
        FS.read(stream, buf, 0, length, 0);
        if (opts.encoding === 'utf8') {
          ret = UTF8ArrayToString(buf, 0);
        } else if (opts.encoding === 'binary') {
          ret = buf;
        }
        FS.close(stream);
        return ret;
      },writeFile:(path, data, opts = {}) => {
        opts.flags = opts.flags || 577;
        var stream = FS.open(path, opts.flags, opts.mode);
        if (typeof data == 'string') {
          var buf = new Uint8Array(lengthBytesUTF8(data)+1);
          var actualNumBytes = stringToUTF8Array(data, buf, 0, buf.length);
          FS.write(stream, buf, 0, actualNumBytes, undefined, opts.canOwn);
        } else if (ArrayBuffer.isView(data)) {
          FS.write(stream, data, 0, data.byteLength, undefined, opts.canOwn);
        } else {
          throw new Error('Unsupported data type');
        }
        FS.close(stream);
      },cwd:() => FS.currentPath,chdir:(path) => {
        var lookup = FS.lookupPath(path, { follow: true });
        if (lookup.node === null) {
          throw new FS.ErrnoError(44);
        }
        if (!FS.isDir(lookup.node.mode)) {
          throw new FS.ErrnoError(54);
        }
        var errCode = FS.nodePermissions(lookup.node, 'x');
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
        FS.currentPath = lookup.path;
      },createDefaultDirectories:() => {
        FS.mkdir('/tmp');
        FS.mkdir('/home');
        FS.mkdir('/home/web_user');
      },createDefaultDevices:() => {
        // create /dev
        FS.mkdir('/dev');
        // setup /dev/null
        FS.registerDevice(FS.makedev(1, 3), {
          read: () => 0,
          write: (stream, buffer, offset, length, pos) => length,
        });
        FS.mkdev('/dev/null', FS.makedev(1, 3));
        // setup /dev/tty and /dev/tty1
        // stderr needs to print output using err() rather than out()
        // so we register a second tty just for it.
        TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
        TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
        FS.mkdev('/dev/tty', FS.makedev(5, 0));
        FS.mkdev('/dev/tty1', FS.makedev(6, 0));
        // setup /dev/[u]random
        var random_device = getRandomDevice();
        FS.createDevice('/dev', 'random', random_device);
        FS.createDevice('/dev', 'urandom', random_device);
        // we're not going to emulate the actual shm device,
        // just create the tmp dirs that reside in it commonly
        FS.mkdir('/dev/shm');
        FS.mkdir('/dev/shm/tmp');
      },createSpecialDirectories:() => {
        // create /proc/self/fd which allows /proc/self/fd/6 => readlink gives the
        // name of the stream for fd 6 (see test_unistd_ttyname)
        FS.mkdir('/proc');
        var proc_self = FS.mkdir('/proc/self');
        FS.mkdir('/proc/self/fd');
        FS.mount({
          mount: () => {
            var node = FS.createNode(proc_self, 'fd', 16384 | 511 /* 0777 */, 73);
            node.node_ops = {
              lookup: (parent, name) => {
                var fd = +name;
                var stream = FS.getStream(fd);
                if (!stream) throw new FS.ErrnoError(8);
                var ret = {
                  parent: null,
                  mount: { mountpoint: 'fake' },
                  node_ops: { readlink: () => stream.path },
                };
                ret.parent = ret; // make it look like a simple root node
                return ret;
              }
            };
            return node;
          }
        }, {}, '/proc/self/fd');
      },createStandardStreams:() => {
        // TODO deprecate the old functionality of a single
        // input / output callback and that utilizes FS.createDevice
        // and instead require a unique set of stream ops
  
        // by default, we symlink the standard streams to the
        // default tty devices. however, if the standard streams
        // have been overwritten we create a unique device for
        // them instead.
        if (Module['stdin']) {
          FS.createDevice('/dev', 'stdin', Module['stdin']);
        } else {
          FS.symlink('/dev/tty', '/dev/stdin');
        }
        if (Module['stdout']) {
          FS.createDevice('/dev', 'stdout', null, Module['stdout']);
        } else {
          FS.symlink('/dev/tty', '/dev/stdout');
        }
        if (Module['stderr']) {
          FS.createDevice('/dev', 'stderr', null, Module['stderr']);
        } else {
          FS.symlink('/dev/tty1', '/dev/stderr');
        }
  
        // open default streams for the stdin, stdout and stderr devices
        var stdin = FS.open('/dev/stdin', 0);
        var stdout = FS.open('/dev/stdout', 1);
        var stderr = FS.open('/dev/stderr', 1);
        assert(stdin.fd === 0, 'invalid handle for stdin (' + stdin.fd + ')');
        assert(stdout.fd === 1, 'invalid handle for stdout (' + stdout.fd + ')');
        assert(stderr.fd === 2, 'invalid handle for stderr (' + stderr.fd + ')');
      },ensureErrnoError:() => {
        if (FS.ErrnoError) return;
        FS.ErrnoError = /** @this{Object} */ function ErrnoError(errno, node) {
          this.node = node;
          this.setErrno = /** @this{Object} */ function(errno) {
            this.errno = errno;
            for (var key in ERRNO_CODES) {
              if (ERRNO_CODES[key] === errno) {
                this.code = key;
                break;
              }
            }
          };
          this.setErrno(errno);
          this.message = ERRNO_MESSAGES[errno];
  
          // Try to get a maximally helpful stack trace. On Node.js, getting Error.stack
          // now ensures it shows what we want.
          if (this.stack) {
            // Define the stack property for Node.js 4, which otherwise errors on the next line.
            Object.defineProperty(this, "stack", { value: (new Error).stack, writable: true });
            this.stack = demangleAll(this.stack);
          }
        };
        FS.ErrnoError.prototype = new Error();
        FS.ErrnoError.prototype.constructor = FS.ErrnoError;
        // Some errors may happen quite a bit, to avoid overhead we reuse them (and suffer a lack of stack info)
        [44].forEach((code) => {
          FS.genericErrors[code] = new FS.ErrnoError(code);
          FS.genericErrors[code].stack = '<generic error, no stack>';
        });
      },staticInit:() => {
        FS.ensureErrnoError();
  
        FS.nameTable = new Array(4096);
  
        FS.mount(MEMFS, {}, '/');
  
        FS.createDefaultDirectories();
        FS.createDefaultDevices();
        FS.createSpecialDirectories();
  
        FS.filesystems = {
          'MEMFS': MEMFS,
        };
      },init:(input, output, error) => {
        assert(!FS.init.initialized, 'FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)');
        FS.init.initialized = true;
  
        FS.ensureErrnoError();
  
        // Allow Module.stdin etc. to provide defaults, if none explicitly passed to us here
        Module['stdin'] = input || Module['stdin'];
        Module['stdout'] = output || Module['stdout'];
        Module['stderr'] = error || Module['stderr'];
  
        FS.createStandardStreams();
      },quit:() => {
        FS.init.initialized = false;
        // force-flush all streams, so we get musl std streams printed out
        _fflush(0);
        // close all of our streams
        for (var i = 0; i < FS.streams.length; i++) {
          var stream = FS.streams[i];
          if (!stream) {
            continue;
          }
          FS.close(stream);
        }
      },getMode:(canRead, canWrite) => {
        var mode = 0;
        if (canRead) mode |= 292 | 73;
        if (canWrite) mode |= 146;
        return mode;
      },findObject:(path, dontResolveLastLink) => {
        var ret = FS.analyzePath(path, dontResolveLastLink);
        if (!ret.exists) {
          return null;
        }
        return ret.object;
      },analyzePath:(path, dontResolveLastLink) => {
        // operate from within the context of the symlink's target
        try {
          var lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          path = lookup.path;
        } catch (e) {
        }
        var ret = {
          isRoot: false, exists: false, error: 0, name: null, path: null, object: null,
          parentExists: false, parentPath: null, parentObject: null
        };
        try {
          var lookup = FS.lookupPath(path, { parent: true });
          ret.parentExists = true;
          ret.parentPath = lookup.path;
          ret.parentObject = lookup.node;
          ret.name = PATH.basename(path);
          lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          ret.exists = true;
          ret.path = lookup.path;
          ret.object = lookup.node;
          ret.name = lookup.node.name;
          ret.isRoot = lookup.path === '/';
        } catch (e) {
          ret.error = e.errno;
        };
        return ret;
      },createPath:(parent, path, canRead, canWrite) => {
        parent = typeof parent == 'string' ? parent : FS.getPath(parent);
        var parts = path.split('/').reverse();
        while (parts.length) {
          var part = parts.pop();
          if (!part) continue;
          var current = PATH.join2(parent, part);
          try {
            FS.mkdir(current);
          } catch (e) {
            // ignore EEXIST
          }
          parent = current;
        }
        return current;
      },createFile:(parent, name, properties, canRead, canWrite) => {
        var path = PATH.join2(typeof parent == 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.create(path, mode);
      },createDataFile:(parent, name, data, canRead, canWrite, canOwn) => {
        var path = name;
        if (parent) {
          parent = typeof parent == 'string' ? parent : FS.getPath(parent);
          path = name ? PATH.join2(parent, name) : parent;
        }
        var mode = FS.getMode(canRead, canWrite);
        var node = FS.create(path, mode);
        if (data) {
          if (typeof data == 'string') {
            var arr = new Array(data.length);
            for (var i = 0, len = data.length; i < len; ++i) arr[i] = data.charCodeAt(i);
            data = arr;
          }
          // make sure we can write to the file
          FS.chmod(node, mode | 146);
          var stream = FS.open(node, 577);
          FS.write(stream, data, 0, data.length, 0, canOwn);
          FS.close(stream);
          FS.chmod(node, mode);
        }
        return node;
      },createDevice:(parent, name, input, output) => {
        var path = PATH.join2(typeof parent == 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(!!input, !!output);
        if (!FS.createDevice.major) FS.createDevice.major = 64;
        var dev = FS.makedev(FS.createDevice.major++, 0);
        // Create a fake device that a set of stream ops to emulate
        // the old behavior.
        FS.registerDevice(dev, {
          open: (stream) => {
            stream.seekable = false;
          },
          close: (stream) => {
            // flush any pending line data
            if (output && output.buffer && output.buffer.length) {
              output(10);
            }
          },
          read: (stream, buffer, offset, length, pos /* ignored */) => {
            var bytesRead = 0;
            for (var i = 0; i < length; i++) {
              var result;
              try {
                result = input();
              } catch (e) {
                throw new FS.ErrnoError(29);
              }
              if (result === undefined && bytesRead === 0) {
                throw new FS.ErrnoError(6);
              }
              if (result === null || result === undefined) break;
              bytesRead++;
              buffer[offset+i] = result;
            }
            if (bytesRead) {
              stream.node.timestamp = Date.now();
            }
            return bytesRead;
          },
          write: (stream, buffer, offset, length, pos) => {
            for (var i = 0; i < length; i++) {
              try {
                output(buffer[offset+i]);
              } catch (e) {
                throw new FS.ErrnoError(29);
              }
            }
            if (length) {
              stream.node.timestamp = Date.now();
            }
            return i;
          }
        });
        return FS.mkdev(path, mode, dev);
      },forceLoadFile:(obj) => {
        if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
        if (typeof XMLHttpRequest != 'undefined') {
          throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
        } else if (read_) {
          // Command-line.
          try {
            // WARNING: Can't read binary files in V8's d8 or tracemonkey's js, as
            //          read() will try to parse UTF8.
            obj.contents = intArrayFromString(read_(obj.url), true);
            obj.usedBytes = obj.contents.length;
          } catch (e) {
            throw new FS.ErrnoError(29);
          }
        } else {
          throw new Error('Cannot load without read() or XMLHttpRequest.');
        }
      },createLazyFile:(parent, name, url, canRead, canWrite) => {
        // Lazy chunked Uint8Array (implements get and length from Uint8Array). Actual getting is abstracted away for eventual reuse.
        /** @constructor */
        function LazyUint8Array() {
          this.lengthKnown = false;
          this.chunks = []; // Loaded chunks. Index is the chunk number
        }
        LazyUint8Array.prototype.get = /** @this{Object} */ function LazyUint8Array_get(idx) {
          if (idx > this.length-1 || idx < 0) {
            return undefined;
          }
          var chunkOffset = idx % this.chunkSize;
          var chunkNum = (idx / this.chunkSize)|0;
          return this.getter(chunkNum)[chunkOffset];
        };
        LazyUint8Array.prototype.setDataGetter = function LazyUint8Array_setDataGetter(getter) {
          this.getter = getter;
        };
        LazyUint8Array.prototype.cacheLength = function LazyUint8Array_cacheLength() {
          // Find length
          var xhr = new XMLHttpRequest();
          xhr.open('HEAD', url, false);
          xhr.send(null);
          if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
          var datalength = Number(xhr.getResponseHeader("Content-length"));
          var header;
          var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
          var usesGzip = (header = xhr.getResponseHeader("Content-Encoding")) && header === "gzip";
  
          var chunkSize = 1024*1024; // Chunk size in bytes
  
          if (!hasByteServing) chunkSize = datalength;
  
          // Function to get a range from the remote URL.
          var doXHR = (from, to) => {
            if (from > to) throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
            if (to > datalength-1) throw new Error("only " + datalength + " bytes available! programmer error!");
  
            // TODO: Use mozResponseArrayBuffer, responseStream, etc. if available.
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url, false);
            if (datalength !== chunkSize) xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
  
            // Some hints to the browser that we want binary data.
            xhr.responseType = 'arraybuffer';
            if (xhr.overrideMimeType) {
              xhr.overrideMimeType('text/plain; charset=x-user-defined');
            }
  
            xhr.send(null);
            if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
            if (xhr.response !== undefined) {
              return new Uint8Array(/** @type{Array<number>} */(xhr.response || []));
            }
            return intArrayFromString(xhr.responseText || '', true);
          };
          var lazyArray = this;
          lazyArray.setDataGetter((chunkNum) => {
            var start = chunkNum * chunkSize;
            var end = (chunkNum+1) * chunkSize - 1; // including this byte
            end = Math.min(end, datalength-1); // if datalength-1 is selected, this is the last block
            if (typeof lazyArray.chunks[chunkNum] == 'undefined') {
              lazyArray.chunks[chunkNum] = doXHR(start, end);
            }
            if (typeof lazyArray.chunks[chunkNum] == 'undefined') throw new Error('doXHR failed!');
            return lazyArray.chunks[chunkNum];
          });
  
          if (usesGzip || !datalength) {
            // if the server uses gzip or doesn't supply the length, we have to download the whole file to get the (uncompressed) length
            chunkSize = datalength = 1; // this will force getter(0)/doXHR do download the whole file
            datalength = this.getter(0).length;
            chunkSize = datalength;
            out("LazyFiles on gzip forces download of the whole file when length is accessed");
          }
  
          this._length = datalength;
          this._chunkSize = chunkSize;
          this.lengthKnown = true;
        };
        if (typeof XMLHttpRequest != 'undefined') {
          if (!ENVIRONMENT_IS_WORKER) throw 'Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc';
          var lazyArray = new LazyUint8Array();
          Object.defineProperties(lazyArray, {
            length: {
              get: /** @this{Object} */ function() {
                if (!this.lengthKnown) {
                  this.cacheLength();
                }
                return this._length;
              }
            },
            chunkSize: {
              get: /** @this{Object} */ function() {
                if (!this.lengthKnown) {
                  this.cacheLength();
                }
                return this._chunkSize;
              }
            }
          });
  
          var properties = { isDevice: false, contents: lazyArray };
        } else {
          var properties = { isDevice: false, url: url };
        }
  
        var node = FS.createFile(parent, name, properties, canRead, canWrite);
        // This is a total hack, but I want to get this lazy file code out of the
        // core of MEMFS. If we want to keep this lazy file concept I feel it should
        // be its own thin LAZYFS proxying calls to MEMFS.
        if (properties.contents) {
          node.contents = properties.contents;
        } else if (properties.url) {
          node.contents = null;
          node.url = properties.url;
        }
        // Add a function that defers querying the file size until it is asked the first time.
        Object.defineProperties(node, {
          usedBytes: {
            get: /** @this {FSNode} */ function() { return this.contents.length; }
          }
        });
        // override each stream op with one that tries to force load the lazy file first
        var stream_ops = {};
        var keys = Object.keys(node.stream_ops);
        keys.forEach((key) => {
          var fn = node.stream_ops[key];
          stream_ops[key] = function forceLoadLazyFile() {
            FS.forceLoadFile(node);
            return fn.apply(null, arguments);
          };
        });
        function writeChunks(stream, buffer, offset, length, position) {
          var contents = stream.node.contents;
          if (position >= contents.length)
            return 0;
          var size = Math.min(contents.length - position, length);
          assert(size >= 0);
          if (contents.slice) { // normal array
            for (var i = 0; i < size; i++) {
              buffer[offset + i] = contents[position + i];
            }
          } else {
            for (var i = 0; i < size; i++) { // LazyUint8Array from sync binary XHR
              buffer[offset + i] = contents.get(position + i);
            }
          }
          return size;
        }
        // use a custom read function
        stream_ops.read = (stream, buffer, offset, length, position) => {
          FS.forceLoadFile(node);
          return writeChunks(stream, buffer, offset, length, position)
        };
        // use a custom mmap function
        stream_ops.mmap = (stream, length, position, prot, flags) => {
          FS.forceLoadFile(node);
          var ptr = mmapAlloc(length);
          if (!ptr) {
            throw new FS.ErrnoError(48);
          }
          writeChunks(stream, HEAP8, ptr, length, position);
          return { ptr: ptr, allocated: true };
        };
        node.stream_ops = stream_ops;
        return node;
      },createPreloadedFile:(parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn, preFinish) => {
        // TODO we should allow people to just pass in a complete filename instead
        // of parent and name being that we just join them anyways
        var fullname = name ? PATH_FS.resolve(PATH.join2(parent, name)) : parent;
        var dep = getUniqueRunDependency('cp ' + fullname); // might have several active requests for the same fullname
        function processData(byteArray) {
          function finish(byteArray) {
            if (preFinish) preFinish();
            if (!dontCreateFile) {
              FS.createDataFile(parent, name, byteArray, canRead, canWrite, canOwn);
            }
            if (onload) onload();
            removeRunDependency(dep);
          }
          if (Browser.handledByPreloadPlugin(byteArray, fullname, finish, () => {
            if (onerror) onerror();
            removeRunDependency(dep);
          })) {
            return;
          }
          finish(byteArray);
        }
        addRunDependency(dep);
        if (typeof url == 'string') {
          asyncLoad(url, (byteArray) => processData(byteArray), onerror);
        } else {
          processData(url);
        }
      },indexedDB:() => {
        return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
      },DB_NAME:() => {
        return 'EM_FS_' + window.location.pathname;
      },DB_VERSION:20,DB_STORE_NAME:"FILE_DATA",saveFilesToDB:(paths, onload = (() => {}), onerror = (() => {})) => {
        var indexedDB = FS.indexedDB();
        try {
          var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        openRequest.onupgradeneeded = () => {
          out('creating db');
          var db = openRequest.result;
          db.createObjectStore(FS.DB_STORE_NAME);
        };
        openRequest.onsuccess = () => {
          var db = openRequest.result;
          var transaction = db.transaction([FS.DB_STORE_NAME], 'readwrite');
          var files = transaction.objectStore(FS.DB_STORE_NAME);
          var ok = 0, fail = 0, total = paths.length;
          function finish() {
            if (fail == 0) onload(); else onerror();
          }
          paths.forEach((path) => {
            var putRequest = files.put(FS.analyzePath(path).object.contents, path);
            putRequest.onsuccess = () => { ok++; if (ok + fail == total) finish() };
            putRequest.onerror = () => { fail++; if (ok + fail == total) finish() };
          });
          transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
      },loadFilesFromDB:(paths, onload = (() => {}), onerror = (() => {})) => {
        var indexedDB = FS.indexedDB();
        try {
          var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        openRequest.onupgradeneeded = onerror; // no database to load from
        openRequest.onsuccess = () => {
          var db = openRequest.result;
          try {
            var transaction = db.transaction([FS.DB_STORE_NAME], 'readonly');
          } catch(e) {
            onerror(e);
            return;
          }
          var files = transaction.objectStore(FS.DB_STORE_NAME);
          var ok = 0, fail = 0, total = paths.length;
          function finish() {
            if (fail == 0) onload(); else onerror();
          }
          paths.forEach((path) => {
            var getRequest = files.get(path);
            getRequest.onsuccess = () => {
              if (FS.analyzePath(path).exists) {
                FS.unlink(path);
              }
              FS.createDataFile(PATH.dirname(path), PATH.basename(path), getRequest.result, true, true, true);
              ok++;
              if (ok + fail == total) finish();
            };
            getRequest.onerror = () => { fail++; if (ok + fail == total) finish() };
          });
          transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
      },absolutePath:() => {
        abort('FS.absolutePath has been removed; use PATH_FS.resolve instead');
      },createFolder:() => {
        abort('FS.createFolder has been removed; use FS.mkdir instead');
      },createLink:() => {
        abort('FS.createLink has been removed; use FS.symlink instead');
      },joinPath:() => {
        abort('FS.joinPath has been removed; use PATH.join instead');
      },mmapAlloc:() => {
        abort('FS.mmapAlloc has been replaced by the top level function mmapAlloc');
      },standardizePath:() => {
        abort('FS.standardizePath has been removed; use PATH.normalize instead');
      }};
  var SYSCALLS = {DEFAULT_POLLMASK:5,calculateAt:function(dirfd, path, allowEmpty) {
        if (PATH.isAbs(path)) {
          return path;
        }
        // relative path
        var dir;
        if (dirfd === -100) {
          dir = FS.cwd();
        } else {
          var dirstream = SYSCALLS.getStreamFromFD(dirfd);
          dir = dirstream.path;
        }
        if (path.length == 0) {
          if (!allowEmpty) {
            throw new FS.ErrnoError(44);;
          }
          return dir;
        }
        return PATH.join2(dir, path);
      },doStat:function(func, path, buf) {
        try {
          var stat = func(path);
        } catch (e) {
          if (e && e.node && PATH.normalize(path) !== PATH.normalize(FS.getPath(e.node))) {
            // an error occurred while trying to look up the path; we should just report ENOTDIR
            return -54;
          }
          throw e;
        }
        HEAP32[((buf)>>2)] = stat.dev;
        HEAP32[(((buf)+(8))>>2)] = stat.ino;
        HEAP32[(((buf)+(12))>>2)] = stat.mode;
        HEAPU32[(((buf)+(16))>>2)] = stat.nlink;
        HEAP32[(((buf)+(20))>>2)] = stat.uid;
        HEAP32[(((buf)+(24))>>2)] = stat.gid;
        HEAP32[(((buf)+(28))>>2)] = stat.rdev;
        (tempI64 = [stat.size>>>0,(tempDouble=stat.size,(+(Math.abs(tempDouble))) >= 1.0 ? (tempDouble > 0.0 ? ((Math.min((+(Math.floor((tempDouble)/4294967296.0))), 4294967295.0))|0)>>>0 : (~~((+(Math.ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296.0)))))>>>0) : 0)],HEAP32[(((buf)+(40))>>2)] = tempI64[0],HEAP32[(((buf)+(44))>>2)] = tempI64[1]);
        HEAP32[(((buf)+(48))>>2)] = 4096;
        HEAP32[(((buf)+(52))>>2)] = stat.blocks;
        var atime = stat.atime.getTime();
        var mtime = stat.mtime.getTime();
        var ctime = stat.ctime.getTime();
        (tempI64 = [Math.floor(atime / 1000)>>>0,(tempDouble=Math.floor(atime / 1000),(+(Math.abs(tempDouble))) >= 1.0 ? (tempDouble > 0.0 ? ((Math.min((+(Math.floor((tempDouble)/4294967296.0))), 4294967295.0))|0)>>>0 : (~~((+(Math.ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296.0)))))>>>0) : 0)],HEAP32[(((buf)+(56))>>2)] = tempI64[0],HEAP32[(((buf)+(60))>>2)] = tempI64[1]);
        HEAPU32[(((buf)+(64))>>2)] = (atime % 1000) * 1000;
        (tempI64 = [Math.floor(mtime / 1000)>>>0,(tempDouble=Math.floor(mtime / 1000),(+(Math.abs(tempDouble))) >= 1.0 ? (tempDouble > 0.0 ? ((Math.min((+(Math.floor((tempDouble)/4294967296.0))), 4294967295.0))|0)>>>0 : (~~((+(Math.ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296.0)))))>>>0) : 0)],HEAP32[(((buf)+(72))>>2)] = tempI64[0],HEAP32[(((buf)+(76))>>2)] = tempI64[1]);
        HEAPU32[(((buf)+(80))>>2)] = (mtime % 1000) * 1000;
        (tempI64 = [Math.floor(ctime / 1000)>>>0,(tempDouble=Math.floor(ctime / 1000),(+(Math.abs(tempDouble))) >= 1.0 ? (tempDouble > 0.0 ? ((Math.min((+(Math.floor((tempDouble)/4294967296.0))), 4294967295.0))|0)>>>0 : (~~((+(Math.ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296.0)))))>>>0) : 0)],HEAP32[(((buf)+(88))>>2)] = tempI64[0],HEAP32[(((buf)+(92))>>2)] = tempI64[1]);
        HEAPU32[(((buf)+(96))>>2)] = (ctime % 1000) * 1000;
        (tempI64 = [stat.ino>>>0,(tempDouble=stat.ino,(+(Math.abs(tempDouble))) >= 1.0 ? (tempDouble > 0.0 ? ((Math.min((+(Math.floor((tempDouble)/4294967296.0))), 4294967295.0))|0)>>>0 : (~~((+(Math.ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296.0)))))>>>0) : 0)],HEAP32[(((buf)+(104))>>2)] = tempI64[0],HEAP32[(((buf)+(108))>>2)] = tempI64[1]);
        return 0;
      },doMsync:function(addr, stream, len, flags, offset) {
        if (!FS.isFile(stream.node.mode)) {
          throw new FS.ErrnoError(43);
        }
        if (flags & 2) {
          // MAP_PRIVATE calls need not to be synced back to underlying fs
          return 0;
        }
        var buffer = HEAPU8.slice(addr, addr + len);
        FS.msync(stream, buffer, offset, len, flags);
      },varargs:undefined,get:function() {
        assert(SYSCALLS.varargs != undefined);
        SYSCALLS.varargs += 4;
        var ret = HEAP32[(((SYSCALLS.varargs)-(4))>>2)];
        return ret;
      },getStr:function(ptr) {
        var ret = UTF8ToString(ptr);
        return ret;
      },getStreamFromFD:function(fd) {
        var stream = FS.getStream(fd);
        if (!stream) throw new FS.ErrnoError(8);
        return stream;
      }};
  function _environ_get(__environ, environ_buf) {
      var bufSize = 0;
      getEnvStrings().forEach(function(string, i) {
        var ptr = environ_buf + bufSize;
        HEAPU32[(((__environ)+(i*4))>>2)] = ptr;
        writeAsciiToMemory(string, ptr);
        bufSize += string.length + 1;
      });
      return 0;
    }

  
  function _environ_sizes_get(penviron_count, penviron_buf_size) {
      var strings = getEnvStrings();
      HEAPU32[((penviron_count)>>2)] = strings.length;
      var bufSize = 0;
      strings.forEach(function(string) {
        bufSize += string.length + 1;
      });
      HEAPU32[((penviron_buf_size)>>2)] = bufSize;
      return 0;
    }

  function _fd_close(fd) {
  try {
  
      var stream = SYSCALLS.getStreamFromFD(fd);
      FS.close(stream);
      return 0;
    } catch (e) {
    if (typeof FS == 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
    return e.errno;
  }
  }

  /** @param {number=} offset */
  function doReadv(stream, iov, iovcnt, offset) {
      var ret = 0;
      for (var i = 0; i < iovcnt; i++) {
        var ptr = HEAPU32[((iov)>>2)];
        var len = HEAPU32[(((iov)+(4))>>2)];
        iov += 8;
        var curr = FS.read(stream, HEAP8,ptr, len, offset);
        if (curr < 0) return -1;
        ret += curr;
        if (curr < len) break; // nothing more to read
        if (typeof offset !== 'undefined') {
          offset += curr;
        }
      }
      return ret;
    }
  
  function _fd_read(fd, iov, iovcnt, pnum) {
  try {
  
      var stream = SYSCALLS.getStreamFromFD(fd);
      var num = doReadv(stream, iov, iovcnt);
      HEAPU32[((pnum)>>2)] = num;
      return 0;
    } catch (e) {
    if (typeof FS == 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
    return e.errno;
  }
  }

  function convertI32PairToI53Checked(lo, hi) {
      assert(lo == (lo >>> 0) || lo == (lo|0)); // lo should either be a i32 or a u32
      assert(hi === (hi|0));                    // hi should be a i32
      return ((hi + 0x200000) >>> 0 < 0x400001 - !!lo) ? (lo >>> 0) + hi * 4294967296 : NaN;
    }
  
  
  
  
  function _fd_seek(fd, offset_low, offset_high, whence, newOffset) {
  try {
  
      var offset = convertI32PairToI53Checked(offset_low, offset_high); if (isNaN(offset)) return 61;
      var stream = SYSCALLS.getStreamFromFD(fd);
      FS.llseek(stream, offset, whence);
      (tempI64 = [stream.position>>>0,(tempDouble=stream.position,(+(Math.abs(tempDouble))) >= 1.0 ? (tempDouble > 0.0 ? ((Math.min((+(Math.floor((tempDouble)/4294967296.0))), 4294967295.0))|0)>>>0 : (~~((+(Math.ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296.0)))))>>>0) : 0)],HEAP32[((newOffset)>>2)] = tempI64[0],HEAP32[(((newOffset)+(4))>>2)] = tempI64[1]);
      if (stream.getdents && offset === 0 && whence === 0) stream.getdents = null; // reset readdir state
      return 0;
    } catch (e) {
    if (typeof FS == 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
    return e.errno;
  }
  }

  /** @param {number=} offset */
  function doWritev(stream, iov, iovcnt, offset) {
      var ret = 0;
      for (var i = 0; i < iovcnt; i++) {
        var ptr = HEAPU32[((iov)>>2)];
        var len = HEAPU32[(((iov)+(4))>>2)];
        iov += 8;
        var curr = FS.write(stream, HEAP8,ptr, len, offset);
        if (curr < 0) return -1;
        ret += curr;
        if (typeof offset !== 'undefined') {
          offset += curr;
        }
      }
      return ret;
    }
  
  function _fd_write(fd, iov, iovcnt, pnum) {
  try {
  
      var stream = SYSCALLS.getStreamFromFD(fd);
      var num = doWritev(stream, iov, iovcnt);
      HEAPU32[((pnum)>>2)] = num;
      return 0;
    } catch (e) {
    if (typeof FS == 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
    return e.errno;
  }
  }

  function __isLeapYear(year) {
        return year%4 === 0 && (year%100 !== 0 || year%400 === 0);
    }
  
  function __arraySum(array, index) {
      var sum = 0;
      for (var i = 0; i <= index; sum += array[i++]) {
        // no-op
      }
      return sum;
    }
  
  
  var __MONTH_DAYS_LEAP = [31,29,31,30,31,30,31,31,30,31,30,31];
  
  var __MONTH_DAYS_REGULAR = [31,28,31,30,31,30,31,31,30,31,30,31];
  function __addDays(date, days) {
      var newDate = new Date(date.getTime());
      while (days > 0) {
        var leap = __isLeapYear(newDate.getFullYear());
        var currentMonth = newDate.getMonth();
        var daysInCurrentMonth = (leap ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR)[currentMonth];
  
        if (days > daysInCurrentMonth-newDate.getDate()) {
          // we spill over to next month
          days -= (daysInCurrentMonth-newDate.getDate()+1);
          newDate.setDate(1);
          if (currentMonth < 11) {
            newDate.setMonth(currentMonth+1)
          } else {
            newDate.setMonth(0);
            newDate.setFullYear(newDate.getFullYear()+1);
          }
        } else {
          // we stay in current month
          newDate.setDate(newDate.getDate()+days);
          return newDate;
        }
      }
  
      return newDate;
    }
  
  
  
  
  function writeArrayToMemory(array, buffer) {
      assert(array.length >= 0, 'writeArrayToMemory array must have a length (should be an array or typed array)')
      HEAP8.set(array, buffer);
    }
  function _strftime(s, maxsize, format, tm) {
      // size_t strftime(char *restrict s, size_t maxsize, const char *restrict format, const struct tm *restrict timeptr);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/strftime.html
  
      var tm_zone = HEAP32[(((tm)+(40))>>2)];
  
      var date = {
        tm_sec: HEAP32[((tm)>>2)],
        tm_min: HEAP32[(((tm)+(4))>>2)],
        tm_hour: HEAP32[(((tm)+(8))>>2)],
        tm_mday: HEAP32[(((tm)+(12))>>2)],
        tm_mon: HEAP32[(((tm)+(16))>>2)],
        tm_year: HEAP32[(((tm)+(20))>>2)],
        tm_wday: HEAP32[(((tm)+(24))>>2)],
        tm_yday: HEAP32[(((tm)+(28))>>2)],
        tm_isdst: HEAP32[(((tm)+(32))>>2)],
        tm_gmtoff: HEAP32[(((tm)+(36))>>2)],
        tm_zone: tm_zone ? UTF8ToString(tm_zone) : ''
      };
  
      var pattern = UTF8ToString(format);
  
      // expand format
      var EXPANSION_RULES_1 = {
        '%c': '%a %b %d %H:%M:%S %Y',     // Replaced by the locale's appropriate date and time representation - e.g., Mon Aug  3 14:02:01 2013
        '%D': '%m/%d/%y',                 // Equivalent to %m / %d / %y
        '%F': '%Y-%m-%d',                 // Equivalent to %Y - %m - %d
        '%h': '%b',                       // Equivalent to %b
        '%r': '%I:%M:%S %p',              // Replaced by the time in a.m. and p.m. notation
        '%R': '%H:%M',                    // Replaced by the time in 24-hour notation
        '%T': '%H:%M:%S',                 // Replaced by the time
        '%x': '%m/%d/%y',                 // Replaced by the locale's appropriate date representation
        '%X': '%H:%M:%S',                 // Replaced by the locale's appropriate time representation
        // Modified Conversion Specifiers
        '%Ec': '%c',                      // Replaced by the locale's alternative appropriate date and time representation.
        '%EC': '%C',                      // Replaced by the name of the base year (period) in the locale's alternative representation.
        '%Ex': '%m/%d/%y',                // Replaced by the locale's alternative date representation.
        '%EX': '%H:%M:%S',                // Replaced by the locale's alternative time representation.
        '%Ey': '%y',                      // Replaced by the offset from %EC (year only) in the locale's alternative representation.
        '%EY': '%Y',                      // Replaced by the full alternative year representation.
        '%Od': '%d',                      // Replaced by the day of the month, using the locale's alternative numeric symbols, filled as needed with leading zeros if there is any alternative symbol for zero; otherwise, with leading <space> characters.
        '%Oe': '%e',                      // Replaced by the day of the month, using the locale's alternative numeric symbols, filled as needed with leading <space> characters.
        '%OH': '%H',                      // Replaced by the hour (24-hour clock) using the locale's alternative numeric symbols.
        '%OI': '%I',                      // Replaced by the hour (12-hour clock) using the locale's alternative numeric symbols.
        '%Om': '%m',                      // Replaced by the month using the locale's alternative numeric symbols.
        '%OM': '%M',                      // Replaced by the minutes using the locale's alternative numeric symbols.
        '%OS': '%S',                      // Replaced by the seconds using the locale's alternative numeric symbols.
        '%Ou': '%u',                      // Replaced by the weekday as a number in the locale's alternative representation (Monday=1).
        '%OU': '%U',                      // Replaced by the week number of the year (Sunday as the first day of the week, rules corresponding to %U ) using the locale's alternative numeric symbols.
        '%OV': '%V',                      // Replaced by the week number of the year (Monday as the first day of the week, rules corresponding to %V ) using the locale's alternative numeric symbols.
        '%Ow': '%w',                      // Replaced by the number of the weekday (Sunday=0) using the locale's alternative numeric symbols.
        '%OW': '%W',                      // Replaced by the week number of the year (Monday as the first day of the week) using the locale's alternative numeric symbols.
        '%Oy': '%y',                      // Replaced by the year (offset from %C ) using the locale's alternative numeric symbols.
      };
      for (var rule in EXPANSION_RULES_1) {
        pattern = pattern.replace(new RegExp(rule, 'g'), EXPANSION_RULES_1[rule]);
      }
  
      var WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
      function leadingSomething(value, digits, character) {
        var str = typeof value == 'number' ? value.toString() : (value || '');
        while (str.length < digits) {
          str = character[0]+str;
        }
        return str;
      }
  
      function leadingNulls(value, digits) {
        return leadingSomething(value, digits, '0');
      }
  
      function compareByDay(date1, date2) {
        function sgn(value) {
          return value < 0 ? -1 : (value > 0 ? 1 : 0);
        }
  
        var compare;
        if ((compare = sgn(date1.getFullYear()-date2.getFullYear())) === 0) {
          if ((compare = sgn(date1.getMonth()-date2.getMonth())) === 0) {
            compare = sgn(date1.getDate()-date2.getDate());
          }
        }
        return compare;
      }
  
      function getFirstWeekStartDate(janFourth) {
          switch (janFourth.getDay()) {
            case 0: // Sunday
              return new Date(janFourth.getFullYear()-1, 11, 29);
            case 1: // Monday
              return janFourth;
            case 2: // Tuesday
              return new Date(janFourth.getFullYear(), 0, 3);
            case 3: // Wednesday
              return new Date(janFourth.getFullYear(), 0, 2);
            case 4: // Thursday
              return new Date(janFourth.getFullYear(), 0, 1);
            case 5: // Friday
              return new Date(janFourth.getFullYear()-1, 11, 31);
            case 6: // Saturday
              return new Date(janFourth.getFullYear()-1, 11, 30);
          }
      }
  
      function getWeekBasedYear(date) {
          var thisDate = __addDays(new Date(date.tm_year+1900, 0, 1), date.tm_yday);
  
          var janFourthThisYear = new Date(thisDate.getFullYear(), 0, 4);
          var janFourthNextYear = new Date(thisDate.getFullYear()+1, 0, 4);
  
          var firstWeekStartThisYear = getFirstWeekStartDate(janFourthThisYear);
          var firstWeekStartNextYear = getFirstWeekStartDate(janFourthNextYear);
  
          if (compareByDay(firstWeekStartThisYear, thisDate) <= 0) {
            // this date is after the start of the first week of this year
            if (compareByDay(firstWeekStartNextYear, thisDate) <= 0) {
              return thisDate.getFullYear()+1;
            }
            return thisDate.getFullYear();
          }
          return thisDate.getFullYear()-1;
      }
  
      var EXPANSION_RULES_2 = {
        '%a': function(date) {
          return WEEKDAYS[date.tm_wday].substring(0,3);
        },
        '%A': function(date) {
          return WEEKDAYS[date.tm_wday];
        },
        '%b': function(date) {
          return MONTHS[date.tm_mon].substring(0,3);
        },
        '%B': function(date) {
          return MONTHS[date.tm_mon];
        },
        '%C': function(date) {
          var year = date.tm_year+1900;
          return leadingNulls((year/100)|0,2);
        },
        '%d': function(date) {
          return leadingNulls(date.tm_mday, 2);
        },
        '%e': function(date) {
          return leadingSomething(date.tm_mday, 2, ' ');
        },
        '%g': function(date) {
          // %g, %G, and %V give values according to the ISO 8601:2000 standard week-based year.
          // In this system, weeks begin on a Monday and week 1 of the year is the week that includes
          // January 4th, which is also the week that includes the first Thursday of the year, and
          // is also the first week that contains at least four days in the year.
          // If the first Monday of January is the 2nd, 3rd, or 4th, the preceding days are part of
          // the last week of the preceding year; thus, for Saturday 2nd January 1999,
          // %G is replaced by 1998 and %V is replaced by 53. If December 29th, 30th,
          // or 31st is a Monday, it and any following days are part of week 1 of the following year.
          // Thus, for Tuesday 30th December 1997, %G is replaced by 1998 and %V is replaced by 01.
  
          return getWeekBasedYear(date).toString().substring(2);
        },
        '%G': function(date) {
          return getWeekBasedYear(date);
        },
        '%H': function(date) {
          return leadingNulls(date.tm_hour, 2);
        },
        '%I': function(date) {
          var twelveHour = date.tm_hour;
          if (twelveHour == 0) twelveHour = 12;
          else if (twelveHour > 12) twelveHour -= 12;
          return leadingNulls(twelveHour, 2);
        },
        '%j': function(date) {
          // Day of the year (001-366)
          return leadingNulls(date.tm_mday+__arraySum(__isLeapYear(date.tm_year+1900) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR, date.tm_mon-1), 3);
        },
        '%m': function(date) {
          return leadingNulls(date.tm_mon+1, 2);
        },
        '%M': function(date) {
          return leadingNulls(date.tm_min, 2);
        },
        '%n': function() {
          return '\n';
        },
        '%p': function(date) {
          if (date.tm_hour >= 0 && date.tm_hour < 12) {
            return 'AM';
          }
          return 'PM';
        },
        '%S': function(date) {
          return leadingNulls(date.tm_sec, 2);
        },
        '%t': function() {
          return '\t';
        },
        '%u': function(date) {
          return date.tm_wday || 7;
        },
        '%U': function(date) {
          var days = date.tm_yday + 7 - date.tm_wday;
          return leadingNulls(Math.floor(days / 7), 2);
        },
        '%V': function(date) {
          // Replaced by the week number of the year (Monday as the first day of the week)
          // as a decimal number [01,53]. If the week containing 1 January has four
          // or more days in the new year, then it is considered week 1.
          // Otherwise, it is the last week of the previous year, and the next week is week 1.
          // Both January 4th and the first Thursday of January are always in week 1. [ tm_year, tm_wday, tm_yday]
          var val = Math.floor((date.tm_yday + 7 - (date.tm_wday + 6) % 7 ) / 7);
          // If 1 Jan is just 1-3 days past Monday, the previous week
          // is also in this year.
          if ((date.tm_wday + 371 - date.tm_yday - 2) % 7 <= 2) {
            val++;
          }
          if (!val) {
            val = 52;
            // If 31 December of prev year a Thursday, or Friday of a
            // leap year, then the prev year has 53 weeks.
            var dec31 = (date.tm_wday + 7 - date.tm_yday - 1) % 7;
            if (dec31 == 4 || (dec31 == 5 && __isLeapYear(date.tm_year%400-1))) {
              val++;
            }
          } else if (val == 53) {
            // If 1 January is not a Thursday, and not a Wednesday of a
            // leap year, then this year has only 52 weeks.
            var jan1 = (date.tm_wday + 371 - date.tm_yday) % 7;
            if (jan1 != 4 && (jan1 != 3 || !__isLeapYear(date.tm_year)))
              val = 1;
          }
          return leadingNulls(val, 2);
        },
        '%w': function(date) {
          return date.tm_wday;
        },
        '%W': function(date) {
          var days = date.tm_yday + 7 - ((date.tm_wday + 6) % 7);
          return leadingNulls(Math.floor(days / 7), 2);
        },
        '%y': function(date) {
          // Replaced by the last two digits of the year as a decimal number [00,99]. [ tm_year]
          return (date.tm_year+1900).toString().substring(2);
        },
        '%Y': function(date) {
          // Replaced by the year as a decimal number (for example, 1997). [ tm_year]
          return date.tm_year+1900;
        },
        '%z': function(date) {
          // Replaced by the offset from UTC in the ISO 8601:2000 standard format ( +hhmm or -hhmm ).
          // For example, "-0430" means 4 hours 30 minutes behind UTC (west of Greenwich).
          var off = date.tm_gmtoff;
          var ahead = off >= 0;
          off = Math.abs(off) / 60;
          // convert from minutes into hhmm format (which means 60 minutes = 100 units)
          off = (off / 60)*100 + (off % 60);
          return (ahead ? '+' : '-') + String("0000" + off).slice(-4);
        },
        '%Z': function(date) {
          return date.tm_zone;
        },
        '%%': function() {
          return '%';
        }
      };
  
      // Replace %% with a pair of NULLs (which cannot occur in a C string), then
      // re-inject them after processing.
      pattern = pattern.replace(/%%/g, '\0\0')
      for (var rule in EXPANSION_RULES_2) {
        if (pattern.includes(rule)) {
          pattern = pattern.replace(new RegExp(rule, 'g'), EXPANSION_RULES_2[rule](date));
        }
      }
      pattern = pattern.replace(/\0\0/g, '%')
  
      var bytes = intArrayFromString(pattern, false);
      if (bytes.length > maxsize) {
        return 0;
      }
  
      writeArrayToMemory(bytes, s);
      return bytes.length-1;
    }
  function _strftime_l(s, maxsize, format, tm, loc) {
      return _strftime(s, maxsize, format, tm); // no locale support yet
    }

  
  function _proc_exit(code) {
      EXITSTATUS = code;
      if (!keepRuntimeAlive()) {
        if (Module['onExit']) Module['onExit'](code);
        ABORT = true;
      }
      quit_(code, new ExitStatus(code));
    }
  /** @param {boolean|number=} implicit */
  function exitJS(status, implicit) {
      EXITSTATUS = status;
  
      checkUnflushedContent();
  
      // if exit() was called explicitly, warn the user if the runtime isn't actually being shut down
      if (keepRuntimeAlive() && !implicit) {
        var msg = 'program exited (with status: ' + status + '), but EXIT_RUNTIME is not set, so halting execution but not exiting the runtime or preventing further async execution (build with EXIT_RUNTIME=1, if you want a true shutdown)';
        readyPromiseReject(msg);
        err(msg);
      }
  
      _proc_exit(status);
    }

  function handleException(e) {
      // Certain exception types we do not treat as errors since they are used for
      // internal control flow.
      // 1. ExitStatus, which is thrown by exit()
      // 2. "unwind", which is thrown by emscripten_unwind_to_js_event_loop() and others
      //    that wish to return to JS event loop.
      if (e instanceof ExitStatus || e == 'unwind') {
        return EXITSTATUS;
      }
      checkStackCookie();
      if (e instanceof WebAssembly.RuntimeError) {
        if (_emscripten_stack_get_current() <= 0) {
          err('Stack overflow detected.  You can try increasing -sSTACK_SIZE (currently set to ' + 65536 + ')');
        }
      }
      quit_(1, e);
    }

  function getCFunc(ident) {
      var func = Module['_' + ident]; // closure exported function
      assert(func, 'Cannot call unknown function ' + ident + ', make sure it is exported');
      return func;
    }
  
  
    /**
     * @param {string|null=} returnType
     * @param {Array=} argTypes
     * @param {Arguments|Array=} args
     * @param {Object=} opts
     */
  function ccall(ident, returnType, argTypes, args, opts) {
      // For fast lookup of conversion functions
      var toC = {
        'string': (str) => {
          var ret = 0;
          if (str !== null && str !== undefined && str !== 0) { // null string
            // at most 4 bytes per UTF-8 code point, +1 for the trailing '\0'
            var len = (str.length << 2) + 1;
            ret = stackAlloc(len);
            stringToUTF8(str, ret, len);
          }
          return ret;
        },
        'array': (arr) => {
          var ret = stackAlloc(arr.length);
          writeArrayToMemory(arr, ret);
          return ret;
        }
      };
  
      function convertReturnValue(ret) {
        if (returnType === 'string') {
          
          return UTF8ToString(ret);
        }
        if (returnType === 'boolean') return Boolean(ret);
        return ret;
      }
  
      var func = getCFunc(ident);
      var cArgs = [];
      var stack = 0;
      assert(returnType !== 'array', 'Return type should not be "array".');
      if (args) {
        for (var i = 0; i < args.length; i++) {
          var converter = toC[argTypes[i]];
          if (converter) {
            if (stack === 0) stack = stackSave();
            cArgs[i] = converter(args[i]);
          } else {
            cArgs[i] = args[i];
          }
        }
      }
      var ret = func.apply(null, cArgs);
      function onDone(ret) {
        if (stack !== 0) stackRestore(stack);
        return convertReturnValue(ret);
      }
  
      ret = onDone(ret);
      return ret;
    }

  
  
    /**
     * @param {string=} returnType
     * @param {Array=} argTypes
     * @param {Object=} opts
     */
  function cwrap(ident, returnType, argTypes, opts) {
      return function() {
        return ccall(ident, returnType, argTypes, arguments, opts);
      }
    }
embind_init_charCodes();
BindingError = Module['BindingError'] = extendError(Error, 'BindingError');;
InternalError = Module['InternalError'] = extendError(Error, 'InternalError');;
init_emval();;

  var FSNode = /** @constructor */ function(parent, name, mode, rdev) {
    if (!parent) {
      parent = this;  // root node sets parent to itself
    }
    this.parent = parent;
    this.mount = parent.mount;
    this.mounted = null;
    this.id = FS.nextInode++;
    this.name = name;
    this.mode = mode;
    this.node_ops = {};
    this.stream_ops = {};
    this.rdev = rdev;
  };
  var readMode = 292/*292*/ | 73/*73*/;
  var writeMode = 146/*146*/;
  Object.defineProperties(FSNode.prototype, {
   read: {
    get: /** @this{FSNode} */function() {
     return (this.mode & readMode) === readMode;
    },
    set: /** @this{FSNode} */function(val) {
     val ? this.mode |= readMode : this.mode &= ~readMode;
    }
   },
   write: {
    get: /** @this{FSNode} */function() {
     return (this.mode & writeMode) === writeMode;
    },
    set: /** @this{FSNode} */function(val) {
     val ? this.mode |= writeMode : this.mode &= ~writeMode;
    }
   },
   isFolder: {
    get: /** @this{FSNode} */function() {
     return FS.isDir(this.mode);
    }
   },
   isDevice: {
    get: /** @this{FSNode} */function() {
     return FS.isChrdev(this.mode);
    }
   }
  });
  FS.FSNode = FSNode;
  FS.staticInit();;
ERRNO_CODES = {
      'EPERM': 63,
      'ENOENT': 44,
      'ESRCH': 71,
      'EINTR': 27,
      'EIO': 29,
      'ENXIO': 60,
      'E2BIG': 1,
      'ENOEXEC': 45,
      'EBADF': 8,
      'ECHILD': 12,
      'EAGAIN': 6,
      'EWOULDBLOCK': 6,
      'ENOMEM': 48,
      'EACCES': 2,
      'EFAULT': 21,
      'ENOTBLK': 105,
      'EBUSY': 10,
      'EEXIST': 20,
      'EXDEV': 75,
      'ENODEV': 43,
      'ENOTDIR': 54,
      'EISDIR': 31,
      'EINVAL': 28,
      'ENFILE': 41,
      'EMFILE': 33,
      'ENOTTY': 59,
      'ETXTBSY': 74,
      'EFBIG': 22,
      'ENOSPC': 51,
      'ESPIPE': 70,
      'EROFS': 69,
      'EMLINK': 34,
      'EPIPE': 64,
      'EDOM': 18,
      'ERANGE': 68,
      'ENOMSG': 49,
      'EIDRM': 24,
      'ECHRNG': 106,
      'EL2NSYNC': 156,
      'EL3HLT': 107,
      'EL3RST': 108,
      'ELNRNG': 109,
      'EUNATCH': 110,
      'ENOCSI': 111,
      'EL2HLT': 112,
      'EDEADLK': 16,
      'ENOLCK': 46,
      'EBADE': 113,
      'EBADR': 114,
      'EXFULL': 115,
      'ENOANO': 104,
      'EBADRQC': 103,
      'EBADSLT': 102,
      'EDEADLOCK': 16,
      'EBFONT': 101,
      'ENOSTR': 100,
      'ENODATA': 116,
      'ETIME': 117,
      'ENOSR': 118,
      'ENONET': 119,
      'ENOPKG': 120,
      'EREMOTE': 121,
      'ENOLINK': 47,
      'EADV': 122,
      'ESRMNT': 123,
      'ECOMM': 124,
      'EPROTO': 65,
      'EMULTIHOP': 36,
      'EDOTDOT': 125,
      'EBADMSG': 9,
      'ENOTUNIQ': 126,
      'EBADFD': 127,
      'EREMCHG': 128,
      'ELIBACC': 129,
      'ELIBBAD': 130,
      'ELIBSCN': 131,
      'ELIBMAX': 132,
      'ELIBEXEC': 133,
      'ENOSYS': 52,
      'ENOTEMPTY': 55,
      'ENAMETOOLONG': 37,
      'ELOOP': 32,
      'EOPNOTSUPP': 138,
      'EPFNOSUPPORT': 139,
      'ECONNRESET': 15,
      'ENOBUFS': 42,
      'EAFNOSUPPORT': 5,
      'EPROTOTYPE': 67,
      'ENOTSOCK': 57,
      'ENOPROTOOPT': 50,
      'ESHUTDOWN': 140,
      'ECONNREFUSED': 14,
      'EADDRINUSE': 3,
      'ECONNABORTED': 13,
      'ENETUNREACH': 40,
      'ENETDOWN': 38,
      'ETIMEDOUT': 73,
      'EHOSTDOWN': 142,
      'EHOSTUNREACH': 23,
      'EINPROGRESS': 26,
      'EALREADY': 7,
      'EDESTADDRREQ': 17,
      'EMSGSIZE': 35,
      'EPROTONOSUPPORT': 66,
      'ESOCKTNOSUPPORT': 137,
      'EADDRNOTAVAIL': 4,
      'ENETRESET': 39,
      'EISCONN': 30,
      'ENOTCONN': 53,
      'ETOOMANYREFS': 141,
      'EUSERS': 136,
      'EDQUOT': 19,
      'ESTALE': 72,
      'ENOTSUP': 138,
      'ENOMEDIUM': 148,
      'EILSEQ': 25,
      'EOVERFLOW': 61,
      'ECANCELED': 11,
      'ENOTRECOVERABLE': 56,
      'EOWNERDEAD': 62,
      'ESTRPIPE': 135,
    };;
// include: base64Utils.js
// Copied from https://github.com/strophe/strophejs/blob/e06d027/src/polyfills.js#L149

// This code was written by Tyler Akins and has been placed in the
// public domain.  It would be nice if you left this header intact.
// Base64 code from Tyler Akins -- http://rumkin.com

/**
 * Decodes a base64 string.
 * @param {string} input The string to decode.
 */
var decodeBase64 = typeof atob == 'function' ? atob : function (input) {
  var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

  var output = '';
  var chr1, chr2, chr3;
  var enc1, enc2, enc3, enc4;
  var i = 0;
  // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
  input = input.replace(/[^A-Za-z0-9\+\/\=]/g, '');
  do {
    enc1 = keyStr.indexOf(input.charAt(i++));
    enc2 = keyStr.indexOf(input.charAt(i++));
    enc3 = keyStr.indexOf(input.charAt(i++));
    enc4 = keyStr.indexOf(input.charAt(i++));

    chr1 = (enc1 << 2) | (enc2 >> 4);
    chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
    chr3 = ((enc3 & 3) << 6) | enc4;

    output = output + String.fromCharCode(chr1);

    if (enc3 !== 64) {
      output = output + String.fromCharCode(chr2);
    }
    if (enc4 !== 64) {
      output = output + String.fromCharCode(chr3);
    }
  } while (i < input.length);
  return output;
};

// Converts a string of base64 into a byte array.
// Throws error on invalid input.
function intArrayFromBase64(s) {

  try {
    var decoded = decodeBase64(s);
    var bytes = new Uint8Array(decoded.length);
    for (var i = 0 ; i < decoded.length ; ++i) {
      bytes[i] = decoded.charCodeAt(i);
    }
    return bytes;
  } catch (_) {
    throw new Error('Converting base64 string to bytes failed.');
  }
}

// If filename is a base64 data URI, parses and returns data (Buffer on node,
// Uint8Array otherwise). If filename is not a base64 data URI, returns undefined.
function tryParseAsDataURI(filename) {
  if (!isDataURI(filename)) {
    return;
  }

  return intArrayFromBase64(filename.slice(dataURIPrefix.length));
}


// end include: base64Utils.js
function checkIncomingModuleAPI() {
  ignoredModuleProp('fetchSettings');
}
var wasmImports = {
  "__assert_fail": ___assert_fail,
  "__cxa_throw": ___cxa_throw,
  "_embind_register_bigint": __embind_register_bigint,
  "_embind_register_bool": __embind_register_bool,
  "_embind_register_emval": __embind_register_emval,
  "_embind_register_float": __embind_register_float,
  "_embind_register_integer": __embind_register_integer,
  "_embind_register_memory_view": __embind_register_memory_view,
  "_embind_register_std_string": __embind_register_std_string,
  "_embind_register_std_wstring": __embind_register_std_wstring,
  "_embind_register_void": __embind_register_void,
  "abort": _abort,
  "emscripten_memcpy_big": _emscripten_memcpy_big,
  "emscripten_resize_heap": _emscripten_resize_heap,
  "environ_get": _environ_get,
  "environ_sizes_get": _environ_sizes_get,
  "fd_close": _fd_close,
  "fd_read": _fd_read,
  "fd_seek": _fd_seek,
  "fd_write": _fd_write,
  "strftime_l": _strftime_l
};
var asm = createWasm();
/** @type {function(...*):?} */
var ___wasm_call_ctors = createExportWrapper("__wasm_call_ctors", asm);
/** @type {function(...*):?} */
var _initialize = Module["_initialize"] = createExportWrapper("initialize", asm);
/** @type {function(...*):?} */
var _bandcenters = Module["_bandcenters"] = createExportWrapper("bandcenters", asm);
/** @type {function(...*):?} */
var _transform = Module["_transform"] = createExportWrapper("transform", asm);
/** @type {function(...*):?} */
var _release = Module["_release"] = createExportWrapper("release", asm);
/** @type {function(...*):?} */
var _main = Module["_main"] = createExportWrapper("main", asm);
/** @type {function(...*):?} */
var ___getTypeName = Module["___getTypeName"] = createExportWrapper("__getTypeName", asm);
/** @type {function(...*):?} */
var __embind_initialize_bindings = Module["__embind_initialize_bindings"] = createExportWrapper("_embind_initialize_bindings", asm);
/** @type {function(...*):?} */
var ___errno_location = createExportWrapper("__errno_location", asm);
/** @type {function(...*):?} */
var _fflush = Module["_fflush"] = createExportWrapper("fflush", asm);
/** @type {function(...*):?} */
var _malloc = Module["_malloc"] = createExportWrapper("malloc", asm);
/** @type {function(...*):?} */
var _free = Module["_free"] = createExportWrapper("free", asm);
/** @type {function(...*):?} */
var _emscripten_stack_init = asm["emscripten_stack_init"]
/** @type {function(...*):?} */
var _emscripten_stack_get_free = asm["emscripten_stack_get_free"]
/** @type {function(...*):?} */
var _emscripten_stack_get_base = asm["emscripten_stack_get_base"]
/** @type {function(...*):?} */
var _emscripten_stack_get_end = asm["emscripten_stack_get_end"]
/** @type {function(...*):?} */
var stackSave = createExportWrapper("stackSave", asm);
/** @type {function(...*):?} */
var stackRestore = createExportWrapper("stackRestore", asm);
/** @type {function(...*):?} */
var stackAlloc = createExportWrapper("stackAlloc", asm);
/** @type {function(...*):?} */
var _emscripten_stack_get_current = asm["emscripten_stack_get_current"]
/** @type {function(...*):?} */
var ___cxa_is_pointer_type = createExportWrapper("__cxa_is_pointer_type", asm);
/** @type {function(...*):?} */
var dynCall_viijii = Module["dynCall_viijii"] = createExportWrapper("dynCall_viijii", asm);
/** @type {function(...*):?} */
var dynCall_jiji = Module["dynCall_jiji"] = createExportWrapper("dynCall_jiji", asm);
/** @type {function(...*):?} */
var dynCall_iiiiij = Module["dynCall_iiiiij"] = createExportWrapper("dynCall_iiiiij", asm);
/** @type {function(...*):?} */
var dynCall_iiiiijj = Module["dynCall_iiiiijj"] = createExportWrapper("dynCall_iiiiijj", asm);
/** @type {function(...*):?} */
var dynCall_iiiiiijj = Module["dynCall_iiiiiijj"] = createExportWrapper("dynCall_iiiiiijj", asm);


// include: postamble.js
// === Auto-generated postamble setup entry stuff ===

Module["ccall"] = ccall;
Module["cwrap"] = cwrap;
var missingLibrarySymbols = [
  'stringToNewUTF8',
  'setErrNo',
  'inetPton4',
  'inetNtop4',
  'inetPton6',
  'inetNtop6',
  'readSockaddr',
  'writeSockaddr',
  'getHostByName',
  'traverseStack',
  'convertPCtoSourceLocation',
  'readEmAsmArgs',
  'jstoi_q',
  'jstoi_s',
  'listenOnce',
  'autoResumeAudioContext',
  'dynCallLegacy',
  'getDynCaller',
  'dynCall',
  'runtimeKeepalivePush',
  'runtimeKeepalivePop',
  'callUserCallback',
  'maybeExit',
  'safeSetTimeout',
  'asmjsMangle',
  'HandleAllocator',
  'getNativeTypeSize',
  'STACK_SIZE',
  'STACK_ALIGN',
  'POINTER_SIZE',
  'ASSERTIONS',
  'writeI53ToI64',
  'writeI53ToI64Clamped',
  'writeI53ToI64Signaling',
  'writeI53ToU64Clamped',
  'writeI53ToU64Signaling',
  'readI53FromI64',
  'readI53FromU64',
  'convertI32PairToI53',
  'convertU32PairToI53',
  'uleb128Encode',
  'sigToWasmTypes',
  'generateFuncType',
  'convertJsFunctionToWasm',
  'getEmptyTableSlot',
  'updateTableMap',
  'getFunctionAddress',
  'addFunction',
  'removeFunction',
  'reallyNegative',
  'unSign',
  'strLen',
  'reSign',
  'formatString',
  'AsciiToString',
  'stringToAscii',
  'allocateUTF8',
  'allocateUTF8OnStack',
  'writeStringToMemory',
  'getSocketFromFD',
  'getSocketAddress',
  'registerKeyEventCallback',
  'maybeCStringToJsString',
  'findEventTarget',
  'findCanvasEventTarget',
  'getBoundingClientRect',
  'fillMouseEventData',
  'registerMouseEventCallback',
  'registerWheelEventCallback',
  'registerUiEventCallback',
  'registerFocusEventCallback',
  'fillDeviceOrientationEventData',
  'registerDeviceOrientationEventCallback',
  'fillDeviceMotionEventData',
  'registerDeviceMotionEventCallback',
  'screenOrientation',
  'fillOrientationChangeEventData',
  'registerOrientationChangeEventCallback',
  'fillFullscreenChangeEventData',
  'registerFullscreenChangeEventCallback',
  'JSEvents_requestFullscreen',
  'JSEvents_resizeCanvasForFullscreen',
  'registerRestoreOldStyle',
  'hideEverythingExceptGivenElement',
  'restoreHiddenElements',
  'setLetterbox',
  'softFullscreenResizeWebGLRenderTarget',
  'doRequestFullscreen',
  'fillPointerlockChangeEventData',
  'registerPointerlockChangeEventCallback',
  'registerPointerlockErrorEventCallback',
  'requestPointerLock',
  'fillVisibilityChangeEventData',
  'registerVisibilityChangeEventCallback',
  'registerTouchEventCallback',
  'fillGamepadEventData',
  'registerGamepadEventCallback',
  'registerBeforeUnloadEventCallback',
  'fillBatteryEventData',
  'battery',
  'registerBatteryEventCallback',
  'setCanvasElementSize',
  'getCanvasElementSize',
  'jsStackTrace',
  'stackTrace',
  'checkWasiClock',
  'createDyncallWrapper',
  'setImmediateWrapped',
  'clearImmediateWrapped',
  'polyfillSetImmediate',
  'getPromise',
  'makePromiseCallback',
  'exception_addRef',
  'exception_decRef',
  'setMainLoop',
  '_setNetworkCallback',
  'heapObjectForWebGLType',
  'heapAccessShiftForWebGLHeap',
  'emscriptenWebGLGet',
  'computeUnpackAlignedImageSize',
  'emscriptenWebGLGetTexPixelData',
  'emscriptenWebGLGetUniform',
  'webglGetUniformLocation',
  'webglPrepareUniformLocationsBeforeFirstUse',
  'webglGetLeftBracePos',
  'emscriptenWebGLGetVertexAttrib',
  'writeGLArray',
  'SDL_unicode',
  'SDL_ttfContext',
  'SDL_audio',
  'GLFW_Window',
  'runAndAbortIfError',
  'ALLOC_NORMAL',
  'ALLOC_STACK',
  'allocate',
  'init_embind',
  'throwUnboundTypeError',
  'ensureOverloadTable',
  'exposePublicSymbol',
  'replacePublicSymbol',
  'getBasestPointer',
  'registerInheritedInstance',
  'unregisterInheritedInstance',
  'getInheritedInstance',
  'getInheritedInstanceCount',
  'getLiveInheritedInstances',
  'getTypeName',
  'heap32VectorToArray',
  'requireRegisteredType',
  'enumReadValueFromPointer',
  'runDestructors',
  'new_',
  'craftInvokerFunction',
  'embind__requireFunction',
  'genericPointerToWireType',
  'constNoSmartPtrRawPointerToWireType',
  'nonConstNoSmartPtrRawPointerToWireType',
  'init_RegisteredPointer',
  'RegisteredPointer',
  'RegisteredPointer_getPointee',
  'RegisteredPointer_destructor',
  'RegisteredPointer_deleteObject',
  'RegisteredPointer_fromWireType',
  'runDestructor',
  'releaseClassHandle',
  'detachFinalizer',
  'attachFinalizer',
  'makeClassHandle',
  'init_ClassHandle',
  'ClassHandle',
  'ClassHandle_isAliasOf',
  'throwInstanceAlreadyDeleted',
  'ClassHandle_clone',
  'ClassHandle_delete',
  'ClassHandle_isDeleted',
  'ClassHandle_deleteLater',
  'flushPendingDeletes',
  'setDelayFunction',
  'RegisteredClass',
  'shallowCopyInternalPointer',
  'downcastPointer',
  'upcastPointer',
  'validateThis',
  'getStringOrSymbol',
  'craftEmvalAllocator',
  'emval_get_global',
  'emval_lookupTypes',
  'emval_allocateDestructors',
  'emval_addMethodCaller',
];
missingLibrarySymbols.forEach(missingLibrarySymbol)

var unexportedSymbols = [
  'run',
  'UTF8ArrayToString',
  'UTF8ToString',
  'stringToUTF8Array',
  'stringToUTF8',
  'lengthBytesUTF8',
  'addOnPreRun',
  'addOnInit',
  'addOnPreMain',
  'addOnExit',
  'addOnPostRun',
  'addRunDependency',
  'removeRunDependency',
  'FS_createFolder',
  'FS_createPath',
  'FS_createDataFile',
  'FS_createPreloadedFile',
  'FS_createLazyFile',
  'FS_createLink',
  'FS_createDevice',
  'FS_unlink',
  'out',
  'err',
  'callMain',
  'abort',
  'keepRuntimeAlive',
  'wasmMemory',
  'stackAlloc',
  'stackSave',
  'stackRestore',
  'getTempRet0',
  'setTempRet0',
  'writeStackCookie',
  'checkStackCookie',
  'intArrayFromBase64',
  'tryParseAsDataURI',
  'ptrToString',
  'zeroMemory',
  'exitJS',
  'getHeapMax',
  'emscripten_realloc_buffer',
  'ENV',
  'ERRNO_CODES',
  'ERRNO_MESSAGES',
  'DNS',
  'Protocols',
  'Sockets',
  'getRandomDevice',
  'timers',
  'warnOnce',
  'UNWIND_CACHE',
  'readEmAsmArgsArray',
  'getExecutableName',
  'handleException',
  'asyncLoad',
  'alignMemory',
  'mmapAlloc',
  'convertI32PairToI53Checked',
  'getCFunc',
  'freeTableIndexes',
  'functionsInTableMap',
  'setValue',
  'getValue',
  'PATH',
  'PATH_FS',
  'intArrayFromString',
  'intArrayToString',
  'UTF16Decoder',
  'UTF16ToString',
  'stringToUTF16',
  'lengthBytesUTF16',
  'UTF32ToString',
  'stringToUTF32',
  'lengthBytesUTF32',
  'writeArrayToMemory',
  'writeAsciiToMemory',
  'SYSCALLS',
  'JSEvents',
  'specialHTMLTargets',
  'currentFullscreenStrategy',
  'restoreOldWindowedStyle',
  'demangle',
  'demangleAll',
  'ExitStatus',
  'getEnvStrings',
  'doReadv',
  'doWritev',
  'dlopenMissingError',
  'promiseMap',
  'uncaughtExceptionCount',
  'exceptionLast',
  'exceptionCaught',
  'ExceptionInfo',
  'Browser',
  'wget',
  'FS',
  'MEMFS',
  'TTY',
  'PIPEFS',
  'SOCKFS',
  'tempFixedLengthArray',
  'miniTempWebGLFloatBuffers',
  'GL',
  'AL',
  'SDL',
  'SDL_gfx',
  'GLUT',
  'EGL',
  'GLFW',
  'GLEW',
  'IDBStore',
  'InternalError',
  'BindingError',
  'UnboundTypeError',
  'PureVirtualError',
  'throwInternalError',
  'throwBindingError',
  'extendError',
  'createNamedFunction',
  'embindRepr',
  'registeredInstances',
  'registeredTypes',
  'awaitingDependencies',
  'typeDependencies',
  'registeredPointers',
  'registerType',
  'whenDependentTypesAreResolved',
  'embind_charCodes',
  'embind_init_charCodes',
  'readLatin1String',
  'getShiftFromSize',
  'integerReadValueFromPointer',
  'floatReadValueFromPointer',
  'simpleReadValueFromPointer',
  'tupleRegistrations',
  'structRegistrations',
  'finalizationRegistry',
  'detachFinalizer_deps',
  'deletionQueue',
  'delayFunction',
  'char_0',
  'char_9',
  'makeLegalFunctionName',
  'emval_handle_array',
  'emval_free_list',
  'emval_symbols',
  'init_emval',
  'count_emval_handles',
  'get_first_emval',
  'Emval',
  'emval_newers',
  'emval_methodCallers',
  'emval_registeredMethods',
];
unexportedSymbols.forEach(unexportedRuntimeSymbol);



var calledRun;

dependenciesFulfilled = function runCaller() {
  // If run has never been called, and we should call run (INVOKE_RUN is true, and Module.noInitialRun is not false)
  if (!calledRun) run();
  if (!calledRun) dependenciesFulfilled = runCaller; // try this again later, after new deps are fulfilled
};

function callMain() {
  assert(runDependencies == 0, 'cannot call main when async dependencies remain! (listen on Module["onRuntimeInitialized"])');
  assert(__ATPRERUN__.length == 0, 'cannot call main when preRun functions remain to be called');

  var entryFunction = _main;

  var argc = 0;
  var argv = 0;

  try {

    var ret = entryFunction(argc, argv);

    // In PROXY_TO_PTHREAD builds, we should never exit the runtime below, as
    // execution is asynchronously handed off to a pthread.
    // if we're not running an evented main loop, it's time to exit
    exitJS(ret, /* implicit = */ true);
    return ret;
  }
  catch (e) {
    return handleException(e);
  }
}

function stackCheckInit() {
  // This is normally called automatically during __wasm_call_ctors but need to
  // get these values before even running any of the ctors so we call it redundantly
  // here.
  _emscripten_stack_init();
  // TODO(sbc): Move writeStackCookie to native to to avoid this.
  writeStackCookie();
}

/** @type {function(Array=)} */
function run() {

  if (runDependencies > 0) {
    return;
  }

    stackCheckInit();

  preRun();

  // a preRun added a dependency, run will be called later
  if (runDependencies > 0) {
    return;
  }

  function doRun() {
    // run may have just been called through dependencies being fulfilled just in this very frame,
    // or while the async setStatus time below was happening
    if (calledRun) return;
    calledRun = true;
    Module['calledRun'] = true;

    if (ABORT) return;

    initRuntime();

    preMain();

    readyPromiseResolve(Module);
    if (Module['onRuntimeInitialized']) Module['onRuntimeInitialized']();

    if (shouldRunNow) callMain();

    postRun();
  }

  if (Module['setStatus']) {
    Module['setStatus']('Running...');
    setTimeout(function() {
      setTimeout(function() {
        Module['setStatus']('');
      }, 1);
      doRun();
    }, 1);
  } else
  {
    doRun();
  }
  checkStackCookie();
}

function checkUnflushedContent() {
  // Compiler settings do not allow exiting the runtime, so flushing
  // the streams is not possible. but in ASSERTIONS mode we check
  // if there was something to flush, and if so tell the user they
  // should request that the runtime be exitable.
  // Normally we would not even include flush() at all, but in ASSERTIONS
  // builds we do so just for this check, and here we see if there is any
  // content to flush, that is, we check if there would have been
  // something a non-ASSERTIONS build would have not seen.
  // How we flush the streams depends on whether we are in SYSCALLS_REQUIRE_FILESYSTEM=0
  // mode (which has its own special function for this; otherwise, all
  // the code is inside libc)
  var oldOut = out;
  var oldErr = err;
  var has = false;
  out = err = (x) => {
    has = true;
  }
  try { // it doesn't matter if it fails
    _fflush(0);
    // also flush in the JS FS layer
    ['stdout', 'stderr'].forEach(function(name) {
      var info = FS.analyzePath('/dev/' + name);
      if (!info) return;
      var stream = info.object;
      var rdev = stream.rdev;
      var tty = TTY.ttys[rdev];
      if (tty && tty.output && tty.output.length) {
        has = true;
      }
    });
  } catch(e) {}
  out = oldOut;
  err = oldErr;
  if (has) {
    warnOnce('stdio streams had content in them that was not flushed. you should set EXIT_RUNTIME to 1 (see the FAQ), or make sure to emit a newline when you printf etc.');
  }
}

if (Module['preInit']) {
  if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
  while (Module['preInit'].length > 0) {
    Module['preInit'].pop()();
  }
}

// shouldRunNow refers to calling main(), not run().
var shouldRunNow = true;

if (Module['noInitialRun']) shouldRunNow = false;

run();


// end include: postamble.js


  return Module
}
);
})();
if (typeof exports === 'object' && typeof module === 'object')
  module.exports = Module;
else if (typeof define === 'function' && define['amd'])
  define([], function() { return Module; });
else if (typeof exports === 'object')
  exports["Module"] = Module;

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
