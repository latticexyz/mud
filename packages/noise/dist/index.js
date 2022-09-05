var $cW8u1$fs = require("fs");
var $cW8u1$keccakwasm = require("keccak-wasm");

function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}
function $parcel$interopDefault(a) {
  return a && a.__esModule ? a.default : a;
}

$parcel$export(module.exports, "createPerlinWasm", () => $13bbea9e333e0ee0$export$3eb18967c2d932c1);


async function $13bbea9e333e0ee0$var$fetchAndCompileWasmModule(url) {
    try {
        return await WebAssembly.compileStreaming(fetch(url));
    } catch  {
        return WebAssembly.compile((0, ($parcel$interopDefault($cW8u1$fs))).readFileSync(url));
    }
}
async function $13bbea9e333e0ee0$export$3eb18967c2d932c1() {
    const url = new URL("release.8dff32c0.wasm", "file:" + __filename);
    const wasmModule = await $13bbea9e333e0ee0$var$fetchAndCompileWasmModule(url);
    await (0, $cW8u1$keccakwasm.InitializeKeccak)();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const wasmInstance = await WebAssembly.instantiate(wasmModule, {
        env: {
            rand (dataOffset) {
                const data = new Uint8Array(wasmInstance.exports.memory.buffer.slice(dataOffset, dataOffset + 16));
                const result = (0, $cW8u1$keccakwasm.keccak256)(data, false);
                return new Uint8Array(result)[result.byteLength - 1];
            },
            abort: function() {
                throw new Error("abort called in wasm perlin");
            },
            logFloat (f) {
                console.log(f);
            },
            log (b) {
                console.log("wasm buffer", b);
            }
        }
    });
    function perlinRect(x, y, w, h, seed, scale, floor) {
        const offset = wasmInstance.exports.perlinRect(x, y, w, h, seed, scale, floor);
        return new Float64Array(wasmInstance.exports.memory.buffer.slice(offset, offset + w * h * 8));
    }
    return {
        ...wasmInstance.exports,
        perlinRect: perlinRect
    };
}




//# sourceMappingURL=index.js.map
