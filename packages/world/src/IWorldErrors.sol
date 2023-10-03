// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";

/**
 * @title World Errors Interface
 * @dev This interface contains custom error types for the World contract. These errors provide
 * more informative messages for certain operations within the World contract.
 */
interface IWorldErrors {
  /**
   * @notice Raised when trying to initialize an already initialized World.
   */
  error World_AlreadyInitialized();

  /**
   * @notice Raised when trying to register a resource that already exists.
   * @param resourceId The ID of the resource.
   * @param resourceIdString The string representation of the resource ID.
   */
  error World_ResourceAlreadyExists(ResourceId resourceId, string resourceIdString);

  /**
   * @notice Raised when the specified resource is not found.
   * @param resourceId The ID of the resource.
   * @param resourceIdString The string representation of the resource ID.
   */
  error World_ResourceNotFound(ResourceId resourceId, string resourceIdString);

  /**
   * @notice Raised when a user tries to access a resource they don't have permission for.
   * @param resource The resource's identifier.
   * @param caller The address of the user trying to access the resource.
   */
  error World_AccessDenied(string resource, address caller);

  /**
   * @notice Raised when an invalid resource ID is provided.
   * @param resourceId The ID of the resource.
   * @param resourceIdString The string representation of the resource ID.
   */
  error World_InvalidResourceId(ResourceId resourceId, string resourceIdString);

  /**
   * @notice Raised when trying to register a system that already exists.
   * @param system The address of the system.
   */
  error World_SystemAlreadyExists(address system);

  /**
   * @notice Raised when trying to register a function selector that already exists.
   * @param functionSelector The function selector in question.
   */
  error World_FunctionSelectorAlreadyExists(bytes4 functionSelector);

  /**
   * @notice Raised when the specified function selector is not found.
   * @param functionSelector The function selector in question.
   */
  error World_FunctionSelectorNotFound(bytes4 functionSelector);

  /**
   * @notice Raised when the specified delegation is not found.
   * @param delegator The address of the delegator.
   * @param delegatee The address of the delegatee.
   */
  error World_DelegationNotFound(address delegator, address delegatee);

  /**
   * @notice Raised when trying to create an unlimited delegation in a context where it is not allowed,
   * e.g. when registering a namespace fallback delegation.
   */
  error World_UnlimitedDelegationNotAllowed();

  /**
   * @notice Raised when there's an insufficient balance for a particular operation.
   * @param balance The current balance.
   * @param amount The amount needed.
   */
  error World_InsufficientBalance(uint256 balance, uint256 amount);

  /**
   * @notice Raised when the specified interface is not supported by the contract.
   * @param contractAddress The address of the contract in question.
   * @param interfaceId The ID of the interface.
   */
  error World_InterfaceNotSupported(address contractAddress, bytes4 interfaceId);

  /**
   * @notice Raised when an invalid resource type is provided.
   * @param expected The expected resource type.
   * @param resourceId The ID of the resource.
   * @param resourceIdString The string representation of the resource ID.
   */
  error World_InvalidResourceType(bytes2 expected, ResourceId resourceId, string resourceIdString);

  /**
   * @notice Raised when the World is calling itself via an external call.
   * @param functionSelector The function selector of the disallowed callback.
   */
  error World_CallbackNotAllowed(bytes4 functionSelector);
}
