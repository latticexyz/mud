// SPDX-License-Identifier: MIT
// Adapted from OpenZeppelin Contracts [access/Ownable.sol](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/f989fff93168606c726bc5e831ef50dd6e543f45/contracts/access/Ownable.sol)
pragma solidity >=0.8.24;

import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";

import { Owner } from "./codegen/tables/Owner.sol";
import { StoreConsumer } from "./StoreConsumer.sol";
import { Context } from "./Context.sol";
import { OwnableTableNames } from "./Constants.sol";

/**
 * @dev Contract module which provides a basic access control mechanism, where
 * there is an account (an owner) that can be granted exclusive access to
 * specific functions.
 *
 * The initial owner is set to the address provided by the deployer. This can
 * later be changed with {transferOwnership}.
 *
 * This module is used through inheritance. It will make available the modifier
 * `onlyOwner`, which can be applied to your functions to restrict their use to
 * the owner.
 */
abstract contract Ownable is Context, StoreConsumer {
  ResourceId internal immutable ownerId;

  /**
   * @dev The caller account is not authorized to perform an operation.
   */
  error OwnableUnauthorizedAccount(address account);

  /**
   * @dev The owner is not a valid owner account. (eg. `address(0)`)
   */
  error OwnableInvalidOwner(address owner);

  event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

  /**
   * @dev Initializes the contract setting the address provided by the deployer as the initial owner.
   */
  constructor(address initialOwner) {
    if (initialOwner == address(0)) {
      revert OwnableInvalidOwner(address(0));
    }

    ownerId = _encodeTableId(OwnableTableNames.OWNER);

    // Register table
    Owner.register(ownerId);

    _transferOwnership(initialOwner);
  }

  /**
   * @dev Throws if called by any account other than the owner.
   */
  modifier onlyOwner() {
    _checkOwner();
    _;
  }

  /**
   * @dev Returns the address of the current owner.
   */
  function owner() public view virtual returns (address) {
    return Owner.get(ownerId);
  }

  /**
   * @dev Throws if the sender is not the owner.
   */
  function _checkOwner() internal view virtual {
    if (owner() != _msgSender()) {
      revert OwnableUnauthorizedAccount(_msgSender());
    }
  }

  /**
   * @dev Leaves the contract without owner. It will not be possible to call
   * `onlyOwner` functions. Can only be called by the current owner.
   *
   * NOTE: Renouncing ownership will leave the contract without an owner,
   * thereby disabling any functionality that is only available to the owner.
   */
  function renounceOwnership() public virtual onlyOwner {
    _transferOwnership(address(0));
  }

  /**
   * @dev Transfers ownership of the contract to a new account (`newOwner`).
   * Can only be called by the current owner.
   */
  function transferOwnership(address newOwner) public virtual onlyOwner {
    if (newOwner == address(0)) {
      revert OwnableInvalidOwner(address(0));
    }
    _transferOwnership(newOwner);
  }

  /**
   * @dev Transfers ownership of the contract to a new account (`newOwner`).
   * Internal function without access restriction.
   */
  function _transferOwnership(address newOwner) internal virtual {
    address oldOwner = owner();
    Owner.set(ownerId, newOwner);
    emit OwnershipTransferred(oldOwner, newOwner);
  }
}
