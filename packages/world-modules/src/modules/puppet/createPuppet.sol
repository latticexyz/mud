// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { IWorldRegistrationSystem } from "@latticexyz/world/src/codegen/interfaces/IWorldRegistrationSystem.sol";
import { WorldResourceIdInstance } from "@latticexyz/world/src/WorldResourceId.sol";
import { PUPPET_DELEGATION, PUPPET_FACTORY } from "./constants.sol";
import { PuppetDelegationControl } from "./PuppetDelegationControl.sol";
import { Puppet } from "./Puppet.sol";
import { PuppetFactorySystem } from "./PuppetFactorySystem.sol";
import { SystemSwitch } from "../../utils/SystemSwitch.sol";

using WorldResourceIdInstance for ResourceId;

/**
 * This free function can be used to create a puppet and register it with the puppet delegation control.
 * Since it is inlined in the caller's context, the calls originate from the caller's address.
 * The function expects to be called from a World context
 * (i.e. `StoreSwitch.setStoreAddress(world)` is set up in the calling contract)
 */
function createPuppet(ResourceId systemId) returns (address puppet) {
  puppet = abi.decode(
    SystemSwitch.call(PUPPET_FACTORY, abi.encodeCall(PuppetFactorySystem.createPuppet, (systemId))),
    (address)
  );
  SystemSwitch.call(
    abi.encodeCall(
      IWorldRegistrationSystem.registerNamespaceDelegation,
      (systemId.getNamespaceId(), PUPPET_DELEGATION, new bytes(0))
    )
  );
}
