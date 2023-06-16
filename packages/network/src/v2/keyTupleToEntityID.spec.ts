import { keyTupleToEntityID } from "./keyTupleToEntityID";

describe("keyTupleToEntityID", () => {
  it("should have an empty key for empty key tuple (singleton table)", () => {
    expect(keyTupleToEntityID([])).toBe("0x000000000000000000000000000000000000000000000000000000000000060d");
  });

  it("should pad addresses", () => {
    expect(keyTupleToEntityID(["0xc0035952298729c7086058EaA13921626e22C070"])).toBe(
      "0x000000000000000000000000c0035952298729c7086058EaA13921626e22C070"
    );
  });

  it("convert number key to padded entity ID", () => {
    expect(keyTupleToEntityID([1])).toBe("0x0000000000000000000000000000000000000000000000000000000000000001");
  });

  it("concat composite keys to a string concatenated with :", () => {
    expect(keyTupleToEntityID([1, 2])).toBe(
      "0x0000000000000000000000000000000000000000000000000000000000000001:0x0000000000000000000000000000000000000000000000000000000000000002"
    );
  });
});
