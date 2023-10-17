// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { RESOURCE_TABLE } from "@latticexyz/store/src/storeResourceTypes.sol";
import { RESOURCE_SYSTEM } from "@latticexyz/world/src/worldResourceTypes.sol";

bytes16 constant MODULE_NAME = "erc20";
bytes14 constant MODULE_NAMESPACE = "erc20";
ResourceId constant ERC20_REGISTRY_TABLE_ID = ResourceId.wrap(
  bytes32(abi.encodePacked(RESOURCE_TABLE, MODULE_NAMESPACE, bytes16("ERC20Registry")))
);
