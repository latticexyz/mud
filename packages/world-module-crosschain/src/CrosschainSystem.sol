// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { EncodedLengths } from "@latticexyz/store/src/EncodedLengths.sol";
import { StoreCore } from "@latticexyz/store/src/StoreCore.sol";

import { System } from "@latticexyz/world/src/System.sol";
import { ROOT_NAMESPACE } from "@latticexyz/world/src/constants.sol";
import { WorldResourceIdLib } from "@latticexyz/world/src/WorldResourceId.sol";

import { Identifier, ICrossL2Inbox } from "@contracts-bedrock/L2/interfaces/ICrossL2Inbox.sol";
import { Predeploys } from "@contracts-bedrock/libraries/Predeploys.sol";
import { CrosschainRecordMetadata, CrosschainRecordMetadataData } from "./codegen/tables/CrosschainRecordMetadata.sol";

contract CrosschainSystem is System {
  // TODO: rename errors and events
  error WrongWorld();
  error NotCrosschainRead();
  error MoreRecentRecordExists();

  event World_CrosschainRead(
    ResourceId indexed tableId,
    bytes32[] keyTuple,
    bytes staticData,
    EncodedLengths encodedLengths,
    bytes dynamicData
  );

  function crosschainRead(ResourceId tableId, bytes32[] calldata keyTuple) external {
    (bytes memory staticData, EncodedLengths encodedLengths, bytes memory dynamicData) = StoreCore.getRecord(
      tableId,
      keyTuple
    );

    emit World_CrosschainRead(tableId, keyTuple, staticData, encodedLengths, dynamicData);
  }

  function crosschainWrite(Identifier calldata identifier, bytes calldata _crosschainRead) external {
    if (identifier.origin != address(this)) revert WrongWorld();

    ICrossL2Inbox(Predeploys.CROSS_L2_INBOX).validateMessage(identifier, keccak256(_crosschainRead));

    (bytes32 selector, ResourceId tableId) = abi.decode(_crosschainRead[:64], (bytes32, ResourceId));
    if (selector != World_CrosschainRead.selector) revert NotCrosschainRead();

    // TODO: check tableId resource type?

    (bytes32[] memory keyTuple, bytes memory staticData, EncodedLengths encodedLengths, bytes memory dynamicData) = abi
      .decode(_crosschainRead[64:], (bytes32[], bytes, EncodedLengths, bytes));

    bytes32 recordId = keccak256(abi.encode(tableId, keyTuple));

    uint256 timestamp = CrosschainRecordMetadata.getTimestamp(recordId);

    // TODO: improve validation, maybe split metadata by chainId?
    if (identifier.timestamp < timestamp) {
      revert MoreRecentRecordExists();
    }

    CrosschainRecordMetadata.set(
      recordId,
      CrosschainRecordMetadataData({
        blockNumber: identifier.blockNumber,
        logIndex: identifier.logIndex,
        timestamp: identifier.timestamp,
        chainId: identifier.chainId
      })
    );

    StoreCore.setRecord(tableId, keyTuple, staticData, encodedLengths, dynamicData);
  }
}
