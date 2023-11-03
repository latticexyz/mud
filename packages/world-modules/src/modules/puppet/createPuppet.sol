// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { IBaseWorld } from "@latticexyz/world/src/codegen/interfaces/IBaseWorld.sol";
import { WorldResourceIdInstance } from "@latticexyz/world/src/WorldResourceId.sol";
import { PUPPET_DELEGATION, PUPPET_FACTORY } from "./constants.sol";
import { PuppetDelegationControl } from "./PuppetDelegationControl.sol";
import { Puppet } from "./Puppet.sol";
import { PuppetFactorySystem } from "./PuppetFactorySystem.sol";

using WorldResourceIdInstance for ResourceId;

/**
 * This free function can be used to create a puppet and register it with the puppet delegation control.
 * Since it is inlined in the caller's context, the calls originate from the caller's address.
 */
function createPuppet(IBaseWorld world, ResourceId systemId) returns (address puppet) {
  puppet = abi.decode(
    world.call(PUPPET_FACTORY, abi.encodeCall(PuppetFactorySystem.createPuppet, (systemId))),
    (address)
  );
  world.registerNamespaceDelegation(systemId.getNamespaceId(), PUPPET_DELEGATION, new bytes(0));
}
