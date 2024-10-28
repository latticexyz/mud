// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { RESOURCE_TABLE, RESOURCE_OFFCHAIN_TABLE } from "@latticexyz/store/src/storeResourceTypes.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";

import { Context } from "./Context.sol";

abstract contract StoreConsumer {
  function getStore() public view returns (address) {
    return StoreSwitch.getStoreAddress();
  }

  function _encodeResourceId(bytes2 typeId, bytes16 name) internal view virtual returns (ResourceId);

  function _encodeTableId(bytes16 name) internal view returns (ResourceId) {
    return _encodeResourceId(RESOURCE_TABLE, name);
  }

  function _encodeOffchainTableId(bytes16 name) internal view returns (ResourceId) {
    return _encodeResourceId(RESOURCE_OFFCHAIN_TABLE, name);
  }
}
