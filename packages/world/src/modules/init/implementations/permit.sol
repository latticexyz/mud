// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";

// Inspired by ERC20Permit https://eips.ethereum.org/EIPS/eip-2612

function getMessageHash(
  address delegatee,
  ResourceId delegationControlId,
  bytes memory initCallData,
  uint256 nonce
) pure returns (bytes32) {
  return keccak256(abi.encode(delegatee, delegationControlId, initCallData, nonce));
}
