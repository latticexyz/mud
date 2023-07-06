// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Test } from "forge-std/Test.sol";
import { GasReporter } from "@latticexyz/std-contracts/src/test/GasReporter.sol";
import { mudstore_Vector2, mudstore_Vector2Data, mudstore_Vector2TableId } from "../src/codegen/Tables.sol";
import { StoreCore } from "../src/StoreCore.sol";
import { StoreReadWithStubs } from "../src/StoreReadWithStubs.sol";
import { Schema } from "../src/Schema.sol";

contract Vector2Test is Test, GasReporter, StoreReadWithStubs {
  function testRegisterAndGetSchema() public {
    startGasReport("register Vector2 schema");
    mudstore_Vector2.registerSchema();
    endGasReport();

    Schema registeredSchema = StoreCore.getSchema(mudstore_Vector2TableId);
    Schema declaredSchema = mudstore_Vector2.getSchema();

    assertEq(keccak256(abi.encode(registeredSchema)), keccak256(abi.encode(declaredSchema)));
  }

  function testSetAndGet() public {
    mudstore_Vector2.registerSchema();
    bytes32 key = keccak256("somekey");

    startGasReport("set Vector2 record");
    mudstore_Vector2.set({ key: key, x: 1, y: 2 });
    endGasReport();

    startGasReport("get Vector2 record");
    mudstore_Vector2Data memory vector = mudstore_Vector2.get(key);
    endGasReport();

    assertEq(vector.x, 1);
    assertEq(vector.y, 2);
  }
}
