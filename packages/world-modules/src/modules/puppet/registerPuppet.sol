// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { IBaseWorld } from "@latticexyz/world/src/codegen/interfaces/IBaseWorld.sol";
import { WorldResourceIdInstance } from "@latticexyz/world/src/WorldResourceId.sol";
import { PUPPET_DELEGATION } from "./constants.sol";
import { PuppetDelegationControl } from "./PuppetDelegationControl.sol";

using WorldResourceIdInstance for ResourceId;

function registerPuppet(IBaseWorld world, ResourceId systemId, address puppet) {
  world.registerNamespaceDelegation(
    systemId.getNamespaceId(),
    PUPPET_DELEGATION,
    abi.encodeCall(PuppetDelegationControl.initDelegation, (systemId, address(puppet)))
  );
}
