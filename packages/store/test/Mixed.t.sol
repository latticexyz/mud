// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "forge-std/Test.sol";
import { SchemaType } from "@latticexyz/schema-type/src/solidity/SchemaType.sol";
import { Mixed, MixedData, MixedTableId } from "../src/tables/Mixed.sol";
import { StoreCore } from "../src/StoreCore.sol";
import { StoreView } from "../src/StoreView.sol";
import { Schema } from "../src/Schema.sol";

contract MixedTest is Test, StoreView {
  MixedData private testMixed;

  function testRegisterAndGetSchema() public {
    // !gasreport register Mixed schema
    Mixed.registerSchema();

    Schema registeredSchema = StoreCore.getSchema(MixedTableId);
    Schema declaredSchema = Mixed.getSchema();

    assertEq(keccak256(abi.encode(registeredSchema)), keccak256(abi.encode(declaredSchema)));
  }

  function testSetAndGet() public {
    Mixed.registerSchema();
    bytes32 key = keccak256("somekey");

    uint32[] memory a32 = new uint32[](2);
    a32[0] = 3;
    a32[1] = 4;
    string memory s = "some string";

    // !gasreport set record in Mixed
    Mixed.set({ key: key, u32: 1, u128: 2, a32: a32, s: s });

    // !gasreport get record from Mixed
    MixedData memory mixed = Mixed.get(key);

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

    // !gasreport store Mixed struct in storage (native solidity)
    testMixed = mixed;
  }
}
