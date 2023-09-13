// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IERC165, ERC165_INTERFACE_ID } from "./IERC165.sol";

// ERC-165 Interface ID (see https://eips.ethereum.org/EIPS/eip-165)
bytes4 constant WORLD_CONTEXT_CONSUMER_INTERFACE_ID = IWorldContextConsumer._msgSender.selector ^
  IWorldContextConsumer._msgValue.selector ^
  IWorldContextConsumer._world.selector ^
  ERC165_INTERFACE_ID;

interface IWorldContextConsumer is IERC165 {
  function _msgSender() external view returns (address);

  function _msgValue() external view returns (uint256);

  function _world() external view returns (address);
}
