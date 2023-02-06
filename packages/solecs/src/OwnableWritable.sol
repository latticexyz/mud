// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IOwnableWritable } from "./interfaces/IOwnableWritable.sol";

import { Ownable } from "./Ownable.sol";
import { OwnableWritableStorage } from "./OwnableWritableStorage.sol";

/**
 * Ownable with authorized writers
 */
abstract contract OwnableWritable is IOwnableWritable, Ownable {
  error OwnableWritable__NotWriter();

  /** Whether given operator has write access */
  function writeAccess(address operator) public view virtual returns (bool) {
    return OwnableWritableStorage.layout().writeAccess[operator] || operator == owner();
  }

  /** Revert if caller does not have write access to this component */
  modifier onlyWriter() {
    if (!writeAccess(msg.sender)) {
      revert OwnableWritable__NotWriter();
    }
    _;
  }

  /**
   * Grant write access to the given address.
   * Can only be called by the owner.
   * @param writer Address to grant write access to.
   */
  function authorizeWriter(address writer) public virtual onlyOwner {
    OwnableWritableStorage.layout().writeAccess[writer] = true;
  }

  /**
   * Revoke write access from the given address.
   * Can only be called by the owner.
   * @param writer Address to revoke write access.
   */
  function unauthorizeWriter(address writer) public virtual onlyOwner {
    delete OwnableWritableStorage.layout().writeAccess[writer];
  }
}
