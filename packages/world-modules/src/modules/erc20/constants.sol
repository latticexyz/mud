// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { RESOURCE_SYSTEM } from "@latticexyz/world/src/worldResourceTypes.sol";

bytes16 constant MODULE_NAME = "erc20";
bytes14 constant ERC20_NAMESPACE = "erc20";

ResourceId constant ERC20_SYSTEM_ID = ResourceId.wrap(
  bytes32(abi.encodePacked(RESOURCE_SYSTEM, ERC20_NAMESPACE, "ERC20System"))
);
