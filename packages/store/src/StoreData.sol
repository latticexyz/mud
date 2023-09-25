// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { STORE_VERSION } from "./version.sol";
import { IStore, IStoreData } from "./IStore.sol";
import { StoreRead } from "./StoreRead.sol";
import { StoreCore } from "./StoreCore.sol";
import { FieldLayout } from "./FieldLayout.sol";
import { Schema } from "./Schema.sol";
import { PackedCounter } from "./PackedCounter.sol";
import { ResourceId } from "./ResourceId.sol";

abstract contract StoreData is IStoreData, StoreRead {
  constructor() {
    emit HelloStore(STORE_VERSION);
  }

  function storeVersion() public pure returns (bytes32) {
    return STORE_VERSION;
  }
}
