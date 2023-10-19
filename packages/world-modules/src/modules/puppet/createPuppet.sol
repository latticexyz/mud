// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { IBaseWorld } from "@latticexyz/world/src/codegen/interfaces/IBaseWorld.sol";
import { WorldResourceIdInstance } from "@latticexyz/world/src/WorldResourceId.sol";
import { PUPPET_DELEGATION } from "./constants.sol";
import { PuppetDelegationControl } from "./PuppetDelegationControl.sol";
import { Puppet } from "./Puppet.sol";

using WorldResourceIdInstance for ResourceId;

function createPuppet(IBaseWorld world, ResourceId systemId) returns (address puppet) {
  puppet = address(new Puppet(world, systemId));
  world.registerNamespaceDelegation(
    systemId.getNamespaceId(),
    PUPPET_DELEGATION,
    abi.encodeCall(PuppetDelegationControl.initDelegation, (systemId, puppet))
  );
}
