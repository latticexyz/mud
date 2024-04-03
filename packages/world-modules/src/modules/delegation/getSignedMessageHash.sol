// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";

bytes32 constant CALL_TYPEHASH = keccak256("Call(address delegator,bytes32 systemId,bytes callData,uint256 nonce)");

/**
 * @notice Generate the message hash for a given delegation signature.
 * For EIP712 signatures https://eips.ethereum.org/EIPS/eip-712
 * @dev We include the signer address to prevent generating a signature that recovers to a random address that didn't sign the message.
 * @param delegator The address on whose behalf the system is called.
 * @param systemId The ID of the system to be called.
 * @param callData The ABI data for the system call.
 * @param nonce The nonce of the delegator
 * @param worldAddress The world address
 * @return Return the message hash.
 */
function getSignedMessageHash(
  address delegator,
  ResourceId systemId,
  bytes memory callData,
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
        keccak256(abi.encode(CALL_TYPEHASH, delegator, systemId, keccak256(callData), nonce))
      )
    );
}
