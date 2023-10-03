// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

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
   * @notice Returns the total count of deployed World contracts.
   * @return The total number of World contracts deployed by this factory.
   */
  function worldCount() external view returns (uint256);

  /**
   * @notice Deploys a new World contract.
   * @dev The deployment of the World contract will result in the `WorldDeployed` event being emitted.
   * @return worldAddress The address of the newly deployed World contract.
   */
  function deployWorld() external returns (address worldAddress);
}
