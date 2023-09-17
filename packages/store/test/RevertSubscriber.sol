// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { StoreHook } from "../src/StoreHook.sol";
import { FieldLayout } from "../src/FieldLayout.sol";
import { PackedCounter } from "../src/PackedCounter.sol";

contract RevertSubscriber is StoreHook {
  function onBeforeSetRecord(
    bytes32,
    bytes32[] memory,
    bytes memory,
    PackedCounter,
    bytes memory,
    FieldLayout
  ) public pure {
    revert("onBeforeSetRecord");
  }

  function onAfterSetRecord(
    bytes32,
    bytes32[] memory,
    bytes memory,
    PackedCounter,
    bytes memory,
    FieldLayout
  ) public pure {
    revert("onAfterSetRecord");
  }

  function onBeforeSpliceStaticData(bytes32, bytes32[] calldata, uint48, uint40, bytes calldata) public pure {
    revert("onBeforeSpliceStaticData");
  }

  function onAfterSpliceStaticData(bytes32, bytes32[] calldata, uint48, uint40, bytes calldata) public pure {
    revert("onAfterSpliceStaticData");
  }

  function onBeforeSpliceDynamicData(
    bytes32,
    bytes32[] calldata,
    uint8,
    uint40,
    uint40,
    bytes calldata,
    PackedCounter
  ) public pure {
    revert("onBeforeSpliceDynamicData");
  }

  function onAfterSpliceDynamicData(
    bytes32,
    bytes32[] calldata,
    uint8,
    uint40,
    uint40,
    bytes calldata,
    PackedCounter
  ) public pure {
    revert("onAfterSpliceDynamicData");
  }

  function onBeforeDeleteRecord(bytes32, bytes32[] memory, FieldLayout) public pure {
    revert("onBeforeDeleteRecord");
  }

  function onAfterDeleteRecord(bytes32, bytes32[] memory, FieldLayout) public pure {
    revert("onAfterDeleteRecord");
  }
}
