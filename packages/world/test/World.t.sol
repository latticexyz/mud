// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "forge-std/Test.sol";
import { World } from "../src/World.sol";
import { OwnerTable } from "../src/tables/OwnerTable.sol";
import { RouteAccessTable } from "../src/tables/RouteAccessTable.sol";
import { RouteAccessSchemaLib } from "../src/schemas/RouteAccess.sol";

contract WorldTest is Test {
  World world;

  function setUp() public {
    world = new World();
  }

  function testConstructor() public {
    // Owner of root route should be the creator of the World
    address rootOwner = OwnerTable.get(world, keccak256(""));
    assertEq(rootOwner, address(this));
  }

  function testIsStore() public view {
    world.isStore();
  }

  function testRegisterRoute() public {
    // Register a new route (by extending the root route)
    world.registerRoute("", "test");

    // Owner of the new route should be the caller of the method
    address routeOwner = OwnerTable.get(world, keccak256("/test"));
    assertEq(routeOwner, address(this));

    // The new route should be accessible by the caller
    assertTrue(RouteAccessTable.get({ store: world, routeId: keccak256("/test"), caller: address(this) }));

    // The new route should not be accessible by another address
    assertFalse(RouteAccessTable.get({ store: world, routeId: keccak256("/test"), caller: address(0x01) }));

    // Expect an error when registering an existing route
    vm.expectRevert(abi.encodeWithSelector(World.RouteExists.selector, "/test"));
    world.registerRoute("", "test");

    // TODO: Expect an error when registering an invalid route
    // vm.expectRevert(abi.encodeWithSelector(World.RouteInvalid.selector, "invalid/route"));
    // world.registerRoute("", "invalid/route");

    // Expect an error when extending a route that doesn't exist
    vm.expectRevert(abi.encodeWithSelector(World.RouteInvalid.selector, "/invalid"));
    world.registerRoute("/invalid", "test");
  }

  function testRegisterTable() public {
    bytes32 tableId = world.registerTable("", "testRouteAccess", RouteAccessSchemaLib.getSchema());

    // Expect the table to be registered
    assertEq(world.getSchema(tableId).unwrap(), RouteAccessSchemaLib.getSchema().unwrap());

    // Expect the table's route to be owned by the caller
    address routeOwner = OwnerTable.get(world, tableId);
    assertEq(routeOwner, address(this));

    // The new table should be accessible by the caller
    assertTrue(RouteAccessTable.get({ store: world, routeId: tableId, caller: address(this) }));

    // The new table should not be accessible by another address
    assertFalse(RouteAccessTable.get({ store: world, routeId: tableId, caller: address(0x01) }));

    // Expect an error when registering an existing table
    vm.expectRevert(abi.encodeWithSelector(World.RouteExists.selector, "/testRouteAccess"));
    world.registerTable("", "testRouteAccess", RouteAccessSchemaLib.getSchema());

    // TODO: Expect an error when registering an invalid table route
    // vm.expectRevert(abi.encodeWithSelector(World.RouteInvalid.selector, "invalid/route"));
    // world.registerTable("", "invalid/route", RouteAccessSchemaLib.getSchema()));

    // Expect an error when extending a route that doesn't exist
    vm.expectRevert(abi.encodeWithSelector(World.RouteInvalid.selector, "/invalid"));
    world.registerTable("/invalid", "test", RouteAccessSchemaLib.getSchema());
  }
}
