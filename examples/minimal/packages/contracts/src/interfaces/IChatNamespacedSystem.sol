// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

interface IChatNamespacedSystem {
  function namespace__sendMessage(string memory message) external;
}
