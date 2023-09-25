// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { STORE_VERSION } from "./version.sol";
import { IStoreData } from "./IStore.sol";
import { StoreRead } from "./StoreRead.sol";
import { StoreCore } from "./StoreCore.sol";

abstract contract StoreData is IStoreData, StoreRead {
  constructor() {
    StoreCore.initialize();
    emit HelloStore(STORE_VERSION);
  }

  function storeVersion() public pure returns (bytes32) {
    return STORE_VERSION;
  }
}
