// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { DelegationControl } from "@latticexyz/world/src/DelegationControl.sol";
import { ResourceId } from "@latticexyz/world/src/WorldResourceId.sol";
import { AccessControlLib } from "../../utils/AccessControlLib.sol";
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

  /**
   * Initialize a delegation by storing the mapping from systemId to puppet
   */
  function initDelegation(ResourceId systemId, address puppet) public {
    // Require the caller to be the owner of the system
    AccessControlLib.requireOwner(systemId, _msgSender());
    PuppetRegistry.set(PUPPET_TABLE_ID, systemId, puppet);
  }
}
