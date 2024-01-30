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
   * @notice Returns the total count of deployed World contracts per account.
   * @param account The account.
   * @return The total number of World contracts deployed by this factory per account.
   */
  function worldCounts(address account) external view returns (uint256);

  /**
   * @notice Deploys a new World contract.
   * @dev The deployment of the World contract will result in the `WorldDeployed` event being emitted.
   * @return worldAddress The address of the newly deployed World contract.
   */
  function deployWorld() external returns (address worldAddress);
}
