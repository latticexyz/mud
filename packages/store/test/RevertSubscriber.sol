// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { StoreHook } from "../src/StoreHook.sol";
import { FieldLayout } from "../src/FieldLayout.sol";
import { PackedCounter } from "../src/PackedCounter.sol";
import { ResourceId } from "../src/ResourceId.sol";

contract RevertSubscriber is StoreHook {
  function onBeforeSetRecord(
    ResourceId,
    bytes32[] memory,
    bytes memory,
    PackedCounter,
    bytes memory,
    FieldLayout
  ) public pure override {
    revert("onBeforeSetRecord");
  }

  function onAfterSetRecord(
    ResourceId,
    bytes32[] memory,
    bytes memory,
    PackedCounter,
    bytes memory,
    FieldLayout
  ) public pure override {
    revert("onAfterSetRecord");
  }

  function onBeforeSpliceStaticData(ResourceId, bytes32[] memory, uint48, uint40, bytes memory) public pure override {
    revert("onBeforeSpliceStaticData");
  }

  function onAfterSpliceStaticData(ResourceId, bytes32[] memory, uint48, uint40, bytes memory) public pure override {
    revert("onAfterSpliceStaticData");
  }

  function onBeforeSpliceDynamicData(
    ResourceId,
    bytes32[] memory,
    uint8,
    uint40,
    uint40,
    bytes memory,
    PackedCounter
  ) public pure override {
    revert("onBeforeSpliceDynamicData");
  }

  function onAfterSpliceDynamicData(
    ResourceId,
    bytes32[] memory,
    uint8,
    uint40,
    uint40,
    bytes memory,
    PackedCounter
  ) public pure override {
    revert("onAfterSpliceDynamicData");
  }

  function onBeforeDeleteRecord(ResourceId, bytes32[] memory, FieldLayout) public pure override {
    revert("onBeforeDeleteRecord");
  }

  function onAfterDeleteRecord(ResourceId, bytes32[] memory, FieldLayout) public pure override {
    revert("onAfterDeleteRecord");
  }
}
