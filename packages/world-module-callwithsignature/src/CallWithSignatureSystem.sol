// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { System } from "@latticexyz/world/src/System.sol";
import { SystemCall } from "@latticexyz/world/src/SystemCall.sol";
import { createDelegation } from "@latticexyz/world/src/modules/init/implementations/createDelegation.sol";

import { CallWithSignatureNonces } from "./codegen/tables/CallWithSignatureNonces.sol";
import { getSignedMessageHash } from "./getSignedMessageHash.sol";
import { ECDSA } from "./ECDSA.sol";
import { validateCallWithSignature } from "./validateCallWithSignature.sol";
import { ICallWithSignatureErrors } from "./ICallWithSignatureErrors.sol";

contract CallWithSignatureSystem is System, ICallWithSignatureErrors {
  /**
   * @notice Calls a system with a given system ID using the given signature.
   * @param signer The address on whose behalf the system is called.
   * @param systemId The ID of the system to be called.
   * @param callData The ABI data for the system call.
   * @param signature The EIP712 signature.
   * @return Return data from the system call.
   */
  function callWithSignature(
    address signer,
    ResourceId systemId,
    bytes memory callData,
    bytes memory signature
  ) external payable returns (bytes memory) {
    validateCallWithSignature(signer, systemId, callData, signature);

    CallWithSignatureNonces._set(signer, CallWithSignatureNonces._get(signer) + 1);

    return SystemCall.callWithHooksOrRevert(signer, systemId, callData, _msgValue());
  }
}
