// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IStore, IStoreHook } from "./IStore.sol";
import { StoreCore } from "./StoreCore.sol";
import { Schema } from "./Schema.sol";
import { StoreData } from "./StoreData.sol";

// Not abstract, so that it can be used as a base contract for testing and wherever write access is not needed
contract StoreView is IStore, StoreData {
  error StoreView_NotImplemented();

  /**
   * Not implemented in StoreView
   */
  function registerSchema(bytes32, Schema, Schema) public virtual {
    revert StoreView_NotImplemented();
  }

  /**
   * Not implemented in StoreView
   */
  function setMetadata(bytes32, string calldata, string[] calldata) public virtual {
    revert StoreView_NotImplemented();
  }

  /**
   * Not implemented in StoreView
   */
  function setRecord(bytes32, bytes32[] calldata, bytes calldata) public virtual {
    revert StoreView_NotImplemented();
  }

  /**
   * Not implemented in StoreView
   */
  function setField(bytes32, bytes32[] calldata, uint8, bytes calldata) public virtual {
    revert StoreView_NotImplemented();
  }

  /**
   * Not implemented in StoreView
   */
  function pushToField(bytes32, bytes32[] calldata, uint8, bytes calldata) public virtual {
    revert StoreView_NotImplemented();
  }

  /**
   * Not implemented in StoreView
   */
  function updateInField(bytes32, bytes32[] calldata, uint8, uint256, bytes calldata) public virtual {
    revert StoreView_NotImplemented();
  }

  /**
   * Not implemented in StoreView
   */
  function registerStoreHook(bytes32, IStoreHook) public virtual {
    revert StoreView_NotImplemented();
  }

  /**
   * Not implemented in StoreView
   */
  function deleteRecord(bytes32, bytes32[] calldata) public virtual {
    revert StoreView_NotImplemented();
  }
}
