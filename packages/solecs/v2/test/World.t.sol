// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { console } from "forge-std/console.sol";
import { DSTestPlus } from "solmate/test/utils/DSTestPlus.sol";
import { World } from "../World.sol";
import { System } from "../System.sol";
import { ExecutionMode } from "../Types.sol";
import { Vec2Table, Schema as Vec2 } from "../tables/Vec2Table.sol";

contract TestSystem is System {
  function msgSender() public pure returns (address) {
    return _msgSender();
  }

  // TestSystem's move function sets state on the Vec2Table of the caller
  // (independent of delegatecall or regular call)
  function move(
    bytes32 entity,
    uint32 x,
    uint32 y
  ) public {
    Vec2Table.set({ key: entity, x: x, y: y });
  }
}

// TODO: auto-generate this interface from registered systems
interface WorldWithTestSystem {
  function TestSystem_msgSender() external view returns (address);

  function TestSystem_move(
    bytes32 entity,
    uint32 x,
    uint32 y
  ) external;
}

contract WorldTest is DSTestPlus {
  World internal world;
  TestSystem internal system;

  function setUp() public {
    world = new World();
    system = new TestSystem();
  }

  function _registerSystem(ExecutionMode executionMode) internal {}

  function testRegisterAndCallSystem() public {
    // Register autonomous system in the world
    world.registerSystem(address(system), "TestSystem", "msgSender()", ExecutionMode.Autonomous);

    // Call system via world contract
    address msgSender = WorldWithTestSystem(address(world)).TestSystem_msgSender();

    // msg.sender (this) should have been passed to system
    assertEq(msgSender, address(this));
  }

  function testRegisterAndDelegatecallSystem() public {
    // Register delegate system in the world
    world.registerSystem(address(system), "TestSystem", "msgSender()", ExecutionMode.Delegate);

    // Call system via world contract
    address msgSender = WorldWithTestSystem(address(world)).TestSystem_msgSender();

    // msg.sender (this) should have been passed to system
    assertEq(msgSender, address(this));
  }

  function testRegisterVec2Table() public {
    // Register table
    Vec2Table.registerSchema(world);
  }

  // Register TestSystem as autonomous system and call its move function to set state on Vec2Table
  function testSetVec2ViaTestSystemAutonomous() public {
    // Register autonomous system in the world
    world.registerSystem(address(system), "TestSystem", "move(bytes32,uint32,uint32)", ExecutionMode.Autonomous);

    // Register table
    Vec2Table.registerSchema(world);

    // Call autonomous system's move function via world contract
    bytes32 entity = keccak256("entity");
    WorldWithTestSystem(address(world)).TestSystem_move(entity, 1, 2);

    // Get state from the table (using out-of-system syntax)
    Vec2 memory vec2 = Vec2Table.get(world, entity);

    // Verify the state has been set correctly
    assertEq(vec2.x, 1);
    assertEq(vec2.y, 2);
  }

  // Register TestSystem as delegate system and call its move function to set state on Vec2Table
  function testSetVec2ViaTestSystemDelegate() public {
    // Register delegate system in the world
    world.registerSystem(address(system), "TestSystem", "move(bytes32,uint32,uint32)", ExecutionMode.Delegate);

    // Register table
    Vec2Table.registerSchema(world);

    // Call delegate system's move function via world contract
    bytes32 entity = keccak256("entity");
    WorldWithTestSystem(address(world)).TestSystem_move(entity, 1, 2);

    // Get state from the table (using out-of-system syntax)
    Vec2 memory vec2 = Vec2Table.get(world, entity);

    // Verify the state has been set correctly
    assertEq(vec2.x, 1);
    assertEq(vec2.y, 2);
  }
}
