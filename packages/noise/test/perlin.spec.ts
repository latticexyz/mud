import { expect } from "chai";
import fs from "fs";

function fetchAndCompileWasmModule(url: string) {
  const wasmBuffer = fs.readFileSync(url);
  return WebAssembly.compile(wasmBuffer);
}

describe("Simplex", () => {
  let getSimplexWasm: (x: number, y: number) => number = () => 0;

  before(async () => {
    // Perlin setup
    const WasmNoiseMemory = new WebAssembly.Memory({ initial: 9 });
    const wasmModule = await fetchAndCompileWasmModule("../../node_modules/WasmNoise/dist/0.4.3/wasmnoise.opt.wasm");
    const WasmNoise: any = await WebAssembly.instantiate(wasmModule, {
      env: {
        __errno_location: function () {
          return 8;
        },
        abort: function () {
          throw new Error("Abort called!");
        },
        sbrk: function (len: number) {
          return WasmNoiseMemory.grow(len >> 16) << 16;
        },
        memory: WasmNoiseMemory,
      },
    });

    WasmNoise.exports["_GLOBAL__sub_I_WasmNoiseInterface.cpp"]();
    WasmNoise.exports.SetFrequency(0.025);
    getSimplexWasm = (x: number, y: number) => WasmNoise.exports.GetSimplex2(x, y);
  });

  it("should return simplex noise", async () => {
    expect(getSimplexWasm(1, 1)).to.be.eq(0.1082853227853775);
  });
});
