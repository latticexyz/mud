// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import "forge-std/Test.sol";
import { MudTest } from "@latticexyz/world/test/MudTest.t.sol";
import { getKeysWithValue } from "@latticexyz/world-modules/src/modules/keyswithvalue/getKeysWithValue.sol";
import { StoreCore } from "@latticexyz/store/src/StoreCore.sol";

import { IWorld } from "../src/codegen/world/IWorld.sol";
import { MessageTable, MessageTableTableId } from "../src/codegen/index.sol";
import { IChatNamespacedSystem } from "../src/interfaces/IChatNamespacedSystem.sol";

contract ChatNamespacedTest is MudTest {
  function testOffchain() public {
    bytes32[] memory keyTuple;
    string memory value = "test";
    vm.expectEmit(true, true, true, true);
    emit StoreCore.Store_SetRecord(
      MessageTableTableId,
      keyTuple,
      new bytes(0),
      MessageTable.encodeLengths(value),
      MessageTable.encodeDynamic(value)
    );
    IChatNamespacedSystem(worldAddress).namespace_ChatNamespaced_sendMessage(value);
  }
}
