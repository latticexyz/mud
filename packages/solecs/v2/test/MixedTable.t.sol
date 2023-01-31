// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { console } from "forge-std/console.sol";
import { DSTestPlus } from "solmate/test/utils/DSTestPlus.sol";
import { MixedTable, tableId as MixedTableId, Mixed } from "../tables/MixedTable.sol";
import { StoreCore } from "../StoreCore.sol";
import { SchemaType } from "../Types.sol";
import { StoreView } from "../StoreView.sol";
import { Schema } from "../Schema.sol";

contract MixedTableTest is DSTestPlus, StoreView {
  Mixed private testMixed;

  function testRegisterAndGetSchema() public {
    uint256 gas = gasleft();
    MixedTable.registerSchema();
    gas = gas - gasleft();
    console.log("gas used: %s", gas);

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

    uint256 gas = gasleft();
    MixedTable.set({ key: key, u32: 1, u128: 2, a32: a32, s: s });
    gas = gas - gasleft();
    console.log("gas used (set, StoreCore): %s", gas);

    gas = gasleft();
    Mixed memory mixed = MixedTable.get(key);
    gas = gas - gasleft();
    console.log("gas used (get, warm): %s", gas);

    gas = gasleft();
    testMixed = mixed;
    gas = gas - gasleft();
    console.log("gas used (set, native solidity): %s", gas);

    assertEq(mixed.u32, 1);
    assertEq(mixed.u128, 2);
    assertEq(mixed.a32[0], 3);
    assertEq(mixed.a32[1], 4);
    assertEq(mixed.s, s);
  }
}
