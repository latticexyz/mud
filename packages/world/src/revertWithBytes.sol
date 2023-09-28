// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

/**
 * @title Raw Bytes Reverter
 * @notice Utility function to revert transactions with raw bytes.
 * @dev This can be especially useful when reverting with a message obtained from a low-level call or a pre-encoded error.
 */

/**
 * @notice Reverts the transaction using the provided raw bytes as the revert reason.
 * @dev Uses assembly to perform the revert operation with the raw bytes.
 * @param reason The raw bytes revert reason.
 */
function revertWithBytes(bytes memory reason) pure {
  assembly {
    // reason+32 is a pointer to the error message, mload(reason) is the length of the error message
    revert(add(reason, 0x20), mload(reason))
  }
}
