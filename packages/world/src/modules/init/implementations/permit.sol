// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";

bytes32 constant DELEGATION_TYPEHASH = keccak256(
  "Delegation(address delegatee,bytes32 delegationControlId,bytes initCallData,uint256 nonce)"
);

bytes32 constant DOMAIN_SEPARATOR = keccak256(
  abi.encode(
    keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
    keccak256("App Name"),
    keccak256("1"),
    1,
    0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC
  )
);

function getSignedMessageHash(
  address delegatee,
  ResourceId delegationControlId,
  bytes memory initCallData,
  uint256 nonce
) pure returns (bytes32) {
  return
    keccak256(
      abi.encodePacked(
        "\x19\x01",
        DOMAIN_SEPARATOR,
        keccak256(abi.encode(DELEGATION_TYPEHASH, delegatee, delegationControlId, keccak256(initCallData), nonce))
      )
    );
}
