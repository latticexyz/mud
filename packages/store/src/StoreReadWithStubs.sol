// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IStore, IStoreHook } from "./IStore.sol";
import { StoreCore } from "./StoreCore.sol";
import { Schema } from "./Schema.sol";
import { StoreRead } from "./StoreRead.sol";

/**
 * StoreReadWithStubs is not abstract and has signatures for all IStore methods,
 * but only implements read methods (inheriting from StoreRead),
 * so it can be used as IStore mock for testing or when write methods are not needed.
 */
contract StoreReadWithStubs is IStore, StoreRead {
  error StoreReadWithStubs_NotImplemented();

  /**
   * Not implemented in StoreReadWithStubs
   */
  function registerTable(bytes32, Schema, Schema, string[] calldata, string[] calldata) public virtual {
    revert StoreReadWithStubs_NotImplemented();
  }

  /**
   * Not implemented in StoreReadWithStubs
   */
  function setRecord(bytes32, bytes32[] calldata, bytes calldata, Schema) public virtual {
    revert StoreReadWithStubs_NotImplemented();
  }

  /**
   * Not implemented in StoreReadWithStubs
   */
  function setField(bytes32, bytes32[] calldata, uint8, bytes calldata, Schema) public virtual {
    revert StoreReadWithStubs_NotImplemented();
  }

  /**
   * Not implemented in StoreReadWithStubs
   */
  function pushToField(bytes32, bytes32[] calldata, uint8, bytes calldata, Schema) public virtual {
    revert StoreReadWithStubs_NotImplemented();
  }

  /**
   * Not implemented in StoreReadWithStubs
   */
  function popFromField(bytes32, bytes32[] calldata, uint8, uint256, Schema) public virtual {
    revert StoreReadWithStubs_NotImplemented();
  }

  /**
   * Not implemented in StoreReadWithStubs
   */
  function updateInField(bytes32, bytes32[] calldata, uint8, uint256, bytes calldata, Schema) public virtual {
    revert StoreReadWithStubs_NotImplemented();
  }

  /**
   * Not implemented in StoreReadWithStubs
   */
  function registerStoreHook(bytes32, IStoreHook) public virtual {
    revert StoreReadWithStubs_NotImplemented();
  }

  /**
   * Not implemented in StoreReadWithStubs
   */
  function deleteRecord(bytes32, bytes32[] calldata, Schema) public virtual {
    revert StoreReadWithStubs_NotImplemented();
  }

  /**
   * Not implemented in StoreReadWithStubs
   */
  function emitEphemeralRecord(bytes32, bytes32[] calldata, bytes calldata, Schema) public virtual {
    revert StoreReadWithStubs_NotImplemented();
  }
}
