// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;
import { ResourceId } from "@latticexyz/world/src/WorldResourceId.sol";
import { WorldContextConsumerLib } from "@latticexyz/world/src/WorldContext.sol";
import { CallWithSignatureNonces } from "./codegen/tables/CallWithSignatureNonces.sol";
import { getSignedMessageHash } from "./getSignedMessageHash.sol";
import { ECDSA } from "./ECDSA.sol";
import { ICallWithSignatureErrors } from "./ICallWithSignatureErrors.sol";
import { SignatureChecker } from "./SignatureChecker.sol";

/**
 * @notice Verifies the given system call corresponds to the given signature.
 * @param signer The address on whose behalf the system is called.
 * @param systemId The ID of the system to be called.
 * @param callData The ABI data for the system call.
 * @param signature The EIP712 signature.
 * @dev Reverts with InvalidSignature(recoveredSigner) if the signature is invalid.
 */
function validateCallWithSignature(
  address signer,
  ResourceId systemId,
  bytes memory callData,
  bytes memory signature
) view {
  uint256 nonce = CallWithSignatureNonces._get(signer);
  bytes32 hash = getSignedMessageHash(signer, systemId, callData, nonce, WorldContextConsumerLib._world());

  if (!SignatureChecker.isValidSignatureNow(signer, hash, signature)) {
    revert ICallWithSignatureErrors.InvalidSignature();
  }
}
