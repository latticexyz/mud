// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { RESOURCE_TABLE } from "@latticexyz/store/src/storeResourceTypes.sol";
import { RESOURCE_SYSTEM, RESOURCE_NAMESPACE } from "@latticexyz/world/src/worldResourceTypes.sol";

bytes16 constant MODULE_NAME = "erc20-puppet";
bytes14 constant MODULE_NAMESPACE = "erc20-puppet";
ResourceId constant MODULE_NAMESPACE_ID = ResourceId.wrap(
  bytes32(abi.encodePacked(RESOURCE_NAMESPACE, MODULE_NAMESPACE))
);

bytes16 constant ALLOWANCES_NAME = "Allowances";
bytes16 constant BALANCES_NAME = "Balances";
bytes16 constant TOTAL_SUPPLY_NAME = "TotalSupply";
bytes16 constant METADATA_NAME = "Metadata";
bytes16 constant ERC20_SYSTEM_NAME = "ERC20System";

ResourceId constant ERC20_REGISTRY_TABLE_ID = ResourceId.wrap(
  bytes32(abi.encodePacked(RESOURCE_TABLE, MODULE_NAMESPACE, bytes16("ERC20Registry")))
);
