// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { InitializeKeccak, keccak256 } from "keccak-wasm";
import { expect } from "chai";
import web3Utils from "web3-utils";
import { encodePackedU32 } from "../../ts";

const { soliditySha3 } = web3Utils;

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
