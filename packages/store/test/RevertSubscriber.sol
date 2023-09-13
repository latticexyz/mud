// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { FieldLayout } from "../src/FieldLayout.sol";
import { StoreHook } from "../src/StoreHook.sol";

contract RevertSubscriber is StoreHook {
  function onBeforeSetRecord(bytes32, bytes32[] memory, bytes memory, FieldLayout) public pure {
    revert("onBeforeSetRecord");
  }

  function onAfterSetRecord(bytes32, bytes32[] memory, bytes memory, FieldLayout) public pure {
    revert("onAfterSetRecord");
  }

  function onBeforeSetField(bytes32, bytes32[] memory, uint8, bytes memory, FieldLayout) public pure {
    revert("onBeforeSetField");
  }

  function onAfterSetField(bytes32, bytes32[] memory, uint8, bytes memory, FieldLayout) public pure {
    revert("onAfterSetField");
  }

  function onBeforeDeleteRecord(bytes32, bytes32[] memory, FieldLayout) public pure {
    revert("onBeforeDeleteRecord");
  }

  function onAfterDeleteRecord(bytes32, bytes32[] memory, FieldLayout) public pure {
    revert("onAfterDeleteRecord");
  }
}
