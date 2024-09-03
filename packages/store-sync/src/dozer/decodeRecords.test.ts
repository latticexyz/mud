import { describe, expect, it } from "vitest";
import { decodeRecords } from "./decodeRecords";

describe("decodeRecord", () => {
  const schema = {
    address: { type: "address", internalType: "address" },
    uint256: { type: "uint256", internalType: "uint256" },
    uint32: { type: "uint32", internalType: "uint32" },
    bool: { type: "bool", internalType: "bool" },
    bytes: { type: "bytes", internalType: "bytes" },
    string: { type: "string", internalType: "string" },
    uint32Arr: { type: "uint32[]", internalType: "uint32[]" },
  } as const;

  it("decodes dozer record", () => {
    const dozerHeader = Object.keys(schema);

    const dozerRecord = [
      "0x0000000000000000000000000000000000000000",
      "1234",
      "1234",
      true,
      "0x1234",
      "hello world",
      ["1234", "5678"],
    ];
    const decodedRecord = {
      address: "0x0000000000000000000000000000000000000000",
      uint256: 1234n,
      uint32: 1234,
      bool: true,
      bytes: "0x1234",
      string: "hello world",
      uint32Arr: [1234, 5678],
    };

    const decoded = decodeRecords({ schema, records: [dozerHeader, dozerRecord] });
    expect(decoded).toStrictEqual([decodedRecord]);
  });
});
