// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";

import { System } from "../../../../System.sol";
import { SystemCall } from "../../../../SystemCall.sol";
import { CallWithSignatureNonces } from "../../../../codegen/tables/CallWithSignatureNonces.sol";
import { IWorldErrors } from "../../../../IWorldErrors.sol";
import { LimitedCallContext } from "../../LimitedCallContext.sol";
import { createDelegation } from "../createDelegation.sol";
import { getSignedMessageHash } from "./getSignedMessageHash.sol";
import { ECDSA } from "./ECDSA.sol";
import { validateCallWithSignature } from "./validateCallWithSignature.sol";

contract CallWithSignatureSystem is System, IWorldErrors, LimitedCallContext {
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
  ) public payable onlyDelegatecall returns (bytes memory) {
    validateCallWithSignature(signer, systemId, callData, signature);

    CallWithSignatureNonces._set(signer, CallWithSignatureNonces._get(signer) + 1);

    return SystemCall.callWithHooksOrRevert(signer, systemId, callData, _msgValue());
  }
}
