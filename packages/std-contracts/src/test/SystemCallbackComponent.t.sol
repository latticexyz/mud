// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { DSTest } from "ds-test/test.sol";
import { Vm } from "forge-std/Vm.sol";
import { console } from "forge-std/console.sol";

import { World } from "solecs/World.sol";
import { Uint256BareComponent } from "../components/Uint256BareComponent.sol";
import { TestSystem } from "./TestSystem.sol";
import { SystemCallbackComponent } from "../components/SystemCallbackComponent.sol";
import { SystemCallbackBareComponent, SystemCallback, executeSystemCallback } from "../components/SystemCallbackBareComponent.sol";

contract SystemCallbackComponentTest is DSTest {
  Vm internal immutable vm = Vm(HEVM_ADDRESS);

  World internal world;

  Uint256BareComponent internal uint256BareComponent;
  uint256 Uint256BareID = uint256(keccak256("component.Uint256Bare"));

  SystemCallbackBareComponent internal systemCallbackBareComponent;
  SystemCallbackComponent internal systemCallbackComponent;

  TestSystem internal system;
  uint256 TestSystemID = uint256(keccak256("system.TestSystem"));

  uint256 internal entity = uint256(keccak256("test entity"));
  uint256[] internal entities;
  bytes[] internal values;

  function setUp() public {
    world = new World();
    world.init();
    address worldAddress = address(world);

    uint256BareComponent = new Uint256BareComponent(worldAddress, Uint256BareID);
    systemCallbackBareComponent = new SystemCallbackBareComponent(
      worldAddress,
      uint256(keccak256("component.SystemCallbackBare"))
    );
    systemCallbackComponent = new SystemCallbackComponent(worldAddress, uint256(keccak256("component.SystemCallback")));

    system = new TestSystem(world, address(world.components()));
    world.registerSystem(address(system), TestSystemID);
    uint256BareComponent.authorizeWriter(address(system));

    // initialize sample values for TestSystem,
    // which will be called by `executeSystemCallback` to set these values
    entities = new uint256[](10);
    values = new bytes[](10);
    for (uint256 i; i < entities.length; i++) {
      entities[i] = i;
      values[i] = abi.encode(i + 10);
    }
  }

  function testGetAndExecuteSystemCallbackBare() public {
    SystemCallback memory cb = SystemCallback({
      systemId: TestSystemID,
      args: abi.encode(Uint256BareID, entities, values)
    });
    systemCallbackBareComponent.set(entity, cb);

    executeSystemCallback(world, systemCallbackBareComponent.getValue(entity));

    for (uint256 i; i < entities.length; i++) {
      assertEq(uint256BareComponent.getValue(i), i + 10);
    }
  }

  function testGetAndExecuteSystemCallback() public {
    SystemCallback memory cb = SystemCallback({
      systemId: TestSystemID,
      args: abi.encode(Uint256BareID, entities, values)
    });
    systemCallbackComponent.set(entity, cb);

    executeSystemCallback(world, systemCallbackComponent.getValue(entity));

    for (uint256 i; i < entities.length; i++) {
      assertEq(uint256BareComponent.getValue(i), i + 10);
    }
  }

  function _cbForGas() internal returns (SystemCallback memory) {
    // minimize the args so they don't affect gas too much
    entities = new uint256[](1);
    values = new bytes[](1);
    return SystemCallback({ systemId: TestSystemID, args: abi.encode(Uint256BareID, entities, values) });
  }

  function testSystemCallbackGas() public {
    uint256 gas;
    SystemCallback memory cb = _cbForGas();

    // Set
    gas = gasleft();
    systemCallbackComponent.set(entity, cb);
    console.log("Setting a SystemCallback component used %s gas", gas - gasleft());
    // Get
    gas = gasleft();
    cb = systemCallbackComponent.getValue(entity);
    console.log("Getting a SystemCallback component used %s gas", gas - gasleft());
    // Update
    gas = gasleft();
    systemCallbackComponent.set(entity, cb);
    console.log("Updating a SystemCallback component used %s gas", gas - gasleft());
    // Remove
    gas = gasleft();
    systemCallbackComponent.remove(entity);
    console.log("Removing a SystemCallback component used %s gas", gas - gasleft());
    // Call
    gas = gasleft();
    executeSystemCallback(world, cb);
    console.log("Executing a SystemCallback used %s gas", gas - gasleft());
  }

  function testSystemCallbackBareGas() public {
    uint256 gas;
    SystemCallback memory cb = _cbForGas();

    // Set
    gas = gasleft();
    systemCallbackBareComponent.set(entity, cb);
    console.log("Setting a Bare SystemCallback component used %s gas", gas - gasleft());
    // Get
    gas = gasleft();
    cb = systemCallbackBareComponent.getValue(entity);
    console.log("Getting a Bare SystemCallback component used %s gas", gas - gasleft());
    // Update
    gas = gasleft();
    systemCallbackBareComponent.set(entity, cb);
    console.log("Updating a Bare SystemCallback component used %s gas", gas - gasleft());
    // Remove
    gas = gasleft();
    systemCallbackBareComponent.remove(entity);
    console.log("Removing a Bare SystemCallback component used %s gas", gas - gasleft());
    // Call
    gas = gasleft();
    executeSystemCallback(world, cb);
    console.log("Executing a SystemCallback used %s gas", gas - gasleft());
  }
}
