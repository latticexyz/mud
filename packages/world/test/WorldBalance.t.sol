// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "forge-std/Test.sol";
import { GasReporter } from "@latticexyz/gas-report/src/GasReporter.sol";
import { World } from "../src/World.sol";
import { System } from "../src/System.sol";
import { IBaseWorld } from "../src/interfaces/IBaseWorld.sol";
import { ResourceId, WorldResourceIdLib, WorldResourceIdInstance } from "../src/WorldResourceId.sol";
import { ROOT_NAMESPACE, ROOT_NAMESPACE_ID } from "../src/constants.sol";
import { CoreModule } from "../src/modules/core/CoreModule.sol";
import { Balances } from "../src/modules/core/tables/Balances.sol";
import { IWorldErrors } from "../src/interfaces/IWorldErrors.sol";
import { RESOURCE_SYSTEM } from "../src/worldResourceTypes.sol";

using WorldResourceIdInstance for ResourceId;

contract WorldBalanceTestSystem is System {
  function echoValue() public payable returns (uint256) {
    return _msgValue();
  }
}

contract WorldBalanceTest is Test, GasReporter {
  IBaseWorld public world;
  WorldBalanceTestSystem public rootSystem = new WorldBalanceTestSystem();
  WorldBalanceTestSystem public nonRootSystem = new WorldBalanceTestSystem();
  bytes14 public namespace = "namespace";
  ResourceId public namespaceId = WorldResourceIdLib.encodeNamespace(namespace);
  ResourceId public rootSystemId =
    WorldResourceIdLib.encode({ typeId: RESOURCE_SYSTEM, namespace: ROOT_NAMESPACE, name: "testSystem" });
  ResourceId public nonRootSystemId =
    WorldResourceIdLib.encode({ typeId: RESOURCE_SYSTEM, namespace: namespace, name: "testSystem" });
  address public caller = address(4242);

  function setUp() public {
    world = IBaseWorld(address(new World()));
    world.initialize(new CoreModule());
    world.registerSystem(rootSystemId, rootSystem, true);
    world.registerSystem(nonRootSystemId, nonRootSystem, true);

    world.registerRootFunctionSelector(rootSystemId, rootSystem.echoValue.selector, rootSystem.echoValue.selector);
    world.registerFunctionSelector(nonRootSystemId, "echoValue", "()");
  }

  function testCallWithValue() public {
    uint256 value = 1 ether;

    // Expect the root and non root namespaces to have no balance
    assertEq(Balances.get(world, ResourceId.unwrap(ROOT_NAMESPACE_ID)), 0);
    assertEq(Balances.get(world, ResourceId.unwrap(namespaceId)), 0);

    // Call a function on the root system with value via call
    vm.deal(caller, value);
    vm.prank(caller);
    bytes memory data = world.call{ value: value }(rootSystemId, abi.encodeCall(rootSystem.echoValue, ()));
    assertEq(abi.decode(data, (uint256)), value);

    // Expect the root namespace to have the value as balance
    assertEq(Balances.get(world, ResourceId.unwrap(ROOT_NAMESPACE_ID)), value);

    // Call a function on a non-root system with value via call
    vm.deal(caller, value);
    vm.prank(caller);
    data = world.call{ value: value }(nonRootSystemId, abi.encodeCall(rootSystem.echoValue, ()));
    assertEq(abi.decode(data, (uint256)), value);

    // Expect the non root namespace to have the value as balance
    assertEq(Balances.get(world, ResourceId.unwrap(namespaceId)), value);

    // Expect the root namespace to still have the same balance as before
    assertEq(Balances.get(world, ResourceId.unwrap(ROOT_NAMESPACE_ID)), value);
  }

  function testCallFromWithValue() public {
    uint256 value = 1 ether;

    // Expect the root and non root namespaces to have no balance
    assertEq(Balances.get(world, ResourceId.unwrap(ROOT_NAMESPACE_ID)), 0);
    assertEq(Balances.get(world, ResourceId.unwrap(namespaceId)), 0);

    // Call a function on the root system with value via callFrom
    vm.deal(caller, value);
    vm.prank(caller);
    bytes memory data = world.callFrom{ value: value }(caller, rootSystemId, abi.encodeCall(rootSystem.echoValue, ()));
    assertEq(abi.decode(data, (uint256)), value);

    // Expect the root namespace to have the value as balance
    assertEq(Balances.get(world, ResourceId.unwrap(ROOT_NAMESPACE_ID)), value);

    // Call a function on a non-root system with value via callFrom
    vm.deal(caller, value);
    vm.prank(caller);
    data = world.callFrom{ value: value }(caller, nonRootSystemId, abi.encodeCall(rootSystem.echoValue, ()));
    assertEq(abi.decode(data, (uint256)), value);

    // Expect the non root namespace to have the value as balance
    assertEq(Balances.get(world, ResourceId.unwrap(namespaceId)), value);

    // Expect the root namespace to still have the same balance as before
    assertEq(Balances.get(world, ResourceId.unwrap(ROOT_NAMESPACE_ID)), value);
  }

  function testFallbackWithValue() public {
    uint256 value = 1 ether;

    // Expect the root and non root namespaces to have no balance
    assertEq(Balances.get(world, ResourceId.unwrap(ROOT_NAMESPACE_ID)), 0);
    assertEq(Balances.get(world, ResourceId.unwrap(namespaceId)), 0);

    // Call a function on the root system with value via the registered root function selector
    vm.deal(caller, value);
    vm.prank(caller);
    (bool success, bytes memory data) = address(world).call{ value: value }(abi.encodeWithSignature("echoValue()"));
    assertTrue(success);
    assertEq(abi.decode(data, (uint256)), value);

    // Expect the root namespace to have the value as balance
    assertEq(Balances.get(world, ResourceId.unwrap(ROOT_NAMESPACE_ID)), value);

    // Call a function on a non-root system with value
    vm.deal(caller, value);
    vm.prank(caller);
    (success, data) = address(world).call{ value: value }(abi.encodeWithSignature("namespace_testSystem_echoValue()"));
    assertTrue(success);
    assertEq(abi.decode(data, (uint256)), value);

    // Expect the non root namespace to have the value as balance
    assertEq(Balances.get(world, ResourceId.unwrap(namespaceId)), value);

    // Expect the root namespace to still have the same balance as before
    assertEq(Balances.get(world, ResourceId.unwrap(ROOT_NAMESPACE_ID)), value);
  }

  function testReceiveWithValue() public {
    uint256 value = 1 ether;

    // Expect the root to have no balance
    assertEq(Balances.get(world, ResourceId.unwrap(ROOT_NAMESPACE_ID)), 0);

    // Send value to the world without calldata
    vm.deal(caller, value);
    vm.prank(caller);
    (bool success, bytes memory data) = address(world).call{ value: value }("");
    assertTrue(success);
    assertEq(data.length, 0);

    // Expect the root namespace to have the value as balance
    assertEq(Balances.get(world, ResourceId.unwrap(ROOT_NAMESPACE_ID)), value);
  }

  function testTransferBalanceToNamespace() public {
    uint256 value = 1 ether;

    // Expect the root and non root namespaces to have no balance
    assertEq(Balances.get(world, ResourceId.unwrap(ROOT_NAMESPACE_ID)), 0);
    assertEq(Balances.get(world, ResourceId.unwrap(namespaceId)), 0);

    // Send balance to root namespace
    vm.deal(caller, value);
    vm.prank(caller);
    (bool success, bytes memory data) = address(world).call{ value: value }("");
    assertTrue(success);
    assertEq(data.length, 0);

    // Expect the root namespace to have the value as balance
    assertEq(Balances.get(world, ResourceId.unwrap(ROOT_NAMESPACE_ID)), value);

    // Transfer the balance to another namespace
    world.transferBalanceToNamespace(ROOT_NAMESPACE_ID, namespaceId, value);

    // Expect the root namespace to have no balance
    assertEq(Balances.get(world, ResourceId.unwrap(ROOT_NAMESPACE_ID)), 0);

    // Expect the non root namespace to have the value as balance
    assertEq(Balances.get(world, ResourceId.unwrap(namespaceId)), value);
  }

  function testTransferBalanceToNamespaceRevertInsufficientBalance() public {
    uint256 value = 1 ether;

    // Expect the root and non root namespaces to have no balance
    assertEq(Balances.get(world, ResourceId.unwrap(ROOT_NAMESPACE_ID)), 0);
    assertEq(Balances.get(world, ResourceId.unwrap(namespaceId)), 0);

    // Send balance to root namespace
    vm.deal(caller, value);
    vm.prank(caller);
    (bool success, bytes memory data) = address(world).call{ value: value }("");
    assertTrue(success);
    assertEq(data.length, 0);

    // Expect the root namespace to have the value as balance
    assertEq(Balances.get(world, ResourceId.unwrap(ROOT_NAMESPACE_ID)), value);

    // Expect revert when attempting to transfer more than the balance
    vm.expectRevert(abi.encodeWithSelector(IWorldErrors.InsufficientBalance.selector, value, value + 1));
    world.transferBalanceToNamespace(ROOT_NAMESPACE_ID, namespaceId, value + 1);

    // Expect the root namespace to have the value as balance
    assertEq(Balances.get(world, ResourceId.unwrap(ROOT_NAMESPACE_ID)), value);

    // Expect the non root namespace to have no balance
    assertEq(Balances.get(world, ResourceId.unwrap(namespaceId)), 0);
  }

  function testTransferBalanceToNamespaceRevertAccessDenied() public {
    uint256 value = 1 ether;

    // Expect the root and non root namespaces to have no balance
    assertEq(Balances.get(world, ResourceId.unwrap(ROOT_NAMESPACE_ID)), 0);
    assertEq(Balances.get(world, ResourceId.unwrap(namespaceId)), 0);

    // Send balance to root namespace
    vm.deal(caller, value);
    vm.prank(caller);
    (bool success, bytes memory data) = address(world).call{ value: value }("");
    assertTrue(success);
    assertEq(data.length, 0);

    // Expect the root namespace to have the value as balance
    assertEq(Balances.get(world, ResourceId.unwrap(ROOT_NAMESPACE_ID)), value);

    // Expect revert when attempting to transfer from a namespace without access
    vm.prank(caller);
    vm.expectRevert(abi.encodeWithSelector(IWorldErrors.AccessDenied.selector, ROOT_NAMESPACE_ID.toString(), caller));
    world.transferBalanceToNamespace(ROOT_NAMESPACE_ID, namespaceId, value);

    // Expect the root namespace to have the value as balance
    assertEq(Balances.get(world, ResourceId.unwrap(ROOT_NAMESPACE_ID)), value);

    // Expect the non root namespace to have no balance
    assertEq(Balances.get(world, ResourceId.unwrap(namespaceId)), 0);
  }

  function testTransferBalanceToNamespaceRevertInvalidResourceType() public {
    uint256 value = 1 ether;

    // Expect the root namespace to have no balance
    assertEq(Balances.get(world, ResourceId.unwrap(ROOT_NAMESPACE_ID)), 0);

    // Send balance to root namespace
    vm.deal(caller, value);
    vm.prank(caller);
    (bool success, bytes memory data) = address(world).call{ value: value }("");
    assertTrue(success);
    assertEq(data.length, 0);

    // Expect the root namespace to have the value as balance
    assertEq(Balances.get(world, ResourceId.unwrap(ROOT_NAMESPACE_ID)), value);

    // Expect revert when attempting to transfer to an invalid namespace
    ResourceId invalidNamespace = WorldResourceIdLib.encode({ typeId: "xx", namespace: "something", name: "invalid" });
    vm.prank(caller);
    vm.expectRevert(abi.encodeWithSelector(IWorldErrors.InvalidResourceType.selector, "xx"));
    world.transferBalanceToNamespace(ROOT_NAMESPACE_ID, invalidNamespace, value);

    // Expect the root namespace to have the value as balance
    assertEq(Balances.get(world, ResourceId.unwrap(ROOT_NAMESPACE_ID)), value);

    // Expect the non root namespace to have no balance
    assertEq(Balances.get(world, ResourceId.unwrap(invalidNamespace)), 0);
  }

  function testTransferBalanceToAddress() public {
    uint256 value = 1 ether;

    // Expect the root and non root namespaces to have no balance
    assertEq(Balances.get(world, ResourceId.unwrap(ROOT_NAMESPACE_ID)), 0);
    assertEq(Balances.get(world, ResourceId.unwrap(namespaceId)), 0);

    // Send balance to root namespace
    vm.deal(caller, value);
    vm.prank(caller);
    (bool success, bytes memory data) = address(world).call{ value: value }("");
    assertTrue(success);
    assertEq(data.length, 0);

    // Expect the root namespace to have the value as balance
    assertEq(Balances.get(world, ResourceId.unwrap(ROOT_NAMESPACE_ID)), value);

    // Expect the receiver to not have any balance
    address receiver = address(1234);
    assertEq(receiver.balance, 0);

    // Transfer the balance to the receiver
    world.transferBalanceToAddress(ROOT_NAMESPACE_ID, receiver, value);

    // Expect the root namespace to have no balance
    assertEq(Balances.get(world, ResourceId.unwrap(ROOT_NAMESPACE_ID)), 0);

    // Expect the receiver to have value as balance
    assertEq(receiver.balance, value);
  }

  function testTransferBalanceToAddressRevertInsufficientBalance() public {
    uint256 value = 1 ether;

    // Expect the root and non root namespaces to have no balance
    assertEq(Balances.get(world, ResourceId.unwrap(ROOT_NAMESPACE_ID)), 0);
    assertEq(Balances.get(world, ResourceId.unwrap(namespaceId)), 0);

    // Send balance to root namespace
    vm.deal(caller, value);
    vm.prank(caller);
    (bool success, bytes memory data) = address(world).call{ value: value }("");
    assertTrue(success);
    assertEq(data.length, 0);

    // Expect the root namespace to have the value as balance
    assertEq(Balances.get(world, ResourceId.unwrap(ROOT_NAMESPACE_ID)), value);

    // Expect the receiver to not have any balance
    address receiver = address(1234);
    assertEq(receiver.balance, 0);

    // Expect revert when attempting to transfer more than the balance
    vm.expectRevert(abi.encodeWithSelector(IWorldErrors.InsufficientBalance.selector, value, value + 1));
    world.transferBalanceToAddress(ROOT_NAMESPACE_ID, receiver, value + 1);

    // Expect the root namespace to have value as balance
    assertEq(Balances.get(world, ResourceId.unwrap(ROOT_NAMESPACE_ID)), value);

    // Expect the receiver to have no balance
    assertEq(receiver.balance, 0);
  }

  function testTransferBalanceToAddressRevertAccessDenied() public {
    uint256 value = 1 ether;

    // Expect the root and non root namespaces to have no balance
    assertEq(Balances.get(world, ResourceId.unwrap(ROOT_NAMESPACE_ID)), 0);
    assertEq(Balances.get(world, ResourceId.unwrap(namespaceId)), 0);

    // Send balance to root namespace
    vm.deal(caller, value);
    vm.prank(caller);
    (bool success, bytes memory data) = address(world).call{ value: value }("");
    assertTrue(success);
    assertEq(data.length, 0);

    // Expect the root namespace to have the value as balance
    assertEq(Balances.get(world, ResourceId.unwrap(ROOT_NAMESPACE_ID)), value);

    // Expect the receiver to not have any balance
    address receiver = address(1234);
    assertEq(receiver.balance, 0);

    // Expect revert when attempting to transfer from a namespace without access
    vm.prank(caller);
    vm.expectRevert(
      abi.encodeWithSelector(
        IWorldErrors.AccessDenied.selector,
        WorldResourceIdLib.encodeNamespace(ROOT_NAMESPACE).toString(),
        caller
      )
    );
    world.transferBalanceToAddress(ROOT_NAMESPACE_ID, receiver, value);

    // Expect the root namespace to have the value as balance
    assertEq(Balances.get(world, ResourceId.unwrap(ROOT_NAMESPACE_ID)), value);

    // Expect the receiver to have no balance
    assertEq(receiver.balance, 0);
  }
}
