// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { Test } from "forge-std/Test.sol";
import { GasReporter } from "@latticexyz/gas-report/src/GasReporter.sol";

import { System } from "@latticexyz/world/src/System.sol";
import { IBaseWorld } from "@latticexyz/world/src/codegen/interfaces/IBaseWorld.sol";
import { World } from "@latticexyz/world/src/World.sol";
import { CoreModule } from "@latticexyz/world/src/modules/core/CoreModule.sol";
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

  function echo(string memory message) public view returns (string memory) {
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
    World _world = new World();
    _world.initialize(new CoreModule());
    world = IBaseWorld(address(_world));

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
    bytes4 worldFunctionSelector = world.registerRootFunctionSelector(
      rootSystemBId,
      "echo(string)",
      EchoSystem.echo.selector
    );
    bytes memory callData = abi.encodeWithSelector(worldFunctionSelector, "hello");

    vm.prank(caller);
    bytes memory returnData = _executeFromRootSystemA(callData);
    assertEq(abi.decode(returnData, (string)), "hello");
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
    bytes4 worldFunctionSelector = world.registerRootFunctionSelector(
      rootSystemBId,
      "echo(string)",
      EchoSystem.echo.selector
    );
    bytes memory callData = abi.encodeWithSelector(worldFunctionSelector, "hello");

    vm.prank(caller);
    bytes memory returnData = _executeFromSystemA(callData);
    assertEq(abi.decode(returnData, (string)), "hello");
  }

  // - NON ROOT FROM ROOT ---------------------------------------------------------------------------- //

  function testCallNonRootFromRootMsgSender() public {
    vm.prank(caller);
    bytes memory returnData = _executeFromRootSystemA(systemBId, abi.encodeCall(EchoSystem.msgSender, ()));
    assertEq(abi.decode(returnData, (address)), caller);
  }

  function testNonCallRootFromRootWorld() public {
    vm.prank(caller);
    bytes memory returnData = _executeFromRootSystemA(systemBId, abi.encodeCall(EchoSystem.world, ()));
    assertEq(abi.decode(returnData, (address)), address(world));
  }

  function testNonCallRootFromRootEcho() public {
    vm.prank(caller);
    bytes memory returnData = _executeFromRootSystemA(systemBId, abi.encodeCall(EchoSystem.echo, ("hello")));
    assertEq(abi.decode(returnData, (string)), "hello");
  }

  function testNonCallRootFromRootWorldSelector() public {
    bytes4 worldFunctionSelector = world.registerRootFunctionSelector(
      systemBId,
      "echo(string)",
      EchoSystem.echo.selector
    );
    bytes memory callData = abi.encodeWithSelector(worldFunctionSelector, "hello");

    vm.prank(caller);
    bytes memory returnData = _executeFromRootSystemA(callData);
    assertEq(abi.decode(returnData, (string)), "hello");
  }

  // - NON ROOT FROM NON ROOT ---------------------------------------------------------------------------- //

  function testCallNonRootFromNonRootMsgSender() public {
    vm.prank(caller);
    bytes memory returnData = _executeFromSystemA(systemBId, abi.encodeCall(EchoSystem.msgSender, ()));
    assertEq(abi.decode(returnData, (address)), address(systemA));
  }

  function testNonCallRootFromNonRootWorld() public {
    vm.prank(caller);
    bytes memory returnData = _executeFromSystemA(systemBId, abi.encodeCall(EchoSystem.world, ()));
    assertEq(abi.decode(returnData, (address)), address(world));
  }

  function testNonCallRootFromNonRootEcho() public {
    vm.prank(caller);
    bytes memory returnData = _executeFromSystemA(systemBId, abi.encodeCall(EchoSystem.echo, ("hello")));
    assertEq(abi.decode(returnData, (string)), "hello");
  }

  function testNonCallRootFromNonRootWorldSelector() public {
    bytes4 worldFunctionSelector = world.registerRootFunctionSelector(
      systemBId,
      "echo(string)",
      EchoSystem.echo.selector
    );
    bytes memory callData = abi.encodeWithSelector(worldFunctionSelector, "hello");

    vm.prank(caller);
    bytes memory returnData = _executeFromSystemA(callData);
    assertEq(abi.decode(returnData, (string)), "hello");
  }
}
