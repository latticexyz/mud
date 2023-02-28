// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "forge-std/Test.sol";
import { IStoreHook } from "@latticexyz/store/src/IStore.sol";
import { StoreCore } from "@latticexyz/store/src/StoreCore.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";

import { World, _isRoute, _isSingleLevelRoute } from "../src/World.sol";
import { System } from "../src/System.sol";
import { RouteOwnerTable } from "../src/tables/RouteOwnerTable.sol";
import { RouteAccess } from "../src/tables/RouteAccess.sol";
import { SystemTable } from "../src/tables/SystemTable.sol";
import { BoolSchemaLib } from "../src/schemas/Bool.sol";

struct WorldTestSystemReturn {
  address sender;
  bytes32 input;
}

contract WorldTestSystem is System {
  error WorldTestSystemError(string err);
  event WorldTestSystemLog(string log);

  function msgSender() public pure returns (address) {
    return _msgSender();
  }

  function echo(bytes32 input) public pure returns (WorldTestSystemReturn memory) {
    return WorldTestSystemReturn(_msgSender(), input);
  }

  function err(string memory input) public pure {
    revert WorldTestSystemError(input);
  }

  function delegateCallSubSystem(address subSystem, bytes memory funcSelectorAndCalldata)
    public
    returns (bytes memory)
  {
    (bool success, bytes memory returndata) = subSystem.delegatecall(funcSelectorAndCalldata);
    if (!success) {
      assembly {
        revert(add(32, returndata), mload(returndata))
      }
    }
    return returndata;
  }

  function writeData(
    string calldata accessRoute,
    string calldata subRoute,
    bool data
  ) public {
    bytes32[] memory key = new bytes32[](1);
    key[0] = "testKey";

    if (StoreSwitch.isDelegateCall()) {
      uint256 tableId = uint256(uint256(keccak256(abi.encodePacked(accessRoute, subRoute))));
      StoreCore.setRecord(tableId, key, abi.encodePacked(data));
    } else {
      World(msg.sender).setRecord(accessRoute, subRoute, key, abi.encodePacked(data));
    }
  }

  function emitCallType() public {
    if (StoreSwitch.isDelegateCall()) {
      emit WorldTestSystemLog("delegatecall");
    } else {
      emit WorldTestSystemLog("call");
    }
  }
}

contract WorldTestTableHook is IStoreHook {
  event HookCalled(bytes data);

  function onSetRecord(
    uint256 table,
    bytes32[] memory key,
    bytes memory data
  ) public {
    emit HookCalled(abi.encode(table, key, data));
  }

  function onSetField(
    uint256 table,
    bytes32[] memory key,
    uint8 schemaIndex,
    bytes memory data
  ) public {
    emit HookCalled(abi.encode(table, key, schemaIndex, data));
  }

  function onDeleteRecord(uint256 table, bytes32[] memory key) public {
    emit HookCalled(abi.encode(table, key));
  }
}

