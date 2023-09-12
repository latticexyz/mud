// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { WorldContextConsumer } from "./WorldContext.sol";
import { IModule, MODULE_INTERFACE_ID } from "./interfaces/IModule.sol";
import { IERC165, ERC165_INTERFACE_ID } from "./interfaces/IERC165.sol";

abstract contract Module is IModule, WorldContextConsumer {
  // ERC-165 supportsInterface (see https://eips.ethereum.org/EIPS/eip-165)
  function supportsInterface(
    bytes4 interfaceId
  ) public pure virtual override(IERC165, WorldContextConsumer) returns (bool) {
    return interfaceId == MODULE_INTERFACE_ID || interfaceId == ERC165_INTERFACE_ID;
  }
}
