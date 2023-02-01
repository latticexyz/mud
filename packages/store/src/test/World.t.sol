// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { console } from "forge-std/console.sol";
import { DSTestPlus } from "solmate/test/utils/DSTestPlus.sol";
import { World } from "../World.sol";
import { System } from "../System.sol";
import { ExecutionMode } from "../Types.sol";
import { Vector2Table, Vector2 } from "../tables/Vector2Table.sol";

contract WorldTestSystem is System {
  function msgSender() public pure returns (address) {
    return _msgSender();
  }

  // WorldTestSystem's move function sets state on the Vector2Table of the caller
  // (independent of delegatecall or regular call)
  function move(
    bytes32 entity,
    uint32 x,
    uint32 y
  ) public {
    Vector2Table.set({ key: entity, x: x, y: y });
  }
}

// TODO: auto-generate this interface from registered systems
interface WorldWithWorldTestSystem {
  function WorldTestSystem_msgSender() external view returns (address);

  function WorldTestSystem_move(
    bytes32 entity,
    uint32 x,
    uint32 y
  ) external;
}

contract WorldTest is DSTestPlus {
  World internal world;
  WorldTestSystem internal system;

  function setUp() public {
    world = new World();
    system = new WorldTestSystem();
  }

  function testRegisterAndCallSystem() public {
    // Register autonomous system in the world
    world.registerSystem(address(system), "WorldTestSystem", "msgSender()", ExecutionMode.Autonomous);

    // Call system via world contract
    address msgSender = WorldWithWorldTestSystem(address(world)).WorldTestSystem_msgSender();

    // msg.sender (this) should have been passed to system
    assertEq(msgSender, address(this));
  }

  function testRegisterAndDelegatecallSystem() public {
    // Register delegate system in the world
    world.registerSystem(address(system), "WorldTestSystem", "msgSender()", ExecutionMode.Delegate);

    // Call system via world contract
    address msgSender = WorldWithWorldTestSystem(address(world)).WorldTestSystem_msgSender();

    // msg.sender (this) should have been passed to system
    assertEq(msgSender, address(this));
  }

  function testRegisterVector2Table() public {
    // Register table
    Vector2Table.registerSchema(world);
  }

  // Register WorldTestSystem as autonomous system and call its move function to set state on Vector2Table
  function testSetVector2ViaWorldTestSystemAutonomous() public {
    // Register autonomous system in the world
    world.registerSystem(address(system), "WorldTestSystem", "move(bytes32,uint32,uint32)", ExecutionMode.Autonomous);

    // Register table
    Vector2Table.registerSchema(world);

    // Call autonomous system's move function via world contract
    bytes32 entity = keccak256("entity");

    // !gasreport call autonomous system via World contract
    WorldWithWorldTestSystem(address(world)).WorldTestSystem_move(entity, 1, 2);

    // Get state from the table (using out-of-system syntax)
    Vector2 memory vec2 = Vector2Table.get(world, entity);

    // Verify the state has been set correctly
    assertEq(vec2.x, 1);
    assertEq(vec2.y, 2);
  }

  // Register WorldTestSystem as delegate system and call its move function to set state on Vector2Table
  function testSetVector2ViaWorldTestSystemDelegate() public {
    // Register delegate system in the world
    world.registerSystem(address(system), "WorldTestSystem", "move(bytes32,uint32,uint32)", ExecutionMode.Delegate);

    // Register table
    Vector2Table.registerSchema(world);

    // Call delegate system's move function via world contract
    bytes32 entity = keccak256("entity");

    // !gasreport call delegate system via World contract
    WorldWithWorldTestSystem(address(world)).WorldTestSystem_move(entity, 1, 2);

    // Get state from the table (using out-of-system syntax)
    Vector2 memory vec2 = Vector2Table.get(world, entity);

    // Verify the state has been set correctly
    assertEq(vec2.x, 1);
    assertEq(vec2.y, 2);
  }
}
