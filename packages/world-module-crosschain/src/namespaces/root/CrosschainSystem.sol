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
  error RecordDoesNotExist();
  error RecordAlreadyExists();
  error RecordBridgedToADifferentChain();

  event World_CrosschainRecord(
    ResourceId indexed tableId,
    bytes32[] keyTuple,
    bytes staticData,
    EncodedLengths encodedLengths,
    bytes dynamicData,
    // 0 means broadcast so it can be consumed by any world
    uint256 toChainId
  );

  function create(ResourceId tableId, bytes32[] memory keyTuple) external {
    AccessControl._requireAccess(tableId.getNamespaceId(), _msgSender());

    bytes32 keyHash = keccak256(abi.encode(keyTuple));
    uint256 blockNumber = CrosschainRecord.getBlockNumber(block.chainid, tableId, keyHash);
    if (blockNumber != 0) {
      revert RecordAlreadyExists();
    }

    CrosschainRecordData memory data = CrosschainRecordData({ blockNumber: block.number, timestamp: block.timestamp });

    CrosschainRecord.set(block.chainid, tableId, keyHash, data);
  }

  function bridge(ResourceId tableId, bytes32[] memory keyTuple, uint256 targetChain) external {
    AccessControl._requireAccess(tableId.getNamespaceId(), _msgSender());

    bytes32 keyHash = keccak256(abi.encode(keyTuple));
    uint256 blockNumber = CrosschainRecord.getBlockNumber(block.chainid, tableId, keyHash);
    if (blockNumber == 0) {
      revert RecordDoesNotExist();
    }

    // We don't own this record anymore
    CrosschainRecord.deleteRecord(block.chainid, tableId, keyHash);

    (bytes memory staticData, EncodedLengths encodedLengths, bytes memory dynamicData) = StoreCore.getRecord(
      tableId,
      keyTuple
    );

    emit World_CrosschainRecord(tableId, keyTuple, staticData, encodedLengths, dynamicData, targetChain);
  }

  // Anyone can call this method so other chains can consume the record data
  function crosschainRead(ResourceId tableId, bytes32[] calldata keyTuple) external {
    (bytes memory staticData, EncodedLengths encodedLengths, bytes memory dynamicData) = StoreCore.getRecord(
      tableId,
      keyTuple
    );

    emit World_CrosschainRecord(tableId, keyTuple, staticData, encodedLengths, dynamicData, 0);
  }

  // Anyone can call this to verify a crosschain record and store it
  function crosschainWrite(Identifier calldata identifier, bytes calldata _crosschainRead) external {
    if (identifier.origin != address(this)) revert WrongWorld();

    (bytes32 selector, ResourceId tableId) = abi.decode(_crosschainRead[:64], (bytes32, ResourceId));
    if (selector != World_CrosschainRecord.selector) revert NotCrosschainRecord();

    ICrossL2Inbox(Predeploys.CROSS_L2_INBOX).validateMessage(identifier, keccak256(_crosschainRead));

    // TODO: check tableId resource type?

    (
      bytes32[] memory keyTuple,
      bytes memory staticData,
      EncodedLengths encodedLengths,
      bytes memory dynamicData,
      uint256 toChainId
    ) = abi.decode(_crosschainRead[64:], (bytes32[], bytes, EncodedLengths, bytes, uint256));

    bytes32 keyHash = keccak256(abi.encode(keyTuple));

    // If we own the record, then writes are not allowed as it would override it
    uint256 ownedTimestamp = CrosschainRecord.getTimestamp(block.chainid, tableId, keyHash);
    if (ownedTimestamp > 0) {
      revert RecordAlreadyExists();
    }

    // If toChainId == 0 it means it was broadcasted and not bridged
    if (toChainId == 0) {
      if (identifier.timestamp < CrosschainRecord.getTimestamp(0, tableId, keyHash)) {
        revert MoreRecentRecordExists();
      }
    } else if (toChainId != block.chainid) {
      revert RecordBridgedToADifferentChain();
    }

    CrosschainRecordData memory data = CrosschainRecordData({
      blockNumber: identifier.blockNumber,
      timestamp: identifier.timestamp
    });

    CrosschainRecord.set(toChainId, tableId, keyHash, data);

    StoreCore.setRecord(tableId, keyTuple, staticData, encodedLengths, dynamicData);
  }
}
