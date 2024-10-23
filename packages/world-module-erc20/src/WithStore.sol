// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { StoreCore } from "@latticexyz/store/src/Store.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { ResourceId, ResourceIdLib } from "@latticexyz/store/src/ResourceId.sol";
import { Context } from "./Context.sol";
import { StoreConsumer } from "./StoreConsumer.sol";

abstract contract WithStore is Context, StoreConsumer {
  constructor(address store) {
    StoreSwitch.setStoreAddress(store);

    if (store == address(this)) {
      StoreCore.registerInternalTables();
    }
  }

  function _encodeResourceId(bytes2 typeId, bytes16 name) internal view virtual override returns (ResourceId) {
    return ResourceIdLib.encode(typeId, name);
  }
}
