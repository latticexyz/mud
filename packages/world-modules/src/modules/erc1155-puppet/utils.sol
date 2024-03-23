// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { RESOURCE_TABLE } from "@latticexyz/store/src/storeResourceTypes.sol";

import { WorldResourceIdLib } from "@latticexyz/world/src/WorldResourceId.sol";
import { RESOURCE_SYSTEM } from "@latticexyz/world/src/worldResourceTypes.sol";

import { TOKEN_URI_NAME, BALANCES_NAME, METADATA_NAME, OPERATOR_APPROVAL_NAME, ERC1155_SYSTEM_NAME } from "./constants.sol";

function _tokenUriTableId(bytes14 namespace) pure returns (ResourceId) {
  return WorldResourceIdLib.encode({ typeId: RESOURCE_TABLE, namespace: namespace, name: TOKEN_URI_NAME });
}

function _balancesTableId(bytes14 namespace) pure returns (ResourceId) {
  return WorldResourceIdLib.encode({ typeId: RESOURCE_TABLE, namespace: namespace, name: BALANCES_NAME });
}

function _metadataTableId(bytes14 namespace) pure returns (ResourceId) {
  return WorldResourceIdLib.encode({ typeId: RESOURCE_TABLE, namespace: namespace, name: METADATA_NAME });
}

function _operatorApprovalTableId(bytes14 namespace) pure returns (ResourceId) {
  return WorldResourceIdLib.encode({ typeId: RESOURCE_TABLE, namespace: namespace, name: OPERATOR_APPROVAL_NAME });
}

function _erc1155SystemId(bytes14 namespace) pure returns (ResourceId) {
  return WorldResourceIdLib.encode({ typeId: RESOURCE_SYSTEM, namespace: namespace, name: ERC1155_SYSTEM_NAME });
}
