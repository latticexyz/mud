// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "forge-std/Test.sol";
import { MixedTable, tableId as MixedTableId, Mixed } from "../tables/MixedTable.sol";
import { StoreCore } from "../StoreCore.sol";
import { SchemaType } from "../Types.sol";
import { StoreView } from "../StoreView.sol";
import { Schema } from "../Schema.sol";

contract MixedTableTest is Test, StoreView {
  Mixed private testMixed;

  function testRegisterAndGetSchema() public {
    // !gasreport register MixedTable schema
    MixedTable.registerSchema();

    Schema registeredSchema = StoreCore.getSchema(MixedTableId);
    Schema declaredSchema = MixedTable.getSchema();

    assertEq(keccak256(abi.encode(registeredSchema)), keccak256(abi.encode(declaredSchema)));
  }

  function testSetAndGet() public {
    MixedTable.registerSchema();
    bytes32 key = keccak256("somekey");

    uint32[] memory a32 = new uint32[](2);
    a32[0] = 3;
    a32[1] = 4;
    string memory s = "some string";

    // !gasreport set record in MixedTable
    MixedTable.set({ key: key, u32: 1, u128: 2, a32: a32, s: s });

    // !gasreport get record from MixedTable
    Mixed memory mixed = MixedTable.get(key);

    assertEq(mixed.u32, 1);
    assertEq(mixed.u128, 2);
    assertEq(mixed.a32[0], 3);
    assertEq(mixed.a32[1], 4);
    assertEq(mixed.s, s);
  }

  function testCompareSolidity() public {
    Mixed memory mixed = Mixed({ u32: 1, u128: 2, a32: new uint32[](2), s: "some string" });
    mixed.a32[0] = 3;
    mixed.a32[1] = 4;

    // !gasreport store Mixed struct in storage (native solidity)
    testMixed = mixed;
  }
}
