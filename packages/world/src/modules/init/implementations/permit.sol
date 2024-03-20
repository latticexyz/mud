// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { MessageHashUtils } from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";

// Inspired by ERC20Permit https://eips.ethereum.org/EIPS/eip-2612

function getSignedMessageHash(
  address delegatee,
  ResourceId delegationControlId,
  bytes memory initCallData,
  uint256 nonce
) pure returns (bytes32) {
  return
    MessageHashUtils.toEthSignedMessageHash(
      keccak256(abi.encodePacked(delegatee, delegationControlId, initCallData, nonce))
    );
}
