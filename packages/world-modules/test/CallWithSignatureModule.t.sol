// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { Test } from "forge-std/Test.sol";
import { GasReporter } from "@latticexyz/gas-report/src/GasReporter.sol";

import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { World } from "@latticexyz/world/src/World.sol";
import { IModule } from "@latticexyz/world/src/IModule.sol";
import { IModuleErrors } from "@latticexyz/world/src/IModuleErrors.sol";
import { IBaseWorld } from "@latticexyz/world/src/codegen/interfaces/IBaseWorld.sol";
import { IWorldErrors } from "@latticexyz/world/src/IWorldErrors.sol";
import { System } from "@latticexyz/world/src/System.sol";
import { RESOURCE_SYSTEM } from "@latticexyz/world/src/worldResourceTypes.sol";
import { UNLIMITED_DELEGATION } from "@latticexyz/world/src/constants.sol";
import { ResourceId, WorldResourceIdLib, WorldResourceIdInstance } from "@latticexyz/world/src/WorldResourceId.sol";
import { REGISTRATION_SYSTEM_ID } from "@latticexyz/world/src/modules/init/constants.sol";

import { createWorld } from "@latticexyz/world/test/createWorld.sol";
import { WorldTestSystem } from "@latticexyz/world/test/World.t.sol";

import { Unstable_CallWithSignatureModule } from "../src/modules/callwithsignature/Unstable_CallWithSignatureModule.sol";
import { Unstable_CallWithSignatureSystem } from "../src/modules/callwithsignature/Unstable_CallWithSignatureSystem.sol";
import { IUnstable_CallWithSignatureErrors } from "../src/modules/callwithsignature/IUnstable_CallWithSignatureErrors.sol";
import { getSignedMessageHash } from "../src/modules/callwithsignature/getSignedMessageHash.sol";
import { ECDSA } from "../src/modules/callwithsignature/ECDSA.sol";

contract Unstable_CallWithSignatureModuleTest is Test, GasReporter {
  using WorldResourceIdInstance for ResourceId;

  IBaseWorld world;
  Unstable_CallWithSignatureModule callWithSignatureModule = new Unstable_CallWithSignatureModule();

  function setUp() public {
    world = createWorld();
    StoreSwitch.setStoreAddress(address(world));
  }

  function testInstallRoot() public {
    startGasReport("install delegation module");
    world.installRootModule(callWithSignatureModule, new bytes(0));
    endGasReport();
  }

  function testRegisterDelegationWithSignature() public {
    // Register a new system
    WorldTestSystem system = new WorldTestSystem();
    ResourceId systemId = WorldResourceIdLib.encode({
      typeId: RESOURCE_SYSTEM,
      namespace: "namespace",
      name: "testSystem"
    });
    world.registerNamespace(systemId.getNamespaceId());
    world.registerSystem(systemId, system, true);

    world.installRootModule(callWithSignatureModule, new bytes(0));

    // Register an unlimited delegation using signature
    (address delegator, uint256 delegatorPk) = makeAddrAndKey("delegator");
    address delegatee = address(2);

    bytes memory callData = abi.encodeCall(world.registerDelegation, (delegatee, UNLIMITED_DELEGATION, new bytes(0)));

    bytes32 hash = getSignedMessageHash(delegator, REGISTRATION_SYSTEM_ID, callData, 0, address(world));
    (uint8 v, bytes32 r, bytes32 s) = vm.sign(delegatorPk, hash);
    bytes memory signature = abi.encodePacked(r, s, v);

    // Attempt to register a limited delegation using an empty signature
    vm.expectRevert(abi.encodeWithSelector(IUnstable_CallWithSignatureErrors.InvalidSignature.selector));
    Unstable_CallWithSignatureSystem(address(world)).callWithSignature(
      delegator,
      REGISTRATION_SYSTEM_ID,
      callData,
      new bytes(0)
    );

    startGasReport("register an unlimited delegation with signature");
    Unstable_CallWithSignatureSystem(address(world)).callWithSignature(
      delegator,
      REGISTRATION_SYSTEM_ID,
      callData,
      signature
    );
    endGasReport();

    // Call a system from the delegatee on behalf of the delegator
    vm.prank(delegatee);
    bytes memory returnData = world.callFrom(delegator, systemId, abi.encodeCall(WorldTestSystem.msgSender, ()));
    address returnedAddress = abi.decode(returnData, (address));

    // Expect the system to have received the delegator's address
    assertEq(returnedAddress, delegator);

    // Unregister delegation
    vm.prank(delegator);
    world.unregisterDelegation(delegatee);

    // Expect a revert when attempting to perform a call via callFrom after a delegation was unregistered
    vm.expectRevert(abi.encodeWithSelector(IWorldErrors.World_DelegationNotFound.selector, delegator, delegatee));
    vm.prank(delegatee);
    world.callFrom(delegator, systemId, abi.encodeCall(WorldTestSystem.msgSender, ()));

    // Attempt to register a limited delegation using an old signature
    vm.expectRevert(abi.encodeWithSelector(IUnstable_CallWithSignatureErrors.InvalidSignature.selector));
    Unstable_CallWithSignatureSystem(address(world)).callWithSignature(
      delegator,
      REGISTRATION_SYSTEM_ID,
      callData,
      signature
    );

    // Expect a revert when attempting to perform a call via callFrom after a delegation was unregistered
    vm.expectRevert(abi.encodeWithSelector(IWorldErrors.World_DelegationNotFound.selector, delegator, delegatee));
    vm.prank(delegatee);
    world.callFrom(delegator, systemId, abi.encodeCall(WorldTestSystem.msgSender, ()));

    // Register a limited delegation using a new signature
    hash = getSignedMessageHash(delegator, REGISTRATION_SYSTEM_ID, callData, 1, address(world));
    (v, r, s) = vm.sign(delegatorPk, hash);
    signature = abi.encodePacked(r, s, v);

    Unstable_CallWithSignatureSystem(address(world)).callWithSignature(
      delegator,
      REGISTRATION_SYSTEM_ID,
      callData,
      signature
    );

    // Call a system from the delegatee on behalf of the delegator
    vm.prank(delegatee);
    returnData = world.callFrom(delegator, systemId, abi.encodeCall(WorldTestSystem.msgSender, ()));
    returnedAddress = abi.decode(returnData, (address));

    // Expect the system to have received the delegator's address
    assertEq(returnedAddress, delegator);
  }
}
