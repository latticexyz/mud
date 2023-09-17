// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Test } from "forge-std/Test.sol";
import { GasReporter } from "@latticexyz/gas-report/src/GasReporter.sol";
import { Mixed, MixedData, MixedTableId } from "../src/codegen/index.sol";
import { StoreCore } from "../src/StoreCore.sol";
import { StoreMock } from "../test/StoreMock.sol";
import { FieldLayout } from "../src/FieldLayout.sol";
import { Schema } from "../src/Schema.sol";

contract MixedTest is Test, GasReporter, StoreMock {
  MixedData private testMixed;

  function testRegisterAndGetFieldLayout() public {
    startGasReport("register Mixed table");
    Mixed.register();
    endGasReport();

    FieldLayout registeredFieldLayout = StoreCore.getFieldLayout(MixedTableId);
    FieldLayout declaredFieldLayout = Mixed.getFieldLayout();

    assertEq(keccak256(abi.encode(registeredFieldLayout)), keccak256(abi.encode(declaredFieldLayout)));
  }

  function testRegisterAndGetSchema() public {
    Mixed.register();

    Schema registeredSchema = StoreCore.getValueSchema(MixedTableId);
    Schema declaredSchema = Mixed.getValueSchema();

    assertEq(keccak256(abi.encode(registeredSchema)), keccak256(abi.encode(declaredSchema)));
  }

  function testSetAndGet() public {
    Mixed.register();
    bytes32 key = keccak256("somekey");

    uint32[] memory a32 = new uint32[](2);
    a32[0] = 3;
    a32[1] = 4;
    string memory s = "some string";

    startGasReport("set record in Mixed");
    Mixed.set({ key: key, u32: 1, u128: 2, a32: a32, s: s });
    endGasReport();

    startGasReport("get record from Mixed");
    MixedData memory mixed = Mixed.get(key);
    endGasReport();

    assertEq(mixed.u32, 1);
    assertEq(mixed.u128, 2);
    assertEq(mixed.a32[0], 3);
    assertEq(mixed.a32[1], 4);
    assertEq(mixed.s, s);
  }

  function testCompareSolidity() public {
    MixedData memory mixed = MixedData({ u32: 1, u128: 2, a32: new uint32[](2), s: "some string" });
    mixed.a32[0] = 3;
    mixed.a32[1] = 4;

    startGasReport("store Mixed struct in storage (native solidity)");
    testMixed = mixed;
    endGasReport();
  }

  function testEncode() public {
    uint32[] memory a32 = new uint32[](2);
    a32[0] = 3;
    a32[1] = 4;
    string memory s = "some string";

    assertEq(
      Mixed.encode(1, 2, a32, s),
      hex"0000000100000000000000000000000000000002000000000000000000000000000000000000000b0000000008000000000000130000000300000004736f6d6520737472696e67"
    );
  }
}
