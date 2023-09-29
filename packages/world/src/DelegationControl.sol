// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { WorldContextConsumer } from "./WorldContext.sol";
import { IDelegationControl, DELEGATION_CONTROL_INTERFACE_ID } from "./IDelegationControl.sol";
import { WORLD_CONTEXT_CONSUMER_INTERFACE_ID } from "./IWorldContextConsumer.sol";
import { IERC165, ERC165_INTERFACE_ID } from "./IERC165.sol";

abstract contract DelegationControl is WorldContextConsumer, IDelegationControl {
  function supportsInterface(
    bytes4 interfaceId
  ) public pure virtual override(IERC165, WorldContextConsumer) returns (bool) {
    return
      interfaceId == DELEGATION_CONTROL_INTERFACE_ID ||
      interfaceId == WORLD_CONTEXT_CONSUMER_INTERFACE_ID ||
      interfaceId == ERC165_INTERFACE_ID;
  }
}
