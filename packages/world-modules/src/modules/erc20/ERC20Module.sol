// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { ResourceIds } from "@latticexyz/store/src/codegen/tables/ResourceIds.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { RESOURCE_TABLE } from "@latticexyz/store/src/storeResourceTypes.sol";
import { RESOURCE_SYSTEM } from "@latticexyz/world/src/worldResourceTypes.sol";
import { AFTER_CALL_SYSTEM } from "@latticexyz/world/src/systemHookTypes.sol";
import { Module } from "@latticexyz/world/src/Module.sol";
import { WorldResourceIdLib, WorldResourceIdInstance } from "@latticexyz/world/src/WorldResourceId.sol";
import { IBaseWorld } from "@latticexyz/world/src/codegen/interfaces/IBaseWorld.sol";
import { MODULE_NAME, ERC20_REGISTRY_TABLE_ID, MODULE_NAMESPACE } from "./constants.sol";
import { ERC20System } from "./ERC20System.sol";
import { ERC20Proxy } from "./ERC20Proxy.sol";
import { ERC20Registry } from "./tables/ERC20Registry.sol";
import { Balances } from "./tables/Balances.sol";
import { Allowances } from "./tables/Allowances.sol";
import { Metadata } from "./tables/Metadata.sol";
import { ERC20DelegationControl } from "./ERC20DelegationControl.sol";

/**
 * TODO:
 * - Set up namespace delegation for the ERC20Proxy: it needs to be able to use callFrom on behalf of everyone in the namespace
 */

contract ERC20Module is Module {
  using WorldResourceIdInstance for ResourceId;

  ERC20DelegationControl public immutable erc20DelegationControl = new ERC20DelegationControl();
  ResourceId public immutable erc20DelegationControlId =
    WorldResourceIdLib.encode({ typeId: RESOURCE_SYSTEM, namespace: MODULE_NAMESPACE, name: "ERC20Delegation" });

  function getName() public pure override returns (bytes16) {
    return MODULE_NAME;
  }

  function install(bytes memory args) public {
    bytes14 namespace = abi.decode(args, (bytes14));
    ResourceId namespaceId = WorldResourceIdLib.encodeNamespace(namespace);

    IBaseWorld world = IBaseWorld(_world());

    // Encode the table IDs based on the namespace
    ResourceId allowancesTableId = WorldResourceIdLib.encode({
      typeId: RESOURCE_TABLE,
      namespace: namespace,
      name: "Allowances"
    });
    ResourceId balancesTableId = WorldResourceIdLib.encode({
      typeId: RESOURCE_TABLE,
      namespace: namespace,
      name: "Balances"
    });
    ResourceId metadataTableId = WorldResourceIdLib.encode({
      typeId: RESOURCE_TABLE,
      namespace: namespace,
      name: "Metadata"
    });
    ResourceId erc20SystemId = WorldResourceIdLib.encode({
      typeId: RESOURCE_SYSTEM,
      namespace: namespace,
      name: "ERC20"
    });

    // Register the tables
    Allowances.register(allowancesTableId);
    Balances.register(balancesTableId);
    Metadata.register(metadataTableId);

    // Create the ERC20System
    ERC20System erc20System = new ERC20System();
    world.registerSystem(erc20SystemId, erc20System, true);

    // Create the ERC20Proxy and system
    ERC20Proxy erc20Proxy = new ERC20Proxy(world, erc20SystemId, allowancesTableId, balancesTableId, metadataTableId);

    // Register the ERC20Proxy as hook on the ERC20System
    world.registerSystemHook(erc20SystemId, erc20Proxy, AFTER_CALL_SYSTEM);

    // Grant the ERC20System and caller access to the namespace
    world.grantAccess(namespaceId, address(erc20System));
    world.grantAccess(namespaceId, _msgSender());

    // Transfer ownership of the namespace to the caller
    world.transferOwnership(namespaceId, _msgSender());

    // If the ERC20Registry is not registered yet, register it
    if (!ResourceIds.getExists(ERC20_REGISTRY_TABLE_ID)) {
      ERC20Registry.register(ERC20_REGISTRY_TABLE_ID);
    }

    // If the delegation control is not registered yet, register it and grant it access to the
    if (!ResourceIds.getExists(erc20DelegationControlId)) {
      world.registerSystem(erc20DelegationControlId, erc20DelegationControl, true);
    }

    // Register the erc20 delegation control in the namespace
    world.registerNamespaceDelegation(namespaceId, erc20DelegationControlId, new bytes(0));

    // Register the ERC20Proxy in the ERC20Registry
    ERC20Registry.set(ERC20_REGISTRY_TABLE_ID, namespaceId, address(erc20Proxy));
  }

  function installRoot(bytes memory) public pure {
    revert Module_RootInstallNotSupported();
  }
}
