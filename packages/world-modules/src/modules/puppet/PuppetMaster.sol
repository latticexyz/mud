// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { SystemRegistry } from "@latticexyz/world/src/codegen/tables/SystemRegistry.sol";
import { PuppetRegistry } from "./tables/PuppetRegistry.sol";
import { PUPPET_TABLE_ID } from "./constants.sol";
import { Puppet } from "./Puppet.sol";

contract PuppetMaster {
  error PuppetMaster_NoPuppet(address systemAddress, ResourceId systemId);

  function puppet() internal view returns (Puppet) {
    ResourceId systemId = SystemRegistry.getSystemId(address(this));
    address puppetAddress = PuppetRegistry.get(PUPPET_TABLE_ID, systemId);
    if (puppetAddress == address(0)) revert PuppetMaster_NoPuppet(address(this), systemId);
    return Puppet(puppetAddress);
  }
}
