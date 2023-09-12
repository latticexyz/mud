// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { ERC165 } from "./interfaces/ERC165.sol";
import { IWorldErrors } from "./interfaces/IWorldErrors.sol";

/**
 * Require the given contract to support the given interface by calling the ERC-165 supportsInterface function.
 */
function requireInterface(address contractAddress, bytes4 interfaceId) view {
  try ERC165(contractAddress).supportsInterface(interfaceId) returns (bool supported) {
    if (!supported) {
      revert IWorldErrors.InterfaceNotSupported(contractAddress, interfaceId);
    }
  } catch {
    revert IWorldErrors.InterfaceNotSupported(contractAddress, interfaceId);
  }
}
