// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Test, console } from "forge-std/Test.sol";
import { World } from "../src/World.sol";
import { WorldFactory } from "../src/WorldFactory.sol";
import { IWorldFactory } from "../src/interfaces/IWorldFactory.sol";
import { CoreModule } from "../src/modules/core/CoreModule.sol";

contract WorldFactoryTest is Test {
  event WorldDeployed(address indexed newContract);
  event HelloWorld();

  function calculateAddress(
    address deployingAddress,
    bytes32 salt,
    bytes memory bytecode
  ) internal pure returns (address) {
    bytes32 bytecodeHash = keccak256(bytecode);
    bytes32 data = keccak256(abi.encodePacked(bytes1(0xff), deployingAddress, salt, bytecodeHash));
    return address(uint160(uint256(data)));
  }

  function testDeployWorld() public {
    // Deploy WorldFactory with current CoreModule
    address worldFactoryAddress = address(new WorldFactory(new CoreModule()));
    IWorldFactory worldFactory = IWorldFactory(worldFactoryAddress);
    // Address we expect for World
    address calculatedAddress = calculateAddress(worldFactoryAddress, bytes32(0), type(World).creationCode);
    // Check for HelloWorld event from World
    vm.expectEmit(true, false, false, false);
    emit HelloWorld();
    // Check for WorldDeployed event from Factory
    vm.expectEmit(true, false, false, false);
    emit WorldDeployed(calculatedAddress);
    worldFactory.deployWorld();
    // TODO - Can we test if core module has been installed correctly? (Confirmed visually via forge trace)
    // Confirm worldCount (which is salt) has incremented
    assertEq(uint256(worldFactory.worldCount()), uint256(1));
  }
}
