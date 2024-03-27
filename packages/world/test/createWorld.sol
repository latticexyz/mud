// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { World } from "../src/World.sol";
import { IBaseWorld } from "../src/codegen/interfaces/IBaseWorld.sol";
import { createInitModule } from "./createInitModule.sol";

import { ERC1967Proxy } from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

function createWorld() returns (IBaseWorld world) {
  // Deploy the world implementation
  address worldImplementationAddress = address(new World());

  // Deploy the world proxy
  address worldAddress = address(
    new ERC1967Proxy(worldImplementationAddress, abi.encodeCall(World.initializeWorld, ()))
  );
  world = IBaseWorld(worldAddress);

  world.initialize(createInitModule());
}
