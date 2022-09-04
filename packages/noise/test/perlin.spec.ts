import { expect } from "chai";
import fs from "fs";
import { ethers } from "hardhat";
import { perlin } from "../src/ts";
import { soliditySha3 } from "web3-utils";
import { InitializeKeccak, keccak256 } from "keccak-wasm";

function fetchAndCompileWasmModule(url: string) {
  const wasmBuffer = fs.readFileSync(url);
  return WebAssembly.compile(wasmBuffer);
}

function encodePackedU32(inputs: number[]): Buffer {
  const buffer = Buffer.from(inputs.map((i) => i.toString(16).padStart(8, "0")).join(""), "hex");
  return buffer;
}

// Seems like it's not feasible to get the existing wasm noise library to compute the same values as the existing sol perlin function.
// Since solidity comes with more restrictions (eg no floating point path available), I think the best approach would be to port
// the existing perlin implementation to WebAssembly and use this port on the client.

const SEED = 42;
const SCALE = 1;

describe("Perlin", () => {
  let getPerlinWasm: (x: number, y: number) => number = () => 0;
  let getPerlinRectWasm: (x: number, y: number, w: number, h: number) => Float64Array = () => new Float64Array();
  let getPerlinSol: (x: number, y: number) => Promise<number> = async () => 0;
  let getPerlinTs: (x: number, y: number) => number = () => 0;

  before(async () => {
    await InitializeKeccak(); // This must be called before using this library.

    // Sol setup
    const PerlinSol = await ethers.getContractFactory("Perlin");
    const deployedPerlinNoise = await PerlinSol.deploy();
    getPerlinSol = (x: number, y: number) => deployedPerlinNoise.computePerlin(x, y, SEED, SCALE);

    // TS setup
    getPerlinTs = (x: number, y: number) =>
      perlin({ x, y }, { seed: SEED, scale: SCALE, mirrorX: false, mirrorY: false, floor: true });

    // AssemblyScript setup
    const wasmModule = await fetchAndCompileWasmModule("src/wasm/build/release.wasm");
    const wasmInstance: any = await WebAssembly.instantiate(wasmModule, {
      env: {
        rand(dataOffset: number) {
          const data = new Uint8Array(wasmInstance.exports.memory.buffer.slice(dataOffset, dataOffset + 16));
          const result: ArrayBuffer = keccak256(data, false);
          return new Uint8Array(result)[result.byteLength - 1];
        },
        abort: function () {
          throw new Error("Abort called!");
        },
        logFloat(f: number) {
          console.log(f);
        },
        log(b: Buffer) {
          console.log("wasm buffer", b);
        },
      },
    });

    getPerlinWasm = (x: number, y: number) => wasmInstance.exports.perlinSingle(x, y, SEED, SCALE, true);
    getPerlinRectWasm = (x: number, y: number, w: number, h: number) => {
      const offset = wasmInstance.exports.perlinRect(x, y, w, h, SEED, SCALE, true);
      return new Float64Array(wasmInstance.exports.memory.buffer.slice(offset, offset + w * h * 8));
    };
  });

  describe("getPerlinSol", () => {
    it("should return sol perlin noise", async () => {
      expect(await getPerlinSol(10, 10)).to.eq(31);
    });
  });

  describe("getPerlinTs", () => {
    it("should return ts perlin noise", async () => {
      expect(getPerlinTs(10, 10)).to.eq(31);
    });

    it("should return the same perlin result as getPerlinSol", async () => {
      for (let x = 0; x < 10; x++) {
        for (let y = 0; y < 10; y++) {
          const solPerlin = await getPerlinSol(x, y);
          const tsPerlin = getPerlinTs(x, y);
          expect(solPerlin).to.eq(tsPerlin);
        }
      }
    });

    it("should compute 16x16 single perlin values in < 1s", () => {
      const start = Date.now();
      for (let x = 0; x < 16; x++) {
        for (let y = 0; y < 16; y++) {
          getPerlinTs(x, y);
        }
      }
      const end = Date.now();
      const duration = end - start;
      expect(duration).to.be.lte(1000);
    });
  });

  describe("getPerlinWasm", () => {
    it("should return wasm perlin noise", () => {
      const noise = getPerlinWasm(10, 10);
      expect(noise).to.eq(31);
    });

    it("should return the same perlin result as getPerlinTs", async () => {
      for (let x = 0; x < 10; x++) {
        for (let y = 0; y < 10; y++) {
          const tsPerlin = getPerlinTs(x, y);
          const wasmPerlin = getPerlinWasm(x, y);
          expect(tsPerlin).to.eq(wasmPerlin);
        }
      }
    });

    it("should compute 16x16 single perlin values in < 32ms", () => {
      const start = Date.now();
      for (let x = 0; x < 16; x++) {
        for (let y = 0; y < 16; y++) {
          getPerlinWasm(x, y);
        }
      }
      const end = Date.now();
      const duration = end - start;
      expect(duration).to.be.lte(32);
    });
  });

  describe("getPerlinRectWasm", () => {
    it("should return the same result as getPerlinWasm", () => {
      const w = 10;
      const h = 10;
      const rectValues = getPerlinRectWasm(0, 0, w, h);

      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          expect(getPerlinWasm(x, y)).to.eq(rectValues[y * w + x]);
        }
      }
    });

    it("should compute perlin values in a 16x16 rect in < 16s", () => {
      const start = Date.now();
      getPerlinRectWasm(0, 0, 16, 16);
      const end = Date.now();
      const duration = end - start;
      expect(duration).to.be.lte(1000);
    });
  });

  describe("keccak256", () => {
    it("should compute the same hash as soliditySha3 for a string", () => {
      const msg = "test";
      expect("0x" + keccak256(msg)).to.eq(soliditySha3(msg));
    });

    it("should compute the same hash as soliditySha3 for abi.encodePacked params", () => {
      const x = 10;
      const y = 11;
      const scale = 12;
      const seed = 13;

      const correctHash = soliditySha3(
        { t: "uint32", v: x },
        { t: "uint32", v: y },
        { t: "uint32", v: scale },
        { t: "uint32", v: seed }
      )!;

      const encodedString = encodePackedU32([x, y, scale, seed]);
      const testHash = "0x" + keccak256(encodedString, true);
      expect(testHash).to.eq(correctHash);
    });
  });
});
