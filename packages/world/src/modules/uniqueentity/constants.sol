// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { ResourceId } from "../../WorldResourceId.sol";
import { RESOURCE_TABLE, RESOURCE_SYSTEM } from "../../worldResourceTypes.sol";

bytes14 constant NAMESPACE = bytes14("uniqueEntity");
bytes16 constant MODULE_NAME = bytes16("uniqueEntity");
bytes16 constant SYSTEM_NAME = bytes16("system");
bytes16 constant TABLE_NAME = bytes16("table");

ResourceId constant TABLE_ID = ResourceId.wrap(bytes32(abi.encodePacked(NAMESPACE, TABLE_NAME, RESOURCE_TABLE)));
ResourceId constant SYSTEM_ID = ResourceId.wrap((bytes32(abi.encodePacked(NAMESPACE, SYSTEM_NAME, RESOURCE_SYSTEM))));
