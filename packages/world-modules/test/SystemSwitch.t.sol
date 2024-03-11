// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { Test } from "forge-std/Test.sol";
import { GasReporter } from "@latticexyz/gas-report/src/GasReporter.sol";

import { IStoreErrors } from "@latticexyz/store/src/IStoreErrors.sol";
import { ResourceIds } from "@latticexyz/store/src/codegen/tables/ResourceIds.sol";
import { Schema } from "@latticexyz/store/src/Schema.sol";
import { StoreCore } from "@latticexyz/store/src/StoreCore.sol";

import { System } from "@latticexyz/world/src/System.sol";
import { IBaseWorld } from "@latticexyz/world/src/codegen/interfaces/IBaseWorld.sol";
import { World } from "@latticexyz/world/src/World.sol";
import { createWorld } from "@latticexyz/world/test/createWorld.sol";
import { ResourceId, WorldResourceIdLib, WorldResourceIdInstance } from "@latticexyz/world/src/WorldResourceId.sol";
import { RESOURCE_SYSTEM } from "@latticexyz/world/src/worldResourceTypes.sol";
import { ROOT_NAMESPACE } from "@latticexyz/world/src/constants.sol";
import { SystemSwitch } from "../src/utils/SystemSwitch.sol";

contract EchoSystem is System {
  function msgSender() public view returns (address) {
    return _msgSender();
  }

  function world() public view returns (address) {
    return _world();
  }

  function readTable() public view returns (Schema) {
    return StoreCore.getKeySchema(ResourceIds._tableId);
  }

  function echo(string memory message) public pure returns (string memory) {
    return message;
  }

  function call(ResourceId systemId, bytes memory callData) public returns (bytes memory) {
    return SystemSwitch.call(systemId, callData);
  }

  function callViaSelector(bytes memory callData) public returns (bytes memory) {
    return SystemSwitch.call(callData);
  }
}

address constant caller = address(4232);

