// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "forge-std/Test.sol";
import { World } from "../src/World.sol";
import { System } from "../src/System.sol";
import { OwnerTable } from "../src/tables/OwnerTable.sol";
import { RouteAccessTable } from "../src/tables/RouteAccessTable.sol";
import { RouteAccessSchemaLib } from "../src/schemas/RouteAccess.sol";
import { SystemTable } from "../src/tables/SystemTable.sol";

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

  function testRegisterSystem() public {
    System system = new System();
    bytes32 systemRouteId = world.registerSystem("", "testSystem", system, false);

    // Expect the system to be registered
    (address registeredAddress, bool publicAccess) = SystemTable.get(world, systemRouteId);
    assertEq(registeredAddress, address(system));

    // Expect the system route to be owned by the caller
    address routeOwner = OwnerTable.get(world, systemRouteId);
    assertEq(routeOwner, address(this));

    // Expect the system to not be publicly accessible
    assertFalse(publicAccess);

    // Expect the system to be accessible by the caller
    assertTrue(RouteAccessTable.get({ store: world, routeId: systemRouteId, caller: address(this) }));

    // Expect the system to not be accessible by another address
    assertFalse(RouteAccessTable.get({ store: world, routeId: systemRouteId, caller: address(0x01) }));

    // Expect the system to have access to its own base route
    assertTrue(RouteAccessTable.get({ store: world, routeId: keccak256(bytes("")), caller: address(system) }));

    // Expect an error when registering an existing system
    vm.expectRevert(abi.encodeWithSelector(World.SystemExists.selector, address(system)));
    world.registerSystem("", "newRoute", system, true);

    // Expect an error when registering a system at an existing route
    System newSystem = new System();
    vm.expectRevert(abi.encodeWithSelector(World.RouteExists.selector, "/testSystem"));
    world.registerSystem("", "testSystem", newSystem, true);

    // TODO: Expect an error when registering an invalid system route
    // vm.expectRevert(abi.encodeWithSelector(World.RouteInvalid.selector, "invalid/route"));
    // world.registerSystem("", "invalid/route", new System(), true);

    // Expect an error when extending a route that doesn't exist
    System anotherSystem = new System();
    vm.expectRevert(abi.encodeWithSelector(World.RouteAccessDenied.selector, "/invalid", address(this)));
    world.registerSystem("/invalid", "test", anotherSystem, true);

    // Expect an error when registering a system at a route that is not owned by the caller
    System yetAnotherSystem = new System();
    vm.startPrank(address(0x01));
    vm.expectRevert(abi.encodeWithSelector(World.RouteAccessDenied.selector, "", address(0x01)));
    world.registerSystem("", "rootSystem", yetAnotherSystem, true);
    vm.stopPrank();
  }
}
