import fs from "fs";
import { InitializeKeccak, keccak256 } from "keccak-wasm";
import { perlinSingle as _perlinSingle, perlinRect as _perlinRect, memory as _memory } from "./types";

async function fetchAndCompileWasmModule(url: URL) {
  try {
    return await WebAssembly.compileStreaming(fetch(url));
  } catch {
    return WebAssembly.compile(fs.readFileSync(url));
  }
}

export async function createPerlinWasm(): Promise<{
  perlinSingle: typeof _perlinSingle;
  perlinRect: typeof _perlinRect;
  memory: typeof _memory;
}> {
  const url = new URL("./build/release.wasm", import.meta.url);
  const wasmModule = await fetchAndCompileWasmModule(url);

  await InitializeKeccak();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const wasmInstance: any = await WebAssembly.instantiate(wasmModule, {
    env: {
      rand(dataOffset: number) {
        const data = new Uint8Array(wasmInstance.exports.memory.buffer.slice(dataOffset, dataOffset + 16));
        const result: ArrayBuffer = keccak256(data, false);
        return new Uint8Array(result)[result.byteLength - 1];
      },
      abort: function () {
        throw new Error("abort called in wasm perlin");
      },
      logFloat(f: number) {
        console.log(f);
      },
      log(b: Buffer) {
        console.log("wasm buffer", b);
      },
    },
  });

  function perlinRect(x: number, y: number, w: number, h: number, seed: number, scale: number, floor: boolean) {
    const offset = wasmInstance.exports.perlinRect(x, y, w, h, seed, scale, floor);
    return new Float64Array(wasmInstance.exports.memory.buffer.slice(offset, offset + w * h * 8));
  }

  return { ...wasmInstance.exports, perlinRect };
}
