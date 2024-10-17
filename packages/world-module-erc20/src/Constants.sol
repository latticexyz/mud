// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { RESOURCE_TABLE } from "@latticexyz/store/src/storeResourceTypes.sol";
import { ResourceId, WorldResourceIdLib } from "@latticexyz/world/src/WorldResourceId.sol";

library ModuleConstants {
  bytes14 constant NAMESPACE = "erc20-module";
  bytes16 constant REGISTRY_TABLE_NAME = "ERC20_REGISTRY";

  function namespaceId() internal pure returns (ResourceId) {
    return WorldResourceIdLib.encodeNamespace(NAMESPACE);
  }

  function registryTableId() internal pure returns (ResourceId) {
    return WorldResourceIdLib.encode(RESOURCE_TABLE, NAMESPACE, REGISTRY_TABLE_NAME);
  }
}

library ERC20TableNames {
  bytes16 constant TOTAL_SUPPLY = "TOTAL_SUPPLY";

  bytes16 constant BALANCES = "BALANCES";

  bytes16 constant ALLOWANCES = "ALLOWANCES";

  bytes16 constant METADATA = "METADATA";
}

library OwnableTableNames {
  bytes16 constant OWNER = "OWNER";
}

library PausableTableNames {
  bytes16 constant PAUSED = "PAUSED";
}
