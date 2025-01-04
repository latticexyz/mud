// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { EncodedLengths } from "@latticexyz/store/src/EncodedLengths.sol";
import { StoreCore } from "@latticexyz/store/src/StoreCore.sol";

import { System } from "@latticexyz/world/src/System.sol";
import { ROOT_NAMESPACE } from "@latticexyz/world/src/constants.sol";
import { WorldResourceIdLib, WorldResourceIdInstance } from "@latticexyz/world/src/WorldResourceId.sol";
import { AccessControl } from "@latticexyz/world/src/AccessControl.sol";

import { Identifier, ICrossL2Inbox } from "@contracts-bedrock/L2/interfaces/ICrossL2Inbox.sol";
import { Predeploys } from "@contracts-bedrock/libraries/Predeploys.sol";

import { CrosschainRecord, CrosschainRecordData } from "../crosschain/codegen/tables/CrosschainRecord.sol";

contract CrosschainSystem is System {
  using WorldResourceIdInstance for ResourceId;

  // TODO: rename errors and events
  error WrongWorld();
  error NotCrosschainRecord();
  error MoreRecentRecordExists();
  error RecordNotOwned();
  error RecordAlreadyExists();
  error RecordBridgedToADifferentChain();
  error InvalidRecordTimestamp();

  event World_CrosschainRecord(
    ResourceId indexed tableId,
    bytes32[] keyTuple,
    bytes staticData,
    EncodedLengths encodedLengths,
    bytes dynamicData,
    uint256 toChainId
  );

  event World_CrosschainRecordRemoved(ResourceId indexed tableId, bytes32[] keyTuple);

  function create(ResourceId tableId, bytes32[] memory keyTuple) external {
    AccessControl._requireAccess(tableId.getNamespaceId(), _msgSender());

    bytes32 keyHash = keccak256(abi.encode(keyTuple));

    CrosschainRecordData memory data = CrosschainRecord.get(tableId, keyHash);
    if (data.blockNumber > 0) {
      revert RecordAlreadyExists();
    }

    data.blockNumber = block.number;
    data.timestamp = block.timestamp;
    data.owned = true;

    CrosschainRecord.set(tableId, keyHash, data);
  }

  function remove(ResourceId tableId, bytes32[] memory keyTuple) external {
    AccessControl._requireAccess(tableId.getNamespaceId(), _msgSender());

    bytes32 keyHash = keccak256(abi.encode(keyTuple));

    CrosschainRecordData memory data = CrosschainRecord.get(tableId, keyHash);
    if (!data.owned) {
      revert RecordNotOwned();
    }

    CrosschainRecord.deleteRecord(tableId, keyHash);

    emit World_CrosschainRecordRemoved(tableId, keyTuple);
  }

  function bridge(ResourceId tableId, bytes32[] memory keyTuple, uint256 targetChain) external {
    AccessControl._requireAccess(tableId.getNamespaceId(), _msgSender());

    bytes32 keyHash = keccak256(abi.encode(keyTuple));

    CrosschainRecordData memory data = CrosschainRecord.get(tableId, keyHash);

    // We can only bridge records we own
    if (!data.owned) {
      revert RecordNotOwned();
    }

    data.blockNumber = block.number;
    data.timestamp = block.timestamp;

    // We don't own this record anymore
    data.owned = false;

    CrosschainRecord.set(tableId, keyHash, data);

    (bytes memory staticData, EncodedLengths encodedLengths, bytes memory dynamicData) = StoreCore.getRecord(
      tableId,
      keyTuple
    );

    emit World_CrosschainRecord(tableId, keyTuple, staticData, encodedLengths, dynamicData, targetChain);
  }

  /**
   * @dev Anyone can call this method so other chains can consume the record data.
   * Can only be called for records owned by this world
   */
  function crosschainRead(ResourceId tableId, bytes32[] calldata keyTuple) external {
    bytes32 keyHash = keccak256(abi.encode(keyTuple));
    CrosschainRecordData memory data = CrosschainRecord.get(tableId, keyHash);

    // We can only bridge records we own
    if (!data.owned) {
      revert RecordNotOwned();
    }

    // TODO: should we update metadata?

    (bytes memory staticData, EncodedLengths encodedLengths, bytes memory dynamicData) = StoreCore.getRecord(
      tableId,
      keyTuple
    );

    // using toChainId == block.chainid means that other chains can't own this record
    emit World_CrosschainRecord(tableId, keyTuple, staticData, encodedLengths, dynamicData, block.chainid);
  }

  // TODO: add crosschainRemove or add that logic to crosschainWrite (depending on the selector)

  // Anyone can call this to verify a crosschain record and store it
  function crosschainWrite(Identifier calldata identifier, bytes calldata _crosschainRead) external {
    if (identifier.origin != address(this)) revert WrongWorld();

    // TODO: check tableId resource type?
    (bytes32 selector, ResourceId tableId) = abi.decode(_crosschainRead[:64], (bytes32, ResourceId));
    if (selector != World_CrosschainRecord.selector) revert NotCrosschainRecord();

    ICrossL2Inbox(Predeploys.CROSS_L2_INBOX).validateMessage(identifier, keccak256(_crosschainRead));

    (
      bytes32[] memory keyTuple,
      bytes memory staticData,
      EncodedLengths encodedLengths,
      bytes memory dynamicData,
      uint256 toChainId
    ) = abi.decode(_crosschainRead[64:], (bytes32[], bytes, EncodedLengths, bytes, uint256));

    bytes32 keyHash = keccak256(abi.encode(keyTuple));

    // If we own the record, then writes are not allowed as it would override it
    CrosschainRecordData memory data = CrosschainRecord.get(tableId, keyHash);
    if (data.owned) {
      revert RecordAlreadyExists();
    }

    // If toChainId == block.chainId it means it was bridged to this world
    // If toChainId != block.chainid it means it we can consume but we don't own it
    if (toChainId == block.chainid) {
      data.owned = true;
    }

    // If timestamp is in the future, revert
    // This also creates a total ordering across chains
    if (block.timestamp < identifier.timestamp) {
      revert InvalidRecordTimestamp();
    }

    if (identifier.timestamp < data.timestamp) {
      revert MoreRecentRecordExists();
    }

    data.blockNumber = identifier.blockNumber;
    data.timestamp = identifier.timestamp;

    CrosschainRecord.set(tableId, keyHash, data);

    StoreCore.setRecord(tableId, keyTuple, staticData, encodedLengths, dynamicData);
  }
}
