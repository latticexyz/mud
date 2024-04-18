// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { RESOURCE_TABLE } from "@latticexyz/store/src/storeResourceTypes.sol";

import { WorldResourceIdLib } from "@latticexyz/world/src/WorldResourceId.sol";
import { RESOURCE_SYSTEM } from "@latticexyz/world/src/worldResourceTypes.sol";

import { ERC721_SYSTEM_NAME, BALANCES_NAME, METADATA_NAME, OPERATOR_APPROVAL_NAME, OWNERS_NAME, TOKEN_APPROVAL_NAME, TOKEN_URI_NAME } from "./constants.sol";

function _balancesTableId(bytes14 namespace) pure returns (ResourceId) {
  return WorldResourceIdLib.encode({ typeId: RESOURCE_TABLE, namespace: namespace, name: BALANCES_NAME });
}

function _metadataTableId(bytes14 namespace) pure returns (ResourceId) {
  return WorldResourceIdLib.encode({ typeId: RESOURCE_TABLE, namespace: namespace, name: METADATA_NAME });
}

function _operatorApprovalTableId(bytes14 namespace) pure returns (ResourceId) {
  return WorldResourceIdLib.encode({ typeId: RESOURCE_TABLE, namespace: namespace, name: OPERATOR_APPROVAL_NAME });
}

function _ownersTableId(bytes14 namespace) pure returns (ResourceId) {
  return WorldResourceIdLib.encode({ typeId: RESOURCE_TABLE, namespace: namespace, name: OWNERS_NAME });
}

function _tokenApprovalTableId(bytes14 namespace) pure returns (ResourceId) {
  return WorldResourceIdLib.encode({ typeId: RESOURCE_TABLE, namespace: namespace, name: TOKEN_APPROVAL_NAME });
}

function _tokenUriTableId(bytes14 namespace) pure returns (ResourceId) {
  return WorldResourceIdLib.encode({ typeId: RESOURCE_TABLE, namespace: namespace, name: TOKEN_URI_NAME });
}

function _erc721SystemId(bytes14 namespace) pure returns (ResourceId) {
  return WorldResourceIdLib.encode({ typeId: RESOURCE_SYSTEM, namespace: namespace, name: ERC721_SYSTEM_NAME });
}

function uintToString(uint256 value) pure returns (string memory) {
  // Base case
  if (value == 0) {
    return "0";
  }
  // Temporarily store the value to calculate the number of digits
  uint256 temp = value;
  uint256 digits;
  while (temp != 0) {
    digits++;
    temp /= 10;
  }
  // Allocate enough memory to store the string
  bytes memory buffer = new bytes(digits);
  while (value != 0) {
    digits -= 1;
    buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
    value /= 10;
  }
  return string(buffer);
}
