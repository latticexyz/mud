// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { IERC165 } from "./IERC165.sol";
import { IWorldErrors } from "./IWorldErrors.sol";

/**
 * @title Interface Validator
 * @notice Utility function to validate interface support on a given contract using ERC-165.
 * @dev This function uses the ERC-165 standard's `supportsInterface` to check if a given contract supports a specific interface.
 */

/**
 * @notice Checks if a given contract at `contractAddress` supports the interface with ID `interfaceId`.
 * @dev Uses the ERC-165 `supportsInterface` method. If the contract doesn't support the interface or doesn't implement ERC-165, the function will revert with a relevant error message.
 * @param contractAddress The address of the contract to check.
 * @param interfaceId The interface ID to verify.
 */
function requireInterface(address contractAddress, bytes4 interfaceId) view {
  try IERC165(contractAddress).supportsInterface(interfaceId) returns (bool supported) {
    if (!supported) {
      revert IWorldErrors.World_InterfaceNotSupported(contractAddress, interfaceId);
    }
  } catch {
    revert IWorldErrors.World_InterfaceNotSupported(contractAddress, interfaceId);
  }
}
