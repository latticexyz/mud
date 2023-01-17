// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

interface IStore {
  // note: the preimage of the tuple of keys used to index is part of the event, so it can be used by indexers
  event StoreUpdate(bytes32 table, bytes32[] key, uint8 schemaIndex, bytes[] data);
}
