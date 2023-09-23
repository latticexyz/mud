// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { Test } from "forge-std/Test.sol";
import { GasReporter } from "@latticexyz/gas-report/src/GasReporter.sol";
import { Mixed, MixedData, MixedTableId } from "../src/codegen/index.sol";
import { StoreCore } from "../src/StoreCore.sol";
import { StoreMock } from "../test/StoreMock.sol";
import { FieldLayout } from "../src/FieldLayout.sol";
import { Schema } from "../src/Schema.sol";
import { PackedCounter } from "../src/PackedCounter.sol";

contract MixedTest is Test, GasReporter, StoreMock {
  MixedData private testMixed;

  function setUp() public {
    Mixed._register();

    bytes32 key = keccak256("defaultkey");
    uint32[] memory a32 = new uint32[](2);
    a32[0] = 3;
    a32[1] = 4;
    string
      memory s = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas dapibus velit a ante porta pulvinar. Integer semper quam erat, nec pellentesque nunc feugiat sed. Pellentesque aliquam quam sapien, rutrum egestas sapien vestibulum quis. Suspendisse nisi leo, tincidunt at mauris tincidunt, dapibus luctus dui. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Donec eget finibus odio. Maecenas velit diam, fermentum et consectetur at, posuere vitae magna.";
    Mixed.set({ key: key, u32: 1, u128: 2, a32: a32, s: s });
  }

  function testRegisterAndGetFieldLayout() public {
    FieldLayout registeredFieldLayout = StoreCore.getFieldLayout(MixedTableId);
    FieldLayout declaredFieldLayout = Mixed.getFieldLayout();

    assertEq(keccak256(abi.encode(registeredFieldLayout)), keccak256(abi.encode(declaredFieldLayout)));
  }

  function testRegisterAndGetSchema() public {
    Schema registeredSchema = StoreCore.getValueSchema(MixedTableId);
    Schema declaredSchema = Mixed.getValueSchema();

    assertEq(keccak256(abi.encode(registeredSchema)), keccak256(abi.encode(declaredSchema)));
  }

  function testSetGetDeleteExternal() public {
    bytes32 key = keccak256("somekey");

    uint32[] memory a32 = new uint32[](2);
    a32[0] = 3;
    a32[1] = 4;
    string memory s = "some string";

    startGasReport("set record in Mixed (external, cold)");
    Mixed.set({ key: key, u32: 1, u128: 2, a32: a32, s: s });
    endGasReport();

    startGasReport("get record from Mixed (external, warm)");
    MixedData memory mixed = Mixed.get(key);
    endGasReport();

    assertEq(mixed.u32, 1);
    assertEq(mixed.u128, 2);
    assertEq(mixed.a32[0], 3);
    assertEq(mixed.a32[1], 4);
    assertEq(mixed.s, s);

    startGasReport("delete record from Mixed (external, warm)");
    Mixed.deleteRecord(key);
    endGasReport();
  }

  function testSetGetDeleteInternal() public {
    bytes32 key = keccak256("somekey");

    uint32[] memory a32 = new uint32[](2);
    a32[0] = 3;
    a32[1] = 4;
    string memory s = "some string";

    startGasReport("set record in Mixed (internal, cold)");
    Mixed._set({ key: key, u32: 1, u128: 2, a32: a32, s: s });
    endGasReport();

    startGasReport("get record from Mixed (internal, warm)");
    MixedData memory mixed = Mixed._get(key);
    endGasReport();

    assertEq(mixed.u32, 1);
    assertEq(mixed.u128, 2);
    assertEq(mixed.a32[0], 3);
    assertEq(mixed.a32[1], 4);
    assertEq(mixed.s, s);

    startGasReport("delete record from Mixed (internal, warm)");
    Mixed._deleteRecord(key);
    endGasReport();
  }

  function testDeleteExternalCold() public {
    bytes32 key = keccak256("defaultkey");

    startGasReport("delete record from Mixed (external, cold)");
    Mixed.deleteRecord(key);
    endGasReport();
  }

  function testDeleteInternalCold() public {
    bytes32 key = keccak256("defaultkey");

    startGasReport("delete record from Mixed (internal, cold)");
    Mixed._deleteRecord(key);
    endGasReport();
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

    (bytes memory staticData, PackedCounter encodedLengths, bytes memory dynamicData) = Mixed.encode(1, 2, a32, s);
    assertEq(staticData, hex"0000000100000000000000000000000000000002");
    assertEq(encodedLengths.unwrap(), hex"000000000000000000000000000000000000000b000000000800000000000013");
    assertEq(dynamicData, hex"0000000300000004736f6d6520737472696e67");
  }
}
