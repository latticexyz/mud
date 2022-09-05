import $bzNkd$fs from "fs";
import {InitializeKeccak as $bzNkd$InitializeKeccak, keccak256 as $bzNkd$keccak256} from "keccak-wasm";



async function $6c276e59ae77966e$var$fetchAndCompileWasmModule(url) {
    try {
        return await WebAssembly.compileStreaming(fetch(url));
    } catch  {
        return WebAssembly.compile((0, $bzNkd$fs).readFileSync(url));
    }
}
async function $6c276e59ae77966e$export$3eb18967c2d932c1() {
    const url = new URL("release.8dff32c0.wasm", import.meta.url);
    const wasmModule = await $6c276e59ae77966e$var$fetchAndCompileWasmModule(url);
    await (0, $bzNkd$InitializeKeccak)();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const wasmInstance = await WebAssembly.instantiate(wasmModule, {
        env: {
            rand (dataOffset) {
                const data = new Uint8Array(wasmInstance.exports.memory.buffer.slice(dataOffset, dataOffset + 16));
                const result = (0, $bzNkd$keccak256)(data, false);
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




export {$6c276e59ae77966e$export$3eb18967c2d932c1 as createPerlinWasm};
//# sourceMappingURL=index.esm.js.map
