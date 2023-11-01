// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { RESOURCE_TABLE } from "@latticexyz/store/src/storeResourceTypes.sol";
import { RESOURCE_SYSTEM, RESOURCE_NAMESPACE } from "@latticexyz/world/src/worldResourceTypes.sol";

bytes16 constant MODULE_NAME = "erc721-puppet";
bytes14 constant MODULE_NAMESPACE = "erc721-puppet";
ResourceId constant MODULE_NAMESPACE_ID = ResourceId.wrap(
  bytes32(abi.encodePacked(RESOURCE_NAMESPACE, MODULE_NAMESPACE))
);

bytes16 constant TOKEN_URI_NAME = "TokenURI";
bytes16 constant BALANCES_NAME = "Balances";
bytes16 constant METADATA_NAME = "Metadata";
bytes16 constant OPERATOR_APPROVAL_NAME = "OperatorApproval";
bytes16 constant TOKEN_APPROVAL_NAME = "TokenApproval";
bytes16 constant OWNERS_NAME = "Owners";

bytes16 constant ERC721_SYSTEM_NAME = "ERC721System";

ResourceId constant ERC721_REGISTRY_TABLE_ID = ResourceId.wrap(
  bytes32(abi.encodePacked(RESOURCE_TABLE, MODULE_NAMESPACE, bytes16("ERC721Registry")))
);
