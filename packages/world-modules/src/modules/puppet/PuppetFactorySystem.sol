// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { System } from "@latticexyz/world/src/System.sol";
import { IBaseWorld } from "@latticexyz/world/src/codegen/interfaces/IBaseWorld.sol";

import { AccessControlLib } from "../../utils/AccessControlLib.sol";

import { PuppetRegistry } from "./tables/PuppetRegistry.sol";
import { Puppet } from "./Puppet.sol";
import { PUPPET_TABLE_ID } from "./constants.sol";

contract PuppetFactorySystem is System {
  function createPuppet(ResourceId systemId) public returns (address puppet) {
    // Only the owner of a system can create a puppet for it
    AccessControlLib.requireOwner(systemId, _msgSender());

    // Deploy a new puppet contract
    puppet = address(new Puppet(IBaseWorld(_world()), systemId));

    // Register the puppet
    PuppetRegistry.set(PUPPET_TABLE_ID, systemId, puppet);
  }
}
