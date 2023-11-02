// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { RESOURCE_TABLE } from "@latticexyz/store/src/storeResourceTypes.sol";

import { WorldResourceIdLib } from "@latticexyz/world/src/WorldResourceId.sol";
import { RESOURCE_SYSTEM } from "@latticexyz/world/src/worldResourceTypes.sol";

import { ALLOWANCES_NAME, BALANCES_NAME, TOTAL_SUPPLY_NAME, METADATA_NAME, ERC20_SYSTEM_NAME } from "./constants.sol";

function _allowancesTableId(bytes14 namespace) pure returns (ResourceId) {
  return WorldResourceIdLib.encode({ typeId: RESOURCE_TABLE, namespace: namespace, name: ALLOWANCES_NAME });
}

function _balancesTableId(bytes14 namespace) pure returns (ResourceId) {
  return WorldResourceIdLib.encode({ typeId: RESOURCE_TABLE, namespace: namespace, name: BALANCES_NAME });
}

function _totalSupplyTableId(bytes14 namespace) pure returns (ResourceId) {
  return WorldResourceIdLib.encode({ typeId: RESOURCE_TABLE, namespace: namespace, name: TOTAL_SUPPLY_NAME });
}

function _metadataTableId(bytes14 namespace) pure returns (ResourceId) {
  return WorldResourceIdLib.encode({ typeId: RESOURCE_TABLE, namespace: namespace, name: METADATA_NAME });
}

function _erc20SystemId(bytes14 namespace) pure returns (ResourceId) {
  return WorldResourceIdLib.encode({ typeId: RESOURCE_SYSTEM, namespace: namespace, name: ERC20_SYSTEM_NAME });
}
