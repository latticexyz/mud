// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IWorldContextConsumer } from "./IWorldContextConsumer.sol";
import { ERC165 } from "./ERC165.sol";

bytes4 constant DELEGATION_CONTROL_INTERFACE_ID = IWorldContextConsumer._msgSender.selector ^
  // IWorldContextConsumer._msgValue.selector ^  // TODO: add this once the other PR is merged
  IWorldContextConsumer._world.selector ^
  IDelegationControl.verify.selector ^
  ERC165.supportsInterface.selector;

interface IDelegationControl is IWorldContextConsumer {
  function verify(address delegator, bytes32 systemId, bytes calldata funcSelectorAndArgs) external returns (bool);
}
