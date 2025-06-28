// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { RESOURCE_TABLE } from "@latticexyz/store/src/storeResourceTypes.sol";
import { ResourceId, WorldResourceIdLib } from "@latticexyz/world/src/WorldResourceId.sol";

library ModuleConstants {
  bytes14 internal constant NAMESPACE = "erc20-module";
  bytes16 internal constant REGISTRY_TABLE_NAME = "ERC20Registry";

  function namespaceId() internal pure returns (ResourceId) {
    return WorldResourceIdLib.encodeNamespace(NAMESPACE);
  }

  function registryTableId() internal pure returns (ResourceId) {
    return WorldResourceIdLib.encode(RESOURCE_TABLE, NAMESPACE, REGISTRY_TABLE_NAME);
  }
}

library ERC20TableNames {
  bytes16 internal constant TOTAL_SUPPLY = "TotalSupply";

  bytes16 internal constant BALANCES = "Balances";

  bytes16 internal constant ALLOWANCES = "Allowances";

  bytes16 internal constant METADATA = "Metadata";
}

library PausableTableNames {
  bytes16 internal constant PAUSED = "Paused";
}
