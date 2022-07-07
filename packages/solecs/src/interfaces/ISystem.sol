// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

interface ISystem {
  // View function to check whether the system can be executed with the provided arguments.
  // If the function does not revert, the requirements are fulfilled.
  // The returned bytes can be used by the execute function to avoid redundant computation.
  function requirement(bytes memory arguments) external view returns (bytes memory);

  // Function to execute the system. Should use the requirement function internally.
  function execute(bytes memory arguments) external;
}
