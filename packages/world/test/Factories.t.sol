// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { Test, console } from "forge-std/Test.sol";

import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { GasReporter } from "@latticexyz/gas-report/src/GasReporter.sol";
import { WORLD_VERSION } from "../src/version.sol";
import { World } from "../src/World.sol";
import { ResourceId } from "../src/WorldResourceId.sol";
import { InitModule } from "../src/modules/init/InitModule.sol";
import { Create2Factory } from "../src/Create2Factory.sol";
import { WorldFactory } from "../src/WorldFactory.sol";
import { IWorldFactory } from "../src/IWorldFactory.sol";
import { IWorldEvents } from "../src/IWorldEvents.sol";
import { InstalledModules } from "../src/codegen/tables/InstalledModules.sol";
import { NamespaceOwner } from "../src/codegen/tables/NamespaceOwner.sol";
import { ROOT_NAMESPACE_ID } from "../src/constants.sol";
import { createInitModule } from "./createInitModule.sol";

contract FactoriesTest is Test, GasReporter {
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

  function testCreate2Factory() public {
    Create2Factory create2Factory = new Create2Factory();

    // Encode constructor arguments for WorldFactory
    bytes memory encodedArguments = abi.encode(createInitModule());
    bytes memory combinedBytes = abi.encodePacked(type(WorldFactory).creationCode, encodedArguments);

    // Address we expect for deployed WorldFactory
    address calculatedAddress = calculateAddress(address(create2Factory), bytes32(0), combinedBytes);

    // Confirm event for deployment
    vm.expectEmit(true, false, false, false);
    emit ContractDeployed(calculatedAddress, uint256(0));
    startGasReport("deploy contract via Create2");
    create2Factory.deployContract(combinedBytes, uint256(0));
    endGasReport();
  }

  function testWorldFactory(address account, uint256 salt1, uint256 salt2) public {
    vm.assume(salt1 != salt2);
    vm.startPrank(account);

    // Deploy WorldFactory with current InitModule
    InitModule initModule = createInitModule();
    address worldFactoryAddress = address(new WorldFactory(initModule));
    IWorldFactory worldFactory = IWorldFactory(worldFactoryAddress);

    // User defined bytes for create2
    bytes memory _salt1 = abi.encode(salt1);

    // Address we expect for first World
    address calculatedAddress = calculateAddress(
      worldFactoryAddress,
      keccak256(abi.encode(account, _salt1)),
      type(World).creationCode
    );

    // Check for HelloWorld event from World
    vm.expectEmit(true, true, true, true);
    emit IWorldEvents.HelloWorld(WORLD_VERSION);

    // Check for WorldDeployed event from Factory
    vm.expectEmit(true, false, false, false);
    emit WorldDeployed(calculatedAddress, salt1);
    startGasReport("deploy world via WorldFactory");
    worldFactory.deployWorld(_salt1);
    endGasReport();

    // Set the store address manually
    StoreSwitch.setStoreAddress(calculatedAddress);

    // Confirm correct Core is installed
    assertTrue(InstalledModules.get(address(initModule), keccak256(new bytes(0))));

    // Confirm the msg.sender is owner of the root namespace of the new world
    assertEq(NamespaceOwner.get(ROOT_NAMESPACE_ID), account);

    // Deploy a second world

    // User defined bytes for create2
    // unchecked for the fuzzing test
    bytes memory _salt2 = abi.encode(salt2);

    // Address we expect for second World
    calculatedAddress = calculateAddress(
      worldFactoryAddress,
      keccak256(abi.encode(account, _salt2)),
      type(World).creationCode
    );

    // Check for HelloWorld event from World
    vm.expectEmit(true, true, true, true);
    emit IWorldEvents.HelloWorld(WORLD_VERSION);

    // Check for WorldDeployed event from Factory
    vm.expectEmit(true, false, false, false);
    emit WorldDeployed(calculatedAddress, salt2);
    worldFactory.deployWorld(_salt2);

    // Set the store address manually
    StoreSwitch.setStoreAddress(calculatedAddress);

    // Confirm correct Core is installed
    assertTrue(InstalledModules.get(address(initModule), keccak256(new bytes(0))));

    // Confirm the msg.sender is owner of the root namespace of the new world
    assertEq(NamespaceOwner.get(ROOT_NAMESPACE_ID), account);

    // Expect revert when deploying world with same bytes salt as already deployed world
    vm.expectRevert();
    worldFactory.deployWorld(_salt1);
  }

  function testWorldFactoryGas() public {
    testWorldFactory(address(this), 0, 1);
  }
}
