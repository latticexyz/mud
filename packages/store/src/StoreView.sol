// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { SchemaType } from "./Types.sol";
import { IStoreHook } from "./IStore.sol";
import { StoreCore } from "./StoreCore.sol";
import { Schema } from "./Schema.sol";
import { Store } from "./Store.sol";

// Not abstract, so that it can be used as a base contract for testing and wherever write access is not needed
contract StoreView is Store {
  error StoreView_NotImplemented();

  function registerSchema(uint256, Schema) public virtual {
    revert StoreView_NotImplemented();
  }

  function setRecord(
    uint256,
    bytes32[] memory,
    bytes memory
  ) public virtual {
    revert StoreView_NotImplemented();
  }

  // Set partial data at schema index
  function setField(
    uint256,
    bytes32[] memory,
    uint8,
    bytes memory
  ) public virtual {
    revert StoreView_NotImplemented();
  }

  function registerHook(uint256, IStoreHook) public virtual {
    revert StoreView_NotImplemented();
  }

  function deleteRecord(uint256, bytes32[] memory) public virtual {
    revert StoreView_NotImplemented();
  }
}
