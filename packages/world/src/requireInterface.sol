// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { IERC165 } from "./IERC165.sol";
import { ERC165Checker } from "./ERC165Checker.sol";
import { IWorldErrors } from "./IWorldErrors.sol";

/**
 * @author MUD (https://mud.dev) by Lattice (https://lattice.xyz)
 */

/**
 * @notice Checks if a given contract at `contractAddress` supports the interface with ID `interfaceId`.
 * @dev Uses the ERC-165 `supportsInterface` method. If the contract doesn't support the interface or doesn't implement ERC-165, the function will revert with a relevant error message.
 * @param contractAddress The address of the contract to check.
 * @param interfaceId The interface ID to verify.
 */
function requireInterface(address contractAddress, bytes4 interfaceId) view {
  if (!ERC165Checker.supportsInterface(contractAddress, interfaceId)) {
    revert IWorldErrors.World_InterfaceNotSupported(contractAddress, interfaceId);
  }
}
