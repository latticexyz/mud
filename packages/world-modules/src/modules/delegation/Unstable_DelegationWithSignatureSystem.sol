// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { System } from "@latticexyz/world/src/System.sol";
import { SystemCall } from "@latticexyz/world/src/SystemCall.sol";
import { createDelegation } from "@latticexyz/world/src/modules/init/implementations/createDelegation.sol";

import { UserDelegationNonces } from "./tables/UserDelegationNonces.sol";
import { getSignedMessageHash } from "./getSignedMessageHash.sol";
import { ECDSA } from "./ECDSA.sol";

contract Unstable_DelegationWithSignatureSystem is System {
  /**
   * @dev Mismatched signature.
   */
  error InvalidSignature(address signer);

  /**
   * @notice Calls a system with a given system ID using the given signature.
   * @param delegator The address on whose behalf the system is called.
   * @param systemId The ID of the system to be called.
   * @param callData The ABI data for the system call.
   * @param signature The EIP712 signature.
   * @return Return data from the system call.
   */
  function callWithSignature(
    address delegator,
    ResourceId systemId,
    bytes memory callData,
    bytes memory signature
  ) external payable returns (bytes memory) {
    uint256 nonce = UserDelegationNonces.get(delegator);
    bytes32 hash = getSignedMessageHash(delegator, systemId, callData, nonce, _world());

    // If the message was not signed by the delegator or is invalid, revert
    address signer = ECDSA.recover(hash, signature);
    if (signer != delegator) {
      revert InvalidSignature(signer);
    }

    UserDelegationNonces.set(delegator, nonce + 1);

    return SystemCall.callWithHooksOrRevert(delegator, systemId, callData, _msgValue());
  }
}
