// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";

// Implements EIP712 signatures https://eips.ethereum.org/EIPS/eip-712

bytes32 constant DELEGATION_TYPEHASH = keccak256(
  "Delegation(address delegatee,bytes32 delegationControlId,bytes initCallData,uint256 nonce)"
);

function getSignedMessageHash(
  address delegatee,
  ResourceId delegationControlId,
  bytes memory initCallData,
  uint256 nonce,
  address worldAddress
) view returns (bytes32) {
  bytes32 domainSeperator = keccak256(
    abi.encode(keccak256("EIP712Domain(uint256 chainId,address verifyingContract)"), block.chainid, worldAddress)
  );

  return
    keccak256(
      abi.encodePacked(
        "\x19\x01",
        domainSeperator,
        keccak256(abi.encode(DELEGATION_TYPEHASH, delegatee, delegationControlId, keccak256(initCallData), nonce))
      )
    );
}
