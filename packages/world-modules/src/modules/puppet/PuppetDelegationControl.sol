// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { DelegationControl } from "@latticexyz/world/src/DelegationControl.sol";
import { ResourceId } from "@latticexyz/world/src/WorldResourceId.sol";
import { PuppetRegistry } from "./tables/PuppetRegistry.sol";
import { PUPPET_TABLE_ID } from "./constants.sol";

contract PuppetDelegationControl is DelegationControl {
  /**
   * Verify a delegation by checking if the resourceId maps to the caller as puppet
   */
  function verify(address, ResourceId systemId, bytes memory) public view returns (bool) {
    address puppet = _msgSender();
    return PuppetRegistry.get(PUPPET_TABLE_ID, systemId) == puppet;
  }
}
