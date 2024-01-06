// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { Test, console } from "forge-std/Test.sol";

import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { WORLD_VERSION } from "../src/version.sol";
import { World } from "../src/World.sol";
import { ResourceId } from "../src/WorldResourceId.sol";
import { CoreModule } from "../src/modules/core/CoreModule.sol";
import { CoreModule2 } from "../src/modules/core/CoreModule2.sol";
import { CORE_MODULE_NAME, CORE_MODULE_2_NAME } from "../src/modules/core/constants.sol";
import { Create2Factory } from "../src/Create2Factory.sol";
import { WorldFactory } from "../src/WorldFactory.sol";
import { IWorldFactory } from "../src/IWorldFactory.sol";
import { InstalledModules } from "../src/codegen/tables/InstalledModules.sol";
import { NamespaceOwner } from "../src/codegen/tables/NamespaceOwner.sol";
import { ROOT_NAMESPACE_ID } from "../src/constants.sol";

contract FactoriesTest is Test {
  event ContractDeployed(address addr, uint256 salt);
  event WorldDeployed(address indexed newContract);
  event HelloWorld(bytes32 indexed version);

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
    bytes memory encodedArguments = abi.encode(new CoreModule(), new CoreModule2());
    bytes memory combinedBytes = abi.encodePacked(type(WorldFactory).creationCode, encodedArguments);

    // Address we expect for deployed WorldFactory
    address calculatedAddress = calculateAddress(address(create2Factory), bytes32(0), combinedBytes);

    // Confirm event for deployment
    vm.expectEmit(true, false, false, false);
    emit ContractDeployed(calculatedAddress, uint256(0));
    create2Factory.deployContract(combinedBytes, uint256(0));

    // Confirm worldFactory was deployed correctly
    IWorldFactory worldFactory = IWorldFactory(calculatedAddress);
    assertEq(uint256(worldFactory.worldCount()), uint256(0));
  }

  function testWorldFactory() public {
    // Deploy WorldFactory with current CoreModule, CoreModule2
    CoreModule coreModule = new CoreModule();
    CoreModule2 coreModule2 = new CoreModule2();
    address worldFactoryAddress = address(new WorldFactory(coreModule, coreModule2));
    IWorldFactory worldFactory = IWorldFactory(worldFactoryAddress);

    // Address we expect for World
    address calculatedAddress = calculateAddress(worldFactoryAddress, bytes32(0), type(World).creationCode);

    // Check for HelloWorld event from World
    vm.expectEmit(true, true, true, true);
    emit HelloWorld(WORLD_VERSION);

    // Check for WorldDeployed event from Factory
    vm.expectEmit(true, false, false, false);
    emit WorldDeployed(calculatedAddress);
    worldFactory.deployWorld();

    // Set the store address manually
    StoreSwitch.setStoreAddress(calculatedAddress);

    // Retrieve CoreModule address from InstalledModule table
    address installedModule = InstalledModules.get(CORE_MODULE_NAME, keccak256(new bytes(0)));
    // Retrieve CoreModule2 address from InstalledModule2 table
    address installedModule2 = InstalledModules.get(CORE_MODULE_2_NAME, keccak256(new bytes(0)));

    // Confirm correct Core is installed
    assertEq(installedModule, address(coreModule));
    // Confirm correct Core2 is installed
    assertEq(installedModule2, address(coreModule2));

    // Confirm worldCount (which is salt) has incremented
    assertEq(uint256(worldFactory.worldCount()), uint256(1));

    // Confirm the msg.sender is owner of the root namespace of the new world
    assertEq(NamespaceOwner.get(ROOT_NAMESPACE_ID), address(this));
  }
}
