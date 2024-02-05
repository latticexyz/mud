// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

/**
 * @title World Factory Interface
 * @dev This interface defines the contract responsible for deploying and keeping track
 * of World contract instances.
 */
interface IWorldFactory {
  /**
   * @dev Emitted when a new World contract is deployed.
   * @param newContract The address of the newly deployed World contract.
   */
  event WorldDeployed(address indexed newContract);

  /**
   * @notice Deploys a new World contract.
   * @dev The deployment of the World contract will result in the `WorldDeployed` event being emitted.
   * @return worldAddress The address of the newly deployed World contract.
   */
  function deployWorld(bytes memory salt) external returns (address worldAddress);
}
