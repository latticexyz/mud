// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { System } from "@latticexyz/world/src/System.sol";
import { CounterTable } from "../codegen/Tables.sol";
import { BytesStruct, StringStruct } from "./structs.sol";

contract StructSystem is System {
  function staticArrayBytesStruct(BytesStruct[1] memory) public {}

  function dynamicArrayBytesStruct(BytesStruct[] memory) public {}

  function staticArrayStringStruct(StringStruct[1] memory) public {}

  function dynamicArrayStringStruct(StringStruct[] memory) public {}
}
