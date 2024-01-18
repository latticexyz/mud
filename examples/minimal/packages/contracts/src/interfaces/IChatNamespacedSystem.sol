// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

interface IChatNamespacedSystem {
  function namespace_sendMessage(string memory message) external;
}
