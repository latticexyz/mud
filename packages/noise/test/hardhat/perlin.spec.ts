import { expect } from "chai";
import hardhat from "hardhat";
import fs from "fs";
import { fetchAndCompileWasmModule } from "../../ts/utils";

const { ethers } = hardhat;

const SCALE = 7;
const PRECISION = 10;

describe("Perlin", () => {
  let getPerlinWasm: (x: number, y: number) => number = () => 0;
  let getPerlinSol: (x: number, y: number) => Promise<number> = async () => 0;

  before(async () => {
    // Solidity setup
    const PerlinSol = await ethers.getContractFactory("Perlin");
    const deployedPerlinNoise = await PerlinSol.deploy();
    getPerlinSol = async (x: number, y: number) =>
      (await deployedPerlinNoise.noise(x, y, 0, SCALE, PRECISION)) / 2 ** PRECISION;

    // AssemblyScript setup
    // In esm environments the compiled function can be imported directly
    // but hardhat does not support esm
    // import { perlin } from "../build/release";
    const wasmModule = await fetchAndCompileWasmModule(new URL("../../build/release.wasm", import.meta.url));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const wasmInstance: any = await WebAssembly.instantiate(wasmModule, {
      env: {
        abort: (e: string) => {
          throw new Error("abort called in wasm perlin: " + e);
        },
      },
    });

    getPerlinWasm = (x: number, y: number) =>
      Math.floor(wasmInstance.exports.perlin(x, y, 0, SCALE) * 2 ** PRECISION) / 2 ** PRECISION;
  });

  describe("getPerlinSol", () => {
    it("should return perlin noise", async () => {
      expect(await getPerlinSol(10, 10)).to.eq(0.748046875);
    });

    it("should support negative coordinates", async () => {
      expect(await getPerlinSol(-10, 10)).to.eq(0.2421875);
    });

    it("should generate json for 16x16 rect", async () => {
      const values: number[] = [];
      for (let y = -8; y < 8; y++) {
        for (let x = -8; x < 8; x++) {
          values.push(Number(await getPerlinSol(x, y)));
        }
      }
      fs.writeFileSync("web/sol_perlin.json", JSON.stringify([...values]));
    });
  });

  describe("getPerlinWasm", () => {
    it("should return perlin noise", () => {
      expect(getPerlinWasm(10, 10)).to.eq(0.748046875);
    });

    it("should support negative coordinates", () => {
      expect(getPerlinWasm(-10, 10)).to.eq(0.2421875);
    });

    it("should the same perlin values as getPerlinSol", async () => {
      for (let x = -5; x < 5; x++) {
        for (let y = -5; y < 5; y++) {
          const solPerlin = await getPerlinSol(x, y);
          const wasmPerlin = getPerlinWasm(x, y);
          expect(solPerlin).to.eq(wasmPerlin);
        }
      }
    });

    it("should compute 256x256 perlin values in < 16ms", () => {
      const start = Date.now();
      for (let x = -128; x < 128; x++) {
        for (let y = -128; y < 128; y++) {
          getPerlinWasm(x, y);
        }
      }
      const end = Date.now();
      const duration = end - start;
      expect(duration).to.be.lte(16);
      console.log("Time to compute 256x256 perlin values:", duration);
    });

    it("should return values between 0 and 1", () => {
      for (let x = -8; x < 8; x++) {
        for (let y = -8; y < 8; y++) {
          const p = getPerlinWasm(x, y);
          expect(p).to.lte(1);
          expect(p).to.gte(0);
        }
      }
    });

    it("should generate json for 512x512 rect", async () => {
      const values: number[] = [];
      for (let y = -256; y < 256; y++) {
        for (let x = -256; x < 256; x++) {
          values.push(getPerlinWasm(x, y));
        }
      }
      fs.writeFileSync("web/wasm_perlin.json", JSON.stringify([...values]));
    });
  });
});