contract WorldTest is Test {
  event HookCalled(bytes data);
  event WorldTestSystemLog(string log);

  World world;

  function setUp() public {
    world = new World();
  }

  function testConstructor() public {
    // Owner of root route should be the creator of the World
    address rootOwner = RouteOwnerTable.get(world, uint256(uint256(keccak256(""))));
    assertEq(rootOwner, address(this));
  }

  function testIsStore() public view {
    world.isStore();
  }

  function testIsRoute() public {
    // !gasreport validate route (empty string)
    assertTrue(_isRoute(""), "empty string");

    // !gasreport validate route (single slash)
    assertFalse(_isRoute("/"), "single slash");

    // !gasreport validate route (single character)
    assertTrue(_isRoute("/a"), "single character");

    // !gasreport validate route (single level)
    assertTrue(_isRoute("/topLevel"), "single level");

    // !gasreport validate route (multi level)
    assertTrue(_isRoute("/topLevel/subLevel"), "multi level");

    // !gasreport validate route (no leading slash)
    assertFalse(_isRoute("noLeadingSlash"), "no leading slash");
  }

  function testIsSingleLevelRoute() public {
    // !gasreport validate single level route (empty string)
    assertTrue(_isSingleLevelRoute(""), "empty string");

    // !gasreport validate single level route (single slash)
    assertFalse(_isSingleLevelRoute("/"), "single slash");

    // !gasreport validate route (single character)
    assertTrue(_isRoute("/a"), "single character");

    // !gasreport validate single level route (single level)
    assertTrue(_isSingleLevelRoute("/topLevel"), "single level");

    // !gasreport validate single level route (multi level)
    assertFalse(_isSingleLevelRoute("/topLevel/subLevel"), "multi level");

    // !gasreport validate single level route (no leading slash)
    assertFalse(_isSingleLevelRoute("noLeadingSlash"), "no leading slash");

    // !gasreport validate single level route (no leading slash but contains slash)
    assertFalse(_isSingleLevelRoute("noLeadingSlash/butContainsSlash"), "no leading slash");
  }

  function testRegisterRoute() public {
    // Register a new route (by extending the root route)
    world.registerRoute("", "/test");

    // Owner of the new route should be the caller of the method
    address routeOwner = RouteOwnerTable.get(world, uint256(keccak256("/test")));
    assertEq(routeOwner, address(this));

    // The new route should be accessible by the caller
    assertTrue(RouteAccess.get({ _store: world, routeId: uint256(keccak256("/test")), caller: address(this) }));

    // The new route should not be accessible by another address
    assertFalse(RouteAccess.get({ _store: world, routeId: uint256(keccak256("/test")), caller: address(0x01) }));

    // Expect an error when registering an existing route
    vm.expectRevert(abi.encodeWithSelector(World.RouteExists.selector, "/test"));
    world.registerRoute("", "/test");

    // TODO: Expect an error when registering an invalid route
    // vm.expectRevert(abi.encodeWithSelector(World.RouteInvalid.selector, "invalid/route"));
    // world.registerRoute("", "invalid/route");

    // Expect an error when extending a route that doesn't exist
    vm.expectRevert(abi.encodeWithSelector(World.RouteInvalid.selector, "/invalid"));
    world.registerRoute("/invalid", "/test");
  }

  function testRegisterTable() public {
    uint256 tableId = world.registerTable("", "/testRouteAccess", RouteAccess.getSchema());

    // Expect the table to be registered
    assertEq(world.getSchema(tableId).unwrap(), RouteAccess.getSchema().unwrap());

    // Expect the table's route to be owned by the caller
    address routeOwner = RouteOwnerTable.get(world, tableId);
    assertEq(routeOwner, address(this));

    // The new table should be accessible by the caller
    assertTrue(RouteAccess.get({ _store: world, routeId: tableId, caller: address(this) }));

    // The new table should not be accessible by another address
    assertFalse(RouteAccess.get({ _store: world, routeId: tableId, caller: address(0x01) }));

    // Expect an error when registering an existing table
    vm.expectRevert(abi.encodeWithSelector(World.RouteExists.selector, "/testRouteAccess"));
    world.registerTable("", "/testRouteAccess", RouteAccess.getSchema());

    // Expect an error when registering an invalid table route
    vm.expectRevert(abi.encodeWithSelector(World.RouteInvalid.selector, "invalid/route"));
    world.registerTable("", "invalid/route", RouteAccess.getSchema());

    // Expect an error when extending a route that doesn't exist
    vm.expectRevert(abi.encodeWithSelector(World.RouteInvalid.selector, "/invalid"));
    world.registerTable("/invalid", "/test", RouteAccess.getSchema());
  }

  function testRegisterSystem() public {
    System system = new System();
    uint256 systemRouteId = world.registerSystem("", "/testSystem", system, false);

    // Expect the system to be registered
    (address registeredAddress, bool publicAccess) = SystemTable.get(world, systemRouteId);
    assertEq(registeredAddress, address(system));

    // Expect the system route to be owned by the caller
    address routeOwner = RouteOwnerTable.get(world, systemRouteId);
    assertEq(routeOwner, address(this));

    // Expect the system to not be publicly accessible
    assertFalse(publicAccess);

    // Expect the system to be accessible by the caller
    assertTrue(RouteAccess.get({ _store: world, routeId: systemRouteId, caller: address(this) }));

    // Expect the system to not be accessible by another address
    assertFalse(RouteAccess.get({ _store: world, routeId: systemRouteId, caller: address(0x01) }));

    // Expect the system to have access to its own base route
    assertTrue(RouteAccess.get({ _store: world, routeId: uint256(keccak256(bytes(""))), caller: address(system) }));

    // Expect an error when registering an existing system
    vm.expectRevert(abi.encodeWithSelector(World.SystemExists.selector, address(system)));
    world.registerSystem("", "/newRoute", system, true);

    // Expect an error when registering a system at an existing route
    System newSystem = new System();
    vm.expectRevert(abi.encodeWithSelector(World.RouteExists.selector, "/testSystem"));
    world.registerSystem("", "/testSystem", newSystem, true);

    // Expect an error when registering an invalid system route
    System oneMoreSystem = new System();
    vm.expectRevert(abi.encodeWithSelector(World.RouteInvalid.selector, "invalid/route"));
    world.registerSystem("", "invalid/route", oneMoreSystem, true);

    // Expect an error when extending a route that doesn't exist
    System anotherSystem = new System();
    vm.expectRevert(abi.encodeWithSelector(World.RouteAccessDenied.selector, "/invalid", address(this)));
    world.registerSystem("/invalid", "/test", anotherSystem, true);

    // Expect an error when registering a system at a route that is not owned by the caller
    System yetAnotherSystem = new System();
    vm.startPrank(address(0x01));
    vm.expectRevert(abi.encodeWithSelector(World.RouteAccessDenied.selector, "", address(0x01)));
    world.registerSystem("", "/rootSystem", yetAnotherSystem, true);
    vm.stopPrank();
  }

  function testGrantAccess() public {
    // TODO
  }

  function testRetractAccess() public {
    // TODO
  }

  function testSetRecord() public {
    // Register a new route
    world.registerRoute("", "/testSetRecord");

    // Register a new table
    uint256 tableRouteId = world.registerTable("/testSetRecord", "/testTable", BoolSchemaLib.getSchema());

    // Write data to the table
    bytes32 key = keccak256("testKey");
    BoolSchemaLib.set({ store: world, tableId: tableRouteId, key: key, value: true });

    // Expect the data to be written
    assertTrue(BoolSchemaLib.get({ store: world, tableId: tableRouteId, key: key }));

    // Expect an error when trying to write from an address that doesn't have access
    vm.startPrank(address(0x01));
    vm.expectRevert(
      abi.encodeWithSelector(World.RouteAccessDenied.selector, "/testSetRecord/testTable", address(0x01))
    );
    BoolSchemaLib.set({ store: world, tableId: tableRouteId, key: key, value: true });
    vm.stopPrank();

    // Expect to be able to write via the base route
    bytes32[] memory keyTuple = new bytes32[](1);
    keyTuple[0] = key;
    world.setRecord("/testSetRecord", "/testTable", keyTuple, abi.encodePacked(false));
    assertFalse(BoolSchemaLib.get({ store: world, tableId: tableRouteId, key: key }));

    // Expect an error when trying to write from an address that doesn't have access to the base route
    vm.startPrank(address(0x01));
    vm.expectRevert(abi.encodeWithSelector(World.RouteAccessDenied.selector, "/testSetRecord", address(0x01)));
    world.setRecord("/testSetRecord", "/testTable", keyTuple, abi.encodePacked(false));
    vm.stopPrank();
  }

  function testSetField() public {
    // Register a new route
    world.registerRoute("", "/testSetField");

    // Register a new table
    uint256 tableRouteId = world.registerTable("/testSetField", "/testTable", BoolSchemaLib.getSchema());

    bytes32 key = keccak256("testKey");
    bytes32[] memory keyTuple = new bytes32[](1);
    keyTuple[0] = key;

    // Write data to the table via access route
    world.setField("/testSetField", "/testTable", keyTuple, 0, abi.encodePacked(true));

    // Expect the data to be written
    assertTrue(BoolSchemaLib.get({ store: world, tableId: tableRouteId, key: key }));

    // Write data to the table via direct access
    world.setField(tableRouteId, keyTuple, 0, abi.encodePacked(false));

    // Expect the data to be written
    assertFalse(BoolSchemaLib.get({ store: world, tableId: tableRouteId, key: key }));

    // Expect an error when trying to write from an address that doesn't have access
    vm.startPrank(address(0x01));
    vm.expectRevert(abi.encodeWithSelector(World.RouteAccessDenied.selector, "/testSetField", address(0x01)));
    world.setField("/testSetField", "/testTable", keyTuple, 0, abi.encodePacked(true));
    vm.stopPrank();

    // Expect an error when trying to write from an address that doesn't have direct access
    vm.startPrank(address(0x02));
    vm.expectRevert(abi.encodeWithSelector(World.RouteAccessDenied.selector, "/testSetField/testTable", address(0x02)));
    world.setField(tableRouteId, keyTuple, 0, abi.encodePacked(true));
    vm.stopPrank();
  }

  function testDeleteRecord() public {
    // Register a new route
    world.registerRoute("", "/testDeleteRecord");

    // Register a new table
    uint256 tableRouteId = world.registerTable("/testDeleteRecord", "/testTable", BoolSchemaLib.getSchema());

    bytes32 key = keccak256("testKey");
    bytes32[] memory keyTuple = new bytes32[](1);
    keyTuple[0] = key;

    // Write data to the table via the access route and expect it to be written
    world.setRecord("/testDeleteRecord", "/testTable", keyTuple, abi.encodePacked(true));
    assertTrue(BoolSchemaLib.get({ store: world, tableId: tableRouteId, key: key }));

    // Delete the record via the access route and expect it to be deleted
    world.deleteRecord("/testDeleteRecord", "/testTable", keyTuple);
    assertFalse(BoolSchemaLib.get({ store: world, tableId: tableRouteId, key: key }));

    // Write data to the table via the access route and expect it to be written
    world.setRecord("/testDeleteRecord", "/testTable", keyTuple, abi.encodePacked(true));
    assertTrue(BoolSchemaLib.get({ store: world, tableId: tableRouteId, key: key }));

    // Delete the record via direct access and expect it to be deleted
    world.deleteRecord(tableRouteId, keyTuple);
    assertFalse(BoolSchemaLib.get({ store: world, tableId: tableRouteId, key: key }));

    // Write data to the table via the access route and expect it to be written
    world.setRecord("/testDeleteRecord", "/testTable", keyTuple, abi.encodePacked(true));
    assertTrue(BoolSchemaLib.get({ store: world, tableId: tableRouteId, key: key }));

    // Expect an error when trying to delete from an address that doesn't have access
    vm.startPrank(address(0x01));
    vm.expectRevert(abi.encodeWithSelector(World.RouteAccessDenied.selector, "/testDeleteRecord", address(0x01)));
    world.deleteRecord("/testDeleteRecord", "/testTable", keyTuple);
    vm.stopPrank();

    // Expect an error when trying to delete from an address that doesn't have direct access
    vm.startPrank(address(0x02));
    vm.expectRevert(
      abi.encodeWithSelector(World.RouteAccessDenied.selector, "/testDeleteRecord/testTable", address(0x02))
    );
    world.deleteRecord(tableRouteId, keyTuple);
    vm.stopPrank();
  }

  function testCall() public {
    // Register a new system
    WorldTestSystem system = new WorldTestSystem();
    world.registerSystem("", "/testSystem", system, false);

    // Call a system function without arguments via the World
    bytes memory result = world.call("/testSystem", abi.encodeWithSelector(WorldTestSystem.msgSender.selector));
    // assertEq(result, address(this));

    // Expect the system to have received the caller's address
    assertEq(address(uint160(uint256(bytes32(result)))), address(this));

    // Call a system function with arguments via the World
    result = world.call("/testSystem", abi.encodeWithSelector(WorldTestSystem.echo.selector, bytes32(uint256(0x123))));

    // Expect the return data to be decodable as a tuple
    (address returnedAddress, bytes32 returnedBytes32) = abi.decode(result, (address, bytes32));
    assertEq(returnedAddress, address(this));
    assertEq(returnedBytes32, bytes32(uint256(0x123)));

    // Expect the return data to be decodable as a tuple
    WorldTestSystemReturn memory returnStruct = abi.decode(result, (WorldTestSystemReturn));
    assertEq(returnStruct.sender, address(this));
    assertEq(returnStruct.input, bytes32(uint256(0x123)));

    // Expect an error when trying to call a private system from an address that doesn't have access
    vm.startPrank(address(0x01));
    vm.expectRevert(abi.encodeWithSelector(World.RouteAccessDenied.selector, "/testSystem", address(0x01)));
    world.call("/testSystem", abi.encodeWithSelector(WorldTestSystem.msgSender.selector));
    vm.stopPrank();

    // Expect errors from the system to be forwarded
    vm.expectRevert(abi.encodeWithSelector(WorldTestSystem.WorldTestSystemError.selector, "test error"));
    world.call("/testSystem", abi.encodeWithSelector(WorldTestSystem.err.selector, "test error"));

    // Register a system at a subroute
    WorldTestSystem subSystem = new WorldTestSystem();
    world.registerSystem("/testSystem", "/testSubSystem", subSystem, false);

    // Call the subsystem via the World (with access to the base route)
    returnedAddress = abi.decode(
      world.call("/testSystem", "/testSubSystem", abi.encodeWithSelector(WorldTestSystem.msgSender.selector)),
      (address)
    );
    assertEq(returnedAddress, address(this));

    // Call the subsystem via delegatecall from the system
    // (Note: just for testing purposes, in reality systems can call subsystems directly instead of via two indirections like here)
    bytes memory nestedReturndata = world.call(
      "/testSystem",
      abi.encodeWithSelector(
        WorldTestSystem.delegateCallSubSystem.selector, // Function in system
        address(subSystem), // Address of subsystem
        abi.encodePacked(WorldTestSystem.msgSender.selector, address(this)) // Function in subsystem
      )
    );

    returnedAddress = abi.decode(abi.decode(nestedReturndata, (bytes)), (address));
    assertEq(returnedAddress, address(this), "subsystem returned wrong address");
  }

  function testRegisterTableHook() public {
    // Register a new table
    uint256 tableId = world.registerTable("", "/testTable", BoolSchemaLib.getSchema());

    // Register a new hook
    IStoreHook tableHook = new WorldTestTableHook();
    world.registerTableHook("/testTable", tableHook);

    // Prepare data to write to the table
    bytes32[] memory key = new bytes32[](1);
    key[0] = "someKey";
    bytes memory value = abi.encodePacked(true);

    // Expect the hook to be notified when a record is written
    vm.expectEmit(true, true, true, true);
    emit HookCalled(abi.encode(tableId, key, value));
    world.setRecord(tableId, key, value);
  }

  function testRegisterSystemHook() public view {
    // TODO
  }

  function testWriteRootSystem() public {
    // Register a new table
    uint256 tableId = world.registerTable("", "/testTable", BoolSchemaLib.getSchema());

    // Register a new system
    WorldTestSystem system = new WorldTestSystem();
    world.registerSystem("", "/testSystem", system, false);

    // Call a system function that write data to the World
    world.call("/testSystem", abi.encodeWithSelector(WorldTestSystem.writeData.selector, "", "/testTable", true));

    // Expect the data to be written
    assertTrue(BoolSchemaLib.get(tableId, world, "testKey"));
  }

  function testWriteAutonomousSystem() public {
    // Register a new subroute
    world.registerRoute("", "/testRoute");

    // Register a new table
    uint256 tableId = world.registerTable("/testRoute", "/testTable", BoolSchemaLib.getSchema());

    // Register a new system
    WorldTestSystem system = new WorldTestSystem();
    world.registerSystem("/testRoute", "/testSystem", system, false);

    // Call a system function that writes data to the World
    world.call(
      "/testRoute/testSystem",
      abi.encodeWithSelector(WorldTestSystem.writeData.selector, "/testRoute", "/testTable", true)
    );

    // Expect the data to be written
    assertTrue(BoolSchemaLib.get(tableId, world, "testKey"));
  }

  function testDelegatecallRootSystem() public {
    // Register a new root system
    WorldTestSystem system = new WorldTestSystem();
    world.registerSystem("", "/testSystem", system, false);

    // Call the root sysyem
    vm.expectEmit(true, true, true, true);
    emit WorldTestSystemLog("delegatecall");
    world.call("/testSystem", abi.encodeWithSelector(WorldTestSystem.emitCallType.selector));
  }

  function testCallAutonomousSystem() public {
    world.registerRoute("", "/testRoute");

    // Register a new non-root system
    WorldTestSystem system = new WorldTestSystem();
    world.registerSystem("/testRoute", "/testSystem", system, false);

    // Call the root sysyem
    vm.expectEmit(true, true, true, true);
    emit WorldTestSystemLog("call");
    world.call("/testRoute/testSystem", abi.encodeWithSelector(WorldTestSystem.emitCallType.selector));
  }

  // TODO: add a test for systems writing to tables via the World
  // (see https://github.com/latticexyz/mud/issues/444)

  function testHashEquality() public {
    // bytes32 h1 = uint256(keccak256("testHashEquality"));
    // bytes32 h2 = uint256(keccak256(abi.encodePacked(bytes32("testHashEquality"))));
    // assertEq(h1, h2);
  }
}
