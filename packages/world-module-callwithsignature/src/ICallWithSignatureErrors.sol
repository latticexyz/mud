// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

interface ICallWithSignatureErrors {
  /**
   * @dev Mismatched signature.
   */
  error InvalidSignature();
}
