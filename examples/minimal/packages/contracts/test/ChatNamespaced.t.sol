// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "forge-std/Test.sol";
import { MudV2Test } from "@latticexyz/std-contracts/src/test/MudV2Test.t.sol";
import { getKeysWithValue } from "@latticexyz/world/src/modules/keyswithvalue/getKeysWithValue.sol";
import { StoreCore } from "@latticexyz/store/src/StoreCore.sol";

import { IWorld } from "../src/codegen/world/IWorld.sol";
import { MessageTable, MessageTableTableId } from "../src/codegen/Tables.sol";
import { IChatNamespacedSystem } from "../src/interfaces/IChatNamespacedSystem.sol";

contract ChatNamespacedTest is MudV2Test {
  function setUp() public override {
    super.setUp();
  }

  function testEmitEphemeral() public {
    bytes32[] memory keyTuple;
    vm.expectEmit(true, true, true, true);
    emit StoreCore.StoreEphemeralRecord(MessageTableTableId, keyTuple, MessageTable.encode("test"));
    IChatNamespacedSystem(worldAddress).namespace_ChatNamespaced_sendMessage("test");
  }
}
