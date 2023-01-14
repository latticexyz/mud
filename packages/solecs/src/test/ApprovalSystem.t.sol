// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { DSTestPlus } from "solmate/test/utils/DSTestPlus.sol";
import { Vm } from "forge-std/Vm.sol";
import { console } from "forge-std/console.sol";

import { TestComponent } from "./components/TestComponent.sol";
import { World } from "../World.sol";

contract ApprovalSystemTest is DSTestPlus {
  Vm internal immutable vm = Vm(HEVM_ADDRESS);

  function setUp() public {
    World world = new World();
    world.init();
  }

  // TODO tests
}
