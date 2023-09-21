// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

// TODO allow overriding namespace per-system
interface IChatNamespacedSystem {
  function namespace_ChatNamespaced_sendMessage(string memory message) external;
}
