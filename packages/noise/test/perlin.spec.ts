import { expect } from "chai";
import fs from "fs";
import { ethers } from "hardhat";
import { perlin } from "../src/utils";
import { soliditySha3 } from "web3-utils";
import { InitializeKeccak, keccak256 } from "keccak-wasm";

function fetchAndCompileWasmModule(url: string) {
  const wasmBuffer = fs.readFileSync(url);
  return WebAssembly.compile(wasmBuffer);
}

// Seems like it's not feasible to get the existing wasm noise library to compute the same values as the existing sol perlin function.
// Since solidity comes with more restrictions (eg no floating point path available), I think the best approach would be to port
// the existing perlin implementation to WebAssembly and use this port on the client.

const SEED = 42;
const SCALE = 1;

describe("Perlin", () => {
  let getPerlinWasm: (x: number, y: number) => number = () => 0;
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
    const wasmModule = await fetchAndCompileWasmModule("build/release.wasm");
    const wasmInstance: any = await WebAssembly.instantiate(wasmModule, {
      env: {
        keccak256(input: number): string {
          console.log(keccak256(input.toString(16)));
          return "hello";
        },
        abort: function () {
          throw new Error("Abort called!");
        },
      },
    });
    getPerlinWasm = (x: number, y: number) => wasmInstance.exports.perlin(x, y, SEED, SCALE);
  });

  it.skip("should return wasm perlin noise", async () => {
    const noise = getPerlinWasm(10, 10);
    console.log("Wasm Noise:", noise);
    expect(noise).to.be.eq(0.024992456659674644);
  });

  it("should return sol perlin noise", async () => {
    expect(await getPerlinSol(10, 10)).to.eq(31);
  });

  it("should return ts perlin noise", async () => {
    expect(getPerlinTs(10, 10)).to.eq(31);
  });

  it.only("should return wasm perlin noise", () => {
    const noise = getPerlinWasm(10, 10);
    console.log("Wasm perlin");
    expect(noise).to.eq(31);
  });

  it.skip("ts and sol should return the same result", async () => {
    for (let x = 0; x < 10; x++) {
      for (let y = 0; y < 10; y++) {
        const solPerlin = await getPerlinSol(x, y);
        const tsPerlin = getPerlinTs(x, y);
        console.log("Perlin value at", x, y, ":", (tsPerlin - 32) / 64);
        expect(solPerlin).to.eq(tsPerlin);
      }
    }
  });

  it("should compute the sha256 hash", () => {
    const msg = "test";
    expect("0x" + keccak256(msg)).to.eq(soliditySha3(msg));
  });
});
