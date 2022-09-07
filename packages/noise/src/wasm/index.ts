import fs from "fs";
import { InitializeKeccak, keccak256 } from "keccak-wasm";
import {
  perlinSingle as _perlinSingle,
  perlinRect as _perlinRect,
  memory as _memory,
  smoothStep as _smoothStep,
  noise2d as _noise2d,
} from "./types";

async function fetchBuffer(url: URL) {
  try {
    return fetch(url).then((res) => res.arrayBuffer());
  } catch {
    return fs.readFileSync(url);
  }
}

async function fetchAndCompileWasmModule(url: URL) {
  try {
    return await WebAssembly.compileStreaming(fetch(url));
  } catch {
    return WebAssembly.compile(fs.readFileSync(url));
  }
}

/**
 * Initialize perlin wasm functions.
 * @returns { {@link _perlinSingle}, {@link _perlinRect}, {@link _memory} }
 */
export async function createPerlinWasm(): Promise<{
  perlinSingle: typeof _perlinSingle;
  perlinRect: typeof _perlinRect;
  memory: typeof _memory;
  smoothStep: typeof _smoothStep;
  noise2d: typeof _noise2d;
}> {
  const url = new URL("./build/release.wasm", import.meta.url);
  const wasmModule = await fetchAndCompileWasmModule(url);
  const keccakModule = await fetchBuffer(
    new URL("../../../../node_modules/keccak-wasm/bin/keccak.wasm", import.meta.url)
  );

  await InitializeKeccak(keccakModule);

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
