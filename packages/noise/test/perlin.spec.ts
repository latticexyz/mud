import { expect } from "chai";
import { ethers } from "hardhat";
import { perlin } from "../src/ts";
import { soliditySha3 } from "web3-utils";
import { createPerlinWasm } from "../src/wasm";
import { InitializeKeccak, keccak256 } from "keccak-wasm";
import fs from "fs";
import { BigNumber } from "ethers";

function encodePackedU32(inputs: number[]): Buffer {
  const buffer = Buffer.from(inputs.map((i) => i.toString(16).padStart(8, "0")).join(""), "hex");
  return buffer;
}

// Seems like it's not feasible to get the existing wasm noise library to compute the same values as the existing sol perlin function.
// Since solidity comes with more restrictions (eg no floating point path available), I think the best approach would be to port
// the existing perlin implementation to WebAssembly and use this port on the client.

const SEED = 42;
const SCALE = 2;

describe("Perlin", () => {
  let getPerlinWasm: (x: number, y: number) => number = () => 0;
  let getPerlin2Wasm: (x: number, y: number) => bigint = () => 1n;
  let getPerlinRectWasm: (x: number, y: number, w: number, h: number) => Float64Array = () => new Float64Array();
  let getPerlinSol: (x: number, y: number) => Promise<number> = async () => 0;
  let getPerlin2Sol: (x: number, y: number) => Promise<number> = async () => 0;
  let getPerlinTs: (x: number, y: number) => number = () => 0;

  let smoothStepSol: (x: number) => Promise<BigNumber> = async () => BigNumber.from(0);
  let smoothStepWasm: (x: bigint) => number = () => 0;

  before(async () => {
    // Sol setup
    const PerlinSol = await ethers.getContractFactory("Perlin");
    const deployedPerlinNoise = await PerlinSol.deploy();
    getPerlinSol = (x: number, y: number) => deployedPerlinNoise.computePerlin(x, y, SEED, SCALE);
    smoothStepSol = (x: number) => deployedPerlinNoise.smoothStep(x, SCALE);

    const Perlin2Sol = await ethers.getContractFactory("Perlin2");
    const deployedPerlin2Noise = await Perlin2Sol.deploy();
    getPerlin2Sol = (x: number, y: number) =>
      deployedPerlin2Noise.noise2d(Math.floor(x * 2 ** 16), Math.floor(y * 2 ** 16));

    // TS setup
    getPerlinTs = (x: number, y: number) =>
      perlin({ x, y }, { seed: SEED, scale: SCALE, mirrorX: false, mirrorY: false, floor: true });

    // AssemblyScript setup
    const { perlinSingle, perlinRect, smoothStep, noise2d } = await createPerlinWasm();
    getPerlinWasm = (x: number, y: number) => perlinSingle(x, y, SEED, SCALE, true);
    getPerlinRectWasm = (x: number, y: number, w: number, h: number) => {
      return perlinRect(x, y, w, h, SEED, SCALE, true) as Float64Array;
    };
    smoothStepWasm = (x: bigint) => smoothStep(x, SCALE);
    getPerlin2Wasm = (x: number, y: number) =>
      noise2d(BigInt(Math.floor(x * 2 ** 16)), BigInt(Math.floor(y * 2 ** 16)));
  });

  describe("smoothStep", () => {
    describe("smoothStepSol", () => {
      it("should compute the same function as smoothStepWasm", async () => {
        const vals = [0, 0.25, 0.5, 0.75, 1];
        for (const val of vals) {
          const denom = SCALE * SCALE;
          const wasm = smoothStepWasm(BigInt(val * denom));
          const sol = await smoothStepSol(val * denom);
          const solNum = sol.div(BigNumber.from(2).pow(54)).toNumber() / 2 ** 10;
          expect(solNum).to.eq(wasm);
        }
      });
    });
  });

  describe("getPerlinSol", () => {
    it("should return sol perlin noise", async () => {
      expect(await getPerlinSol(10, 10)).to.eq(29);
    });
  });

  describe("getPerlin2Sol", () => {
    it("should return sol perlin noise", async () => {
      expect(await getPerlin2Sol(10, 10)).to.eq(20);
    });
  });

  describe("getPerlin2Wasm", () => {
    it("should return wasm perlin noise", async () => {
      expect(getPerlin2Wasm(0.5, 0.5)).to.eq(20);
    });

    // skipped because the typescript implementation wasn't updated to use smoothStep interpolation yet
    it("should return the same perlin result as getPerlin2Sol", async () => {
      for (let x = 0; x < 10; x++) {
        for (let y = 0; y < 10; y++) {
          const solPerlin = await getPerlin2Sol(x / 10, y / 10);
          const wasmPerlin = getPerlin2Wasm(x / 10, y / 10);
          expect(solPerlin).to.eq(wasmPerlin);
        }
      }
    });

    it("should compute 512x512 single perlin values in < 1s", () => {
      const start = Date.now();
      for (let x = 0; x < 512; x++) {
        for (let y = 0; y < 512; y++) {
          getPerlin2Wasm(x / 512, y / 512);
        }
      }
      const end = Date.now();
      const duration = end - start;
      expect(duration).to.be.lte(1000);
      console.log("Duration", duration);
    });

    it("should compute perlin values in a 512x512 rect in < 10s", () => {
      const start = Date.now();
      const values: number[] = [];
      for (let y = 0; y < 512; y++) {
        for (let x = 0; x < 512; x++) {
          values.push(Number(getPerlin2Wasm(x / 30, y / 30)));
        }
      }
      const end = Date.now();
      const duration = end - start;
      expect(duration).to.be.lte(10000);
      fs.writeFileSync("values_perlin2.json", JSON.stringify([...values]));
    });
  });

  describe("getPerlinTs", () => {
    // skipped because the typescript implementation wasn't updated to use smoothStep interpolation yet
    it.skip("should return ts perlin noise", async () => {
      expect(getPerlinTs(10, 10)).to.eq(29);
    });

    // skipped because the typescript implementation wasn't updated to use smoothStep interpolation yet
    it.skip("should return the same perlin result as getPerlinSol", async () => {
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
      expect(noise).to.eq(29);
    });

    // skipped because the typescript implementation wasn't updated to use smoothStep interpolation yet
    it.skip("should return the same perlin result as getPerlinTs", async () => {
      for (let x = 0; x < 10; x++) {
        for (let y = 0; y < 10; y++) {
          const tsPerlin = getPerlinTs(x, y);
          const wasmPerlin = getPerlinWasm(x, y);
          expect(tsPerlin).to.eq(wasmPerlin);
        }
      }
    });

    it("should return the same perlin result as getPerlinSol", async () => {
      for (let x = 0; x < 10; x++) {
        for (let y = 0; y < 10; y++) {
          const solPerlin = await getPerlinSol(x, y);
          const wasmPerlin = getPerlinWasm(x, y);
          expect(solPerlin).to.eq(wasmPerlin);
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

    it.skip("should compute perlin values in a 512x512 rect in < 10s", () => {
      const start = Date.now();
      const values = getPerlinRectWasm(0, 0, 512, 412);
      const end = Date.now();
      const duration = end - start;
      expect(duration).to.be.lte(10000);
      fs.writeFileSync("values.json", JSON.stringify([...values]));
    });

    it("should generate perlin values between 0 and 255", () => {
      const values = getPerlinRectWasm(0, 0, 254, 254);
      for (const value of values) {
        expect(value).to.lte(255);
        expect(value).to.gte(0);
      }
    });
  });

  describe("keccak256", () => {
    before(async () => {
      await InitializeKeccak();
    });

    it("should compute the same hash as soliditySha3 for a string", () => {
      const msg = "hello";
      expect("0x" + keccak256(msg)).to.eq(soliditySha3(msg));
      expect(keccak256(msg)).to.eq("1c8aff950685c2ed4bc3174f3472287b56d9517b9c948127319a09a7a36deac8");
    });

    it("should compute the same hash as soliditySha3 for abi.encodePacked params", () => {
      const x = 10;
      const y = 11;
      const scale = 12;
      const seed = 13;

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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