contract SystemSwitchTest is Test, GasReporter {
  using WorldResourceIdInstance for ResourceId;

  IBaseWorld world;

  EchoSystem systemA;
  EchoSystem systemB;
  EchoSystem rootSystemA;
  EchoSystem rootSystemB;

  ResourceId systemAId;
  ResourceId systemBId;
  ResourceId rootSystemAId;
  ResourceId rootSystemBId;

  function setUp() public {
    // Deploy world
    world = createWorld();

    // Deploy systems
    systemA = new EchoSystem();
    systemB = new EchoSystem();
    rootSystemA = new EchoSystem();
    rootSystemB = new EchoSystem();

    // Encode system IDs
    systemAId = WorldResourceIdLib.encode({ typeId: RESOURCE_SYSTEM, namespace: "namespaceA", name: "systemA" });
    systemBId = WorldResourceIdLib.encode({ typeId: RESOURCE_SYSTEM, namespace: "namespaceB", name: "systemB" });
    rootSystemAId = WorldResourceIdLib.encode({ typeId: RESOURCE_SYSTEM, namespace: ROOT_NAMESPACE, name: "systemA" });
    rootSystemBId = WorldResourceIdLib.encode({ typeId: RESOURCE_SYSTEM, namespace: ROOT_NAMESPACE, name: "systemB" });

    // Register namespaces
    world.registerNamespace(systemAId.getNamespaceId());
    world.registerNamespace(systemBId.getNamespaceId());

    // Register systems
    world.registerSystem(systemAId, systemA, true);
    world.registerSystem(systemBId, systemB, true);
    world.registerSystem(rootSystemAId, rootSystemA, true);
    world.registerSystem(rootSystemBId, rootSystemB, true);
  }

  function _executeFromRootSystemA(ResourceId systemId, bytes memory callData) public returns (bytes memory) {
    return abi.decode(world.call(rootSystemAId, abi.encodeCall(EchoSystem.call, (systemId, callData))), (bytes));
  }

  function _executeFromSystemA(ResourceId systemId, bytes memory callData) public returns (bytes memory) {
    return abi.decode(world.call(systemAId, abi.encodeCall(EchoSystem.call, (systemId, callData))), (bytes));
  }

  function _executeFromRootSystemA(bytes memory callData) public returns (bytes memory) {
    return abi.decode(world.call(rootSystemAId, abi.encodeCall(EchoSystem.callViaSelector, (callData))), (bytes));
  }

  function _executeFromSystemA(bytes memory callData) public returns (bytes memory) {
    return abi.decode(world.call(systemAId, abi.encodeCall(EchoSystem.callViaSelector, (callData))), (bytes));
  }

  // - ROOT FROM ROOT ---------------------------------------------------------------------------- //

  function testCallRootFromRootMsgSender() public {
    vm.prank(caller);
    bytes memory returnData = _executeFromRootSystemA(rootSystemBId, abi.encodeCall(EchoSystem.msgSender, ()));
    assertEq(abi.decode(returnData, (address)), caller);
  }

  function testCallRootFromRootWorld() public {
    vm.prank(caller);
    bytes memory returnData = _executeFromRootSystemA(rootSystemBId, abi.encodeCall(EchoSystem.world, ()));
    assertEq(abi.decode(returnData, (address)), address(world));
  }

  function testCallRootFromRootEcho() public {
    vm.prank(caller);
    bytes memory returnData = _executeFromRootSystemA(rootSystemBId, abi.encodeCall(EchoSystem.echo, ("hello")));
    assertEq(abi.decode(returnData, (string)), "hello");
  }

  function testCallRootFromRootWorldSelector() public {
    bytes4 worldFunctionSelector = world.registerRootFunctionSelector(rootSystemBId, "echo(string)", "echo(string)");
    bytes memory callData = abi.encodeWithSelector(worldFunctionSelector, "hello");

    vm.prank(caller);
    bytes memory returnData = _executeFromRootSystemA(callData);
    assertEq(abi.decode(returnData, (string)), "hello");
  }

  function testCallRootFromRootReadTable() public {
    vm.prank(caller);
    bytes memory returnData = _executeFromSystemA(rootSystemBId, abi.encodeCall(EchoSystem.readTable, ()));
    assertEq(Schema.unwrap(abi.decode(returnData, (Schema))), Schema.unwrap(ResourceIds._keySchema));
  }

  // - ROOT FROM NON ROOT ---------------------------------------------------------------------------- //

  function testCallRootFromNonRootMsgSender() public {
    vm.prank(caller);
    bytes memory returnData = _executeFromSystemA(rootSystemBId, abi.encodeCall(EchoSystem.msgSender, ()));
    assertEq(abi.decode(returnData, (address)), address(systemA));
  }

  function testCallRootFromNonRootWorld() public {
    vm.prank(caller);
    bytes memory returnData = _executeFromSystemA(rootSystemBId, abi.encodeCall(EchoSystem.world, ()));
    assertEq(abi.decode(returnData, (address)), address(world));
  }

  function testCallRootFromNonRootEcho() public {
    vm.prank(caller);
    bytes memory returnData = _executeFromSystemA(rootSystemBId, abi.encodeCall(EchoSystem.echo, ("hello")));
    assertEq(abi.decode(returnData, (string)), "hello");
  }

  function testCallRootFromNonRootWorldSelector() public {
    bytes4 worldFunctionSelector = world.registerRootFunctionSelector(rootSystemBId, "echo(string)", "echo(string)");
    bytes memory callData = abi.encodeWithSelector(worldFunctionSelector, "hello");

    vm.prank(caller);
    bytes memory returnData = _executeFromSystemA(callData);
    assertEq(abi.decode(returnData, (string)), "hello");
  }

  function testCallRootFromNonRootReadTable() public {
    vm.prank(caller);
    bytes memory returnData = _executeFromSystemA(rootSystemBId, abi.encodeCall(EchoSystem.readTable, ()));
    assertEq(Schema.unwrap(abi.decode(returnData, (Schema))), Schema.unwrap(ResourceIds._keySchema));
  }

  // - NON ROOT FROM ROOT ---------------------------------------------------------------------------- //

  function testCallNonRootFromRootMsgSender() public {
    vm.prank(caller);
    bytes memory returnData = _executeFromRootSystemA(systemBId, abi.encodeCall(EchoSystem.msgSender, ()));
    assertEq(abi.decode(returnData, (address)), caller);
  }

  function testCallNonRootFromRootWorld() public {
    vm.prank(caller);
    bytes memory returnData = _executeFromRootSystemA(systemBId, abi.encodeCall(EchoSystem.world, ()));
    assertEq(abi.decode(returnData, (address)), address(world));
  }

  function testCallNonRootFromRootEcho() public {
    vm.prank(caller);
    bytes memory returnData = _executeFromRootSystemA(systemBId, abi.encodeCall(EchoSystem.echo, ("hello")));
    assertEq(abi.decode(returnData, (string)), "hello");
  }

  function testCallNonRootFromRootWorldSelector() public {
    bytes4 worldFunctionSelector = world.registerRootFunctionSelector(systemBId, "echo(string)", "echo(string)");
    bytes memory callData = abi.encodeWithSelector(worldFunctionSelector, "hello");

    vm.prank(caller);
    bytes memory returnData = _executeFromRootSystemA(callData);
    assertEq(abi.decode(returnData, (string)), "hello");
  }

  function testCallNonRootFromRootReadTable() public {
    vm.prank(caller);

    // Call reverts because the non-root system storage does not have table schemas
    vm.expectRevert(
      abi.encodeWithSelector(
        IStoreErrors.Store_TableNotFound.selector,
        ResourceIds._tableId,
        string(abi.encodePacked(ResourceIds._tableId))
      )
    );
    world.call(systemAId, abi.encodeCall(EchoSystem.call, (systemBId, abi.encodeCall(EchoSystem.readTable, ()))));
  }

  // - NON ROOT FROM NON ROOT ---------------------------------------------------------------------------- //

  function testCallNonRootFromNonRootMsgSender() public {
    vm.prank(caller);
    bytes memory returnData = _executeFromSystemA(systemBId, abi.encodeCall(EchoSystem.msgSender, ()));
    assertEq(abi.decode(returnData, (address)), address(systemA));
  }

  function testCallNonRootFromNonRootWorld() public {
    vm.prank(caller);
    bytes memory returnData = _executeFromSystemA(systemBId, abi.encodeCall(EchoSystem.world, ()));
    assertEq(abi.decode(returnData, (address)), address(world));
  }

  function testCallNonRootFromNonRootEcho() public {
    vm.prank(caller);
    bytes memory returnData = _executeFromSystemA(systemBId, abi.encodeCall(EchoSystem.echo, ("hello")));
    assertEq(abi.decode(returnData, (string)), "hello");
  }

  function testCallNonRootFromNonRootWorldSelector() public {
    bytes4 worldFunctionSelector = world.registerRootFunctionSelector(systemBId, "echo(string)", "echo(string)");
    bytes memory callData = abi.encodeWithSelector(worldFunctionSelector, "hello");

    vm.prank(caller);
    bytes memory returnData = _executeFromSystemA(callData);
    assertEq(abi.decode(returnData, (string)), "hello");
  }

  function testCallNonRootFromNonRootReadTable() public {
    vm.prank(caller);

    // Call reverts because the non-root system storage does not have table schemas
    vm.expectRevert(
      abi.encodeWithSelector(
        IStoreErrors.Store_TableNotFound.selector,
        ResourceIds._tableId,
        string(abi.encodePacked(ResourceIds._tableId))
      )
    );
    world.call(systemAId, abi.encodeCall(EchoSystem.call, (systemBId, abi.encodeCall(EchoSystem.readTable, ()))));
  }
}
