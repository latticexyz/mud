// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IWorldContextConsumer } from "./IWorldContextConsumer.sol";
import { ERC165 } from "./ERC165.sol";

// ERC-165 Interface ID (see https://eips.ethereum.org/EIPS/eip-165)
bytes4 constant DELEGATION_CONTROL_INTERFACE_ID = IDelegationControl.verify.selector ^
  IWorldContextConsumer._msgSender.selector ^
  IWorldContextConsumer._msgValue.selector ^
  IWorldContextConsumer._world.selector ^
  ERC165.supportsInterface.selector;

interface IDelegationControl is IWorldContextConsumer {
  function verify(address delegator, bytes32 systemId, bytes calldata funcSelectorAndArgs) external returns (bool);
}
