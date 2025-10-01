import { describe, expect, it } from "vitest";
import { contractToInterface } from "./contractToInterface";

const source = `
import { Data } from "./lib.sol";

contract World {
  constructor() {}
  fallback(bytes calldata input) external payable returns (bytes memory) {}
  receive() external payable {}
  function update(Data.Entity[] memory entities, uint delta) public returns (bool) {}
  function visible() view external {}
  function invisible() internal {}
  error UpdateError(uint entityId);
}
`;

describe("contractToInterface", () => {
  it("extracts public functions and errors from contract", () => {
    const { functions, errors, symbolImports } = contractToInterface(source, "World");
    expect(functions).toStrictEqual([
      {
        name: "update",
        parameters: ["Data.Entity[] memory entities", "uint delta"],
        returnParameters: ["bool"],
        stateMutability: "",
      },
      {
        name: "visible",
        parameters: [],
        returnParameters: [],
        stateMutability: "view",
      },
    ]);
    expect(errors).toStrictEqual([
      {
        name: "UpdateError",
        parameters: ["uint entityId"],
      },
    ]);
    expect(symbolImports).toStrictEqual([
      {
        path: "./lib.sol",
        symbol: "Data",
      },
    ]);
  });
});
