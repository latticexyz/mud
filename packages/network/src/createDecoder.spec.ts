import { createDecoder, flattenValue } from "./createDecoder";
import { createEncoder } from "./createEncoder";
import { BigNumber, utils } from "ethers";
import { ContractSchemaValue } from "./types";

describe("Decoder", () => {
  it("decodes the component value", () => {
    const decoder = createDecoder<{ first: string; second: number; third: string[]; fourth: boolean }>(
      ["first", "second", "third", "fourth"],
      [
        ContractSchemaValue.UINT256,
        ContractSchemaValue.INT32,
        ContractSchemaValue.UINT256_ARRAY,
        ContractSchemaValue.BOOL,
      ]
    );
    const encoded = utils.defaultAbiCoder.encode(["uint256", "int32", "uint256[]", "bool"], [1, 2, [3, 4], true]);
    expect(decoder(encoded)).toEqual({ first: "0x01", second: 2, third: ["0x03", "0x04"], fourth: true });
  });

  it("can encode and decode a component value", () => {
    const propNames = ["first", "second", "third", "fourth"] as ["first", "second", "third", "fourth"];
    const types = [
      ContractSchemaValue.UINT256,
      ContractSchemaValue.INT32,
      ContractSchemaValue.UINT256_ARRAY,
      ContractSchemaValue.BOOL,
    ];
    const decoder = createDecoder<{ first: string; second: number; third: string[]; fourth: boolean }>(
      propNames,
      types
    );
    const value = { first: "0x01", second: 2, third: ["0x03", "0x04"], fourth: true };
    const encoded = createEncoder<typeof value>(propNames, types)(value);
    expect(decoder(encoded)).toEqual(value);
  });

  describe("flattenValue", () => {
    it("flattens BigNumberish values into the appropriate js type", () => {
      expect(flattenValue(true, ContractSchemaValue.BOOL)).toBe(true);
      expect(flattenValue(BigNumber.from(1), ContractSchemaValue.INT8)).toBe(1);
      expect(flattenValue(BigNumber.from(1), ContractSchemaValue.INT64)).toBe("0x01");
      expect(flattenValue(BigNumber.from(1), ContractSchemaValue.STRING)).toBe("1");
      expect(flattenValue([BigNumber.from(1), BigNumber.from(2)], ContractSchemaValue.STRING_ARRAY)).toEqual([
        "1",
        "2",
      ]);
    });
  });
});
