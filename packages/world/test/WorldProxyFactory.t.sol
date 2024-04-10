// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { Test, console } from "forge-std/Test.sol";

import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { GasReporter } from "@latticexyz/gas-report/src/GasReporter.sol";
import { WORLD_VERSION } from "../src/version.sol";
import { World } from "../src/World.sol";
import { IBaseWorld } from "../src/codegen/interfaces/IBaseWorld.sol";
import { ResourceId } from "../src/WorldResourceId.sol";
import { InitModule } from "../src/modules/init/InitModule.sol";
import { Create2Factory } from "../src/Create2Factory.sol";
import { WorldProxy } from "../src/WorldProxy.sol";
import { WorldProxyFactory } from "../src/WorldProxyFactory.sol";
import { IWorldFactory } from "../src/IWorldFactory.sol";
import { IWorldEvents } from "../src/IWorldEvents.sol";
import { IWorldErrors } from "../src/IWorldErrors.sol";
import { InstalledModules } from "../src/codegen/tables/InstalledModules.sol";
import { NamespaceOwner } from "../src/codegen/tables/NamespaceOwner.sol";
import { ResourceId, WorldResourceIdInstance } from "../src/WorldResourceId.sol";
import { ROOT_NAMESPACE_ID } from "../src/constants.sol";
import { createInitModule } from "./createInitModule.sol";
import { ERC1967Proxy } from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import { ERC1967Utils } from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Utils.sol";

contract WorldProxyFactoryTest is Test, GasReporter {
  using WorldResourceIdInstance for ResourceId;

  event ContractDeployed(address addr, uint256 salt);
  event WorldDeployed(address indexed newContract, uint256 salt);

  function calculateAddress(
    address deployingAddress,
    bytes32 salt,
    bytes memory bytecode
  ) internal pure returns (address) {
    bytes32 bytecodeHash = keccak256(bytecode);
    bytes32 data = keccak256(abi.encodePacked(bytes1(0xff), deployingAddress, salt, bytecodeHash));
    return address(uint160(uint256(data)));
  }

  function testWorldProxyFactory(address account1, address account2, uint256 salt1, uint256 salt2) public {
    vm.assume(salt1 != salt2);
    vm.assume(account1 != account2);
    vm.startPrank(account1);

    // Deploy WorldFactory with current InitModule
    InitModule initModule = createInitModule();
    address worldFactoryAddress = address(new WorldProxyFactory(initModule));
    IWorldFactory worldFactory = IWorldFactory(worldFactoryAddress);

    // User defined bytes for create2
    bytes memory _salt1 = abi.encode(salt1);

    // Address we expect for first World
    address calculatedAddress = calculateAddress(
      worldFactoryAddress,
      keccak256(abi.encode(account1, _salt1)),
      type(World).creationCode
    );

    // Check for HelloWorld event from World
    vm.expectEmit(true, true, true, true);
    emit IWorldEvents.HelloWorld(WORLD_VERSION);

    startGasReport("deploy world via WorldProxyFactory");
    address worldAddress = worldFactory.deployWorld(_salt1);
    endGasReport();

    address worldImplementationAddress = address(
      uint160(uint256(vm.load(worldAddress, ERC1967Utils.IMPLEMENTATION_SLOT)))
    );
    assertEq(worldImplementationAddress, calculatedAddress);

    // Set the store address manually
    StoreSwitch.setStoreAddress(worldAddress);

    // Confirm correct Core is installed
    assertTrue(InstalledModules.get(address(initModule), keccak256(new bytes(0))));

    // Confirm the msg.sender is owner of the root namespace of the new world
    assertEq(NamespaceOwner.get(ROOT_NAMESPACE_ID), account1);

    // Deploy a second world

    // User defined bytes for create2
    // unchecked for the fuzzing test
    bytes memory _salt2 = abi.encode(salt2);

    // Address we expect for second World
    calculatedAddress = calculateAddress(
      worldFactoryAddress,
      keccak256(abi.encode(account1, _salt2)),
      type(World).creationCode
    );

    // Check for HelloWorld event from World
    vm.expectEmit(true, true, true, true);
    emit IWorldEvents.HelloWorld(WORLD_VERSION);

    worldAddress = worldFactory.deployWorld(_salt2);

    worldImplementationAddress = address(uint160(uint256(vm.load(worldAddress, ERC1967Utils.IMPLEMENTATION_SLOT))));
    assertEq(worldImplementationAddress, calculatedAddress);

    // Set the store address manually
    StoreSwitch.setStoreAddress(worldAddress);

    // Confirm correct Core is installed
    assertTrue(InstalledModules.get(address(initModule), keccak256(new bytes(0))));

    // Confirm the msg.sender is owner of the root namespace of the new world
    assertEq(NamespaceOwner.get(ROOT_NAMESPACE_ID), account1);

    // Expect revert when deploying world with same bytes salt as already deployed world
    vm.expectRevert();
    worldFactory.deployWorld(_salt1);

    // Expect revert when initializing world as not the creator
    vm.expectRevert(
      abi.encodeWithSelector(IWorldErrors.World_AccessDenied.selector, ROOT_NAMESPACE_ID.toString(), account1)
    );
    IBaseWorld(address(worldAddress)).initialize(initModule);

    // Deploy a new world
    address newWorldImplementationAddress = address(new World());

    // Expect revert when changing implementation as not root namespace owner
    vm.startPrank(account2);
    vm.expectRevert(
      abi.encodeWithSelector(IWorldErrors.World_AccessDenied.selector, ROOT_NAMESPACE_ID.toString(), account2)
    );
    WorldProxy(payable(worldAddress)).setImplementation(newWorldImplementationAddress);

    vm.startPrank(account1);

    // Set proxy implementation to new world
    WorldProxy(payable(worldAddress)).setImplementation(newWorldImplementationAddress);

    worldImplementationAddress = address(uint160(uint256(vm.load(worldAddress, ERC1967Utils.IMPLEMENTATION_SLOT))));
    assertEq(worldImplementationAddress, newWorldImplementationAddress);
  }

  function testWorldProxyFactoryGas() public {
    testWorldProxyFactory(address(this), address(1), 0, 1);
  }
}
