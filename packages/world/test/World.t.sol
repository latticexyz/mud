// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "forge-std/Test.sol";
import { SchemaType } from "@latticexyz/schema-type/src/solidity/SchemaType.sol";

import { IStoreHook } from "@latticexyz/store/src/IStore.sol";
import { StoreCore } from "@latticexyz/store/src/StoreCore.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { Schema, SchemaLib } from "@latticexyz/store/src/Schema.sol";
import { StoreMetadataData, StoreMetadata } from "@latticexyz/store/src/codegen/Tables.sol";
import { EncodeArray } from "@latticexyz/store/src/tightcoder/EncodeArray.sol";

import { World } from "../src/World.sol";
import { System } from "../src/System.sol";
import { ResourceSelector } from "../src/ResourceSelector.sol";
import { ROOT_NAMESPACE, ROOT_NAME } from "../src/constants.sol";

import { NamespaceOwner } from "../src/tables/NamespaceOwner.sol";
import { ResourceAccess } from "../src/tables/ResourceAccess.sol";

import { CoreModule } from "../src/modules/core/CoreModule.sol";
import { Systems } from "../src/modules/core/tables/Systems.sol";

import { IBaseWorld } from "../src/interfaces/IBaseWorld.sol";
import { IWorldErrors } from "../src/interfaces/IWorldErrors.sol";

import { Bool } from "./tables/Bool.sol";
import { AddressArray } from "./tables/AddressArray.sol";

interface IWorldTestSystem {
  function testNamespace_testSystem_err(string memory input) external pure;
}

struct WorldTestSystemReturn {
  address sender;
  bytes32 input;
}

contract WorldTestSystem is System {
  error WorldTestSystemError(string err);
  event WorldTestSystemLog(string log);

  function msgSender() public view returns (address) {
    return _msgSender();
  }

  function echo(bytes32 input) public view returns (WorldTestSystemReturn memory) {
    return WorldTestSystemReturn(_msgSender(), input);
  }

  function err(string memory input) public pure {
    revert WorldTestSystemError(input);
  }

  function delegateCallSubSystem(
    address subSystem,
    bytes memory funcSelectorAndCalldata
  ) public returns (bytes memory) {
    (bool success, bytes memory returndata) = subSystem.delegatecall(funcSelectorAndCalldata);
    if (!success) {
      assembly {
        revert(add(32, returndata), mload(returndata))
      }
    }
    return returndata;
  }

  function writeData(bytes16 namespace, bytes16 name, bool data) public {
    bytes32[] memory key = new bytes32[](0);

    if (StoreSwitch.isDelegateCall()) {
      bytes32 tableId = ResourceSelector.from(namespace, name);
      StoreCore.setRecord(tableId, key, abi.encodePacked(data));
    } else {
      IBaseWorld(msg.sender).setRecord(namespace, name, key, abi.encodePacked(data));
    }
  }

  function emitCallType() public {
    if (StoreSwitch.isDelegateCall()) {
      emit WorldTestSystemLog("delegatecall");
    } else {
      emit WorldTestSystemLog("call");
    }
  }

  function receiveEther() public payable {}

  fallback() external {
    emit WorldTestSystemLog("fallback");
  }
}

contract PayableFallbackSystem is System {
  fallback() external payable {}
}

contract WorldTestTableHook is IStoreHook {
  event HookCalled(bytes data);

  function onSetRecord(bytes32 table, bytes32[] memory key, bytes memory data) public {
    emit HookCalled(abi.encode(table, key, data));
  }

  function onBeforeSetField(bytes32 table, bytes32[] memory key, uint8 schemaIndex, bytes memory data) public {
    emit HookCalled(abi.encode(table, key, schemaIndex, data));
  }

  function onAfterSetField(bytes32 table, bytes32[] memory key, uint8 schemaIndex, bytes memory data) public {
    emit HookCalled(abi.encode(table, key, schemaIndex, data));
  }

  function onDeleteRecord(bytes32 table, bytes32[] memory key) public {
    emit HookCalled(abi.encode(table, key));
  }
}

contract WorldTest is Test {
  using ResourceSelector for bytes32;

  event HookCalled(bytes data);
  event WorldTestSystemLog(string log);

  Schema defaultKeySchema = SchemaLib.encode(SchemaType.BYTES32);
  IBaseWorld world;

  bytes32 key;
  bytes32[] keyTuple;
  bytes32[] singletonKey;

  function setUp() public {
    world = IBaseWorld(address(new World()));
    world.installRootModule(new CoreModule(), new bytes(0));

    key = "testKey";
    keyTuple = new bytes32[](1);
    keyTuple[0] = key;
    singletonKey = new bytes32[](0);
  }

  // Expect an error when trying to write from an address that doesn't have access
  function _expectAccessDenied(address caller, bytes16 namespace, bytes16 name) internal {
    vm.prank(caller);
    vm.expectRevert(
      abi.encodeWithSelector(
        IWorldErrors.AccessDenied.selector,
        ResourceSelector.from(namespace, name).toString(),
        caller
      )
    );
  }

  function testConstructor() public {
    // Owner of root route should be the creator of the World
    address rootOwner = NamespaceOwner.get(world, ROOT_NAMESPACE);
    assertEq(rootOwner, address(this));

    // The creator of the World should have access to the root namespace
    assertTrue(ResourceAccess.get(world, ROOT_NAMESPACE, address(this)));
  }

  function testIsStore() public view {
    world.isStore();
  }

  function testRegisterNamespace() public {
    // !gasreport Register a new namespace
    world.registerNamespace("test");

    // Expect the caller to be the namespace owner
    assertEq(NamespaceOwner.get(world, "test"), address(this), "caller should be namespace owner");

    // Expect the caller to have access
    assertEq(ResourceAccess.get(world, "test", address(this)), true, "caller should have access");

    // Expect an error when registering an existing namespace
    vm.expectRevert(
      abi.encodeWithSelector(IWorldErrors.ResourceExists.selector, ResourceSelector.toString(bytes16("test")))
    );
    world.registerNamespace("test");
  }

  function testRegisterTable() public {
    Schema schema = SchemaLib.encode(SchemaType.BOOL, SchemaType.UINT256, SchemaType.STRING);
    bytes16 namespace = "testNamespace";
    bytes16 table = "testTable";

    // !gasreport Register a new table in the namespace
    bytes32 tableSelector = world.registerTable(namespace, table, schema, defaultKeySchema);

    // Expect the namespace to be created and owned by the caller
    assertEq(NamespaceOwner.get(world, namespace), address(this));

    // Expect the table to be registered

    assertEq(world.getSchema(tableSelector).unwrap(), schema.unwrap(), "schema should be registered");

    // Expect an error when registering an existing table
    vm.expectRevert(abi.encodeWithSelector(IWorldErrors.ResourceExists.selector, tableSelector.toString()));
    world.registerTable(namespace, table, schema, defaultKeySchema);

    // Expect an error when registering a table in a namespace that is not owned by the caller
    _expectAccessDenied(address(0x01), namespace, "");
    world.registerTable(namespace, "otherTable", schema, defaultKeySchema);

    // Expect the World to be allowed to call registerTable
    vm.prank(address(world));
    world.registerTable(namespace, "otherTable", schema, defaultKeySchema);
  }

  function testSetMetadata() public {
    string memory tableName = "testTable";
    bytes16 namespace = "testNamespace";
    bytes16 name = "tableName";
    bytes32 tableId = ResourceSelector.from(namespace, name);

    Schema schema = SchemaLib.encode(SchemaType.UINT8, SchemaType.UINT8);
    string[] memory fieldNames = new string[](2);
    fieldNames[0] = "testField1";
    fieldNames[1] = "testField2";

    // Expect an error when setting metadata on a resource that does not exist
    vm.expectRevert();
    world.setMetadata("invalid", "invalid", tableName, fieldNames);

    // Register a table
    world.registerTable(namespace, name, schema, defaultKeySchema);

    // !gasreport Set metadata
    world.setMetadata(namespace, name, tableName, fieldNames);

    // Expect the metadata to be set
    StoreMetadataData memory metadata = StoreMetadata.get(world, tableId);
    assertEq(metadata.tableName, tableName);
    assertEq(metadata.abiEncodedFieldNames, abi.encode(fieldNames));

    // Expect it to be possible to change metadata
    world.setMetadata(namespace, name, "newTableName", fieldNames);
    metadata = StoreMetadata.get(world, tableId);
    assertEq(metadata.tableName, "newTableName");
    assertEq(metadata.abiEncodedFieldNames, abi.encode(fieldNames));

    // Expect an error when setting metadata on a route that is not owned by the caller
    _expectAccessDenied(address(1), namespace, name);
    world.setMetadata(namespace, name, tableName, fieldNames);

    // Expect the World to be allowed to set metadata
    vm.prank(address(world));
    world.setMetadata(namespace, name, tableName, fieldNames);
  }

  function testRegisterSystem() public {
    System system = new System();
    bytes16 namespace = "";
    bytes16 name = "testSystem";

    // !gasrepot Register a new system
    bytes32 resourceSelector = world.registerSystem(namespace, name, system, false);

    // Expect the system to be registered
    (address registeredAddress, bool publicAccess) = Systems.get(world, resourceSelector);
    assertEq(registeredAddress, address(system));

    // Expect the system namespace to be owned by the caller
    address routeOwner = NamespaceOwner.get(world, "");
    assertEq(routeOwner, address(this));

    // Expect the system to not be publicly accessible
    assertFalse(publicAccess);

    // Expect the system to be accessible by the caller
    assertTrue(ResourceAccess.get({ _store: world, resourceSelector: "", caller: address(this) }));

    // Expect the system to not be accessible by another address
    assertFalse(ResourceAccess.get({ _store: world, resourceSelector: "", caller: address(0x1) }));

    // Expect the system to have access to its own namespace
    assertTrue(ResourceAccess.get({ _store: world, resourceSelector: "", caller: address(system) }));

    // Expect the namespace to be created if it doesn't exist yet
    assertEq(NamespaceOwner.get(world, "newNamespace"), address(0));
    world.registerSystem("newNamespace", "testSystem", new System(), false);
    assertEq(NamespaceOwner.get(world, "newNamespace"), address(this));

    // Expect an error when registering an existing system
    vm.expectRevert(abi.encodeWithSelector(IWorldErrors.SystemExists.selector, address(system)));
    world.registerSystem("", "newSystem", system, true);

    // Expect an error when registering a system at an existing resource selector
    System newSystem = new System();

    // Expect an error when registering a system at an existing resource selector
    vm.expectRevert(abi.encodeWithSelector(IWorldErrors.ResourceExists.selector, resourceSelector.toString()));
    resourceSelector = world.registerSystem("", "testSystem", newSystem, true);

    // Expect an error when registering a system in a namespace is not owned by the caller
    System yetAnotherSystem = new System();
    _expectAccessDenied(address(0x01), "", "");
    world.registerSystem("", "rootSystem", yetAnotherSystem, true);

    // Expect the registration to succeed when coming from the World
    vm.prank(address(world));
    world.registerSystem("", "rootSystem", yetAnotherSystem, true);
  }

  function testDuplicateSelectors() public {
    // Register a new table
    bytes32 resourceSelector = world.registerTable("namespace", "name", Bool.getSchema(), defaultKeySchema);

    // Deploy a new system
    System system = new System();

    // Expect an error when trying to register a system at the same selector
    vm.expectRevert(abi.encodeWithSelector(IWorldErrors.ResourceExists.selector, resourceSelector.toString()));
    world.registerSystem("namespace", "name", system, false);

    // Register a new system
    resourceSelector = world.registerSystem("namespace2", "name", new System(), false);

    // Expect an error when trying to register a table at the same selector
    vm.expectRevert(abi.encodeWithSelector(IWorldErrors.ResourceExists.selector, resourceSelector.toString()));
    world.registerTable("namespace2", "name", Bool.getSchema(), defaultKeySchema);
  }

  function testGrantAccess() public {
    // TODO
  }

  function testRevokeAccess() public {
    // TODO
  }

  function testSetRecord() public {
    // Register a new table
    bytes32 tableId = world.registerTable("testSetRecord", "testTable", Bool.getSchema(), defaultKeySchema);

    // !gasreport Write data to the table
    Bool.set(world, tableId, true);

    // Expect the data to be written
    assertTrue(Bool.get(world, tableId));

    // Expect an error when trying to write from an address that doesn't have access
    _expectAccessDenied(address(0x01), "testSetRecord", "testTable");
    Bool.set(world, tableId, true);

    // Expect the World to have access
    vm.prank(address(world));
    Bool.set(world, tableId, true);
  }

  function testSetField() public {
    bytes16 namespace = "testSetField";
    bytes16 name = "testTable";

    // Register a new table
    bytes32 tableId = world.registerTable(namespace, name, Bool.getSchema(), defaultKeySchema);

    // !gasreport Write data to a table field
    world.setField(namespace, name, singletonKey, 0, abi.encodePacked(true));

    // Expect the data to be written
    assertTrue(Bool.get(world, tableId));

    // Write data to the table via its tableId
    world.setField(tableId, singletonKey, 0, abi.encodePacked(false));

    // Expect the data to be written
    assertFalse(Bool.get(world, tableId));

    // Expect an error when trying to write from an address that doesn't have access when calling via the namespace
    _expectAccessDenied(address(0x01), "testSetField", "testTable");
    world.setField("testSetField", "testTable", singletonKey, 0, abi.encodePacked(true));

    // Expect an error when trying to write from an address that doesn't have access when calling via the tableId
    _expectAccessDenied(address(0x01), "testSetField", "testTable");
    world.setField(tableId, singletonKey, 0, abi.encodePacked(true));

    // Expect the World to have access
    vm.prank(address(world));
    world.setField("testSetField", "testTable", singletonKey, 0, abi.encodePacked(true));
  }

  function testPushToField() public {
    bytes16 namespace = "testPushToField";
    bytes16 name = "testTable";

    // Register a new table
    bytes32 tableId = world.registerTable(namespace, name, AddressArray.getSchema(), defaultKeySchema);

    // Create data
    address[] memory dataToPush = new address[](3);
    dataToPush[0] = address(0x01);
    dataToPush[1] = address(bytes20(keccak256("some address")));
    dataToPush[2] = address(bytes20(keccak256("another address")));
    bytes memory encodedData = EncodeArray.encode(dataToPush);

    // !gasreport Push data to the table
    world.pushToField(namespace, name, keyTuple, 0, encodedData);

    // Expect the data to be written
    assertEq(AddressArray.get(world, tableId, key), dataToPush);

    // Delete the data
    world.deleteRecord(namespace, name, keyTuple);

    // Push data to the table via direct access
    world.pushToField(tableId, keyTuple, 0, encodedData);

    // Expect the data to be written
    assertEq(AddressArray.get(world, tableId, key), dataToPush);

    // Expect an error when trying to write from an address that doesn't have access (via namespace/name)
    _expectAccessDenied(address(0x01), namespace, name);
    world.pushToField(namespace, name, keyTuple, 0, encodedData);

    // Expect an error when trying to write from an address that doesn't have access (via tableId)
    _expectAccessDenied(address(0x01), namespace, name);
    world.pushToField(tableId, keyTuple, 0, encodedData);

    // Expect the World to have access
    vm.prank(address(world));
    world.pushToField(namespace, name, keyTuple, 0, encodedData);
  }

  function testDeleteRecord() public {
    bytes16 namespace = "testDeleteRecord";
    bytes16 name = "testTable";

    // Register a new table
    bytes32 tableId = world.registerTable(namespace, name, Bool.getSchema(), defaultKeySchema);

    // Write data to the table via the namespace and expect it to be written
    world.setRecord(namespace, name, singletonKey, abi.encodePacked(true));
    assertTrue(Bool.get(world, tableId));

    // !gasreport Delete record
    world.deleteRecord(namespace, name, singletonKey);

    // expect it to be deleted
    assertFalse(Bool.get(world, tableId));

    // Write data to the table via the namespace and expect it to be written
    world.setRecord("testDeleteRecord", "testTable", singletonKey, abi.encodePacked(true));
    assertTrue(Bool.get(world, tableId));

    // Delete the record via the tableId and expect it to be deleted
    world.deleteRecord(tableId, singletonKey);
    assertFalse(Bool.get(world, tableId));

    // Write data to the table via the namespace and expect it to be written
    world.setRecord("testDeleteRecord", "testTable", singletonKey, abi.encodePacked(true));
    assertTrue(Bool.get(world, tableId));

    // Expect an error when trying to delete from an address that doesn't have access when calling via the namespace
    _expectAccessDenied(address(0x01), "testDeleteRecord", "testTable");
    world.deleteRecord("testDeleteRecord", "testTable", singletonKey);

    // Expect an error when trying to delete from an address that doesn't have access when calling via the tableId
    _expectAccessDenied(address(0x02), "testDeleteRecord", "testTable");
    world.deleteRecord(tableId, singletonKey);

    // Expect the World to have access
    vm.prank(address(world));
    world.deleteRecord("testDeleteRecord", "testTable", singletonKey);
  }

  function testCall() public {
    // Register a new system
    WorldTestSystem system = new WorldTestSystem();
    world.registerSystem("namespace", "testSystem", system, false);

    // Call a system function without arguments via the World
    bytes memory result = world.call(
      "namespace",
      "testSystem",
      abi.encodeWithSelector(WorldTestSystem.msgSender.selector)
    );

    // Expect the system to have received the caller's address
    assertEq(address(uint160(uint256(bytes32(result)))), address(this));

    // Call a system function with arguments via the World
    result = world.call(
      "namespace",
      "testSystem",
      abi.encodeWithSelector(WorldTestSystem.echo.selector, bytes32(uint256(0x123)))
    );

    // Expect the return data to be decodeable as a tuple
    (address returnedAddress, bytes32 returnedBytes32) = abi.decode(result, (address, bytes32));
    assertEq(returnedAddress, address(this));
    assertEq(returnedBytes32, bytes32(uint256(0x123)));

    // Expect the return data to be decodable as a struct
    WorldTestSystemReturn memory returnStruct = abi.decode(result, (WorldTestSystemReturn));
    assertEq(returnStruct.sender, address(this));
    assertEq(returnStruct.input, bytes32(uint256(0x123)));

    // Expect an error when trying to call a private system from an address that doesn't have access
    _expectAccessDenied(address(0x01), "namespace", "testSystem");
    world.call("namespace", "testSystem", abi.encodeWithSelector(WorldTestSystem.msgSender.selector));

    // Expect the World to have access
    vm.prank(address(world));
    world.call("namespace", "testSystem", abi.encodeWithSelector(WorldTestSystem.msgSender.selector));

    // Expect errors from the system to be forwarded
    vm.expectRevert(abi.encodeWithSelector(WorldTestSystem.WorldTestSystemError.selector, "test error"));
    world.call("namespace", "testSystem", abi.encodeWithSelector(WorldTestSystem.err.selector, "test error"));

    // Register another system in the same namespace
    WorldTestSystem subSystem = new WorldTestSystem();
    world.registerSystem("namespace", "testSubSystem", subSystem, false);

    // Call the subsystem via the World (with access to the base route)
    returnedAddress = abi.decode(
      world.call("namespace", "testSubSystem", abi.encodeWithSelector(WorldTestSystem.msgSender.selector)),
      (address)
    );
    assertEq(returnedAddress, address(this));

    // Call the subsystem via delegatecall from the system
    // (Note: just for testing purposes, in reality systems can call subsystems directly instead of via two indirections like here)
    bytes memory nestedReturndata = world.call(
      "namespace",
      "testSystem",
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
    bytes32 tableId = world.registerTable("", "testTable", Bool.getSchema(), defaultKeySchema);

    // Register a new hook
    IStoreHook tableHook = new WorldTestTableHook();
    world.registerTableHook("", "testTable", tableHook);

    // Prepare data to write to the table
    bytes memory value = abi.encodePacked(true);

    // Expect the hook to be notified when a record is written
    vm.expectEmit(true, true, true, true);
    emit HookCalled(abi.encode(tableId, singletonKey, value));
    world.setRecord(tableId, singletonKey, value);

    // TODO: add tests for other hook methods (onBeforeSetField, onAfterSetField, onDeleteRecord)
    // (See https://github.com/latticexyz/mud/issues/444)
  }

  function testRegisterSystemHook() public view {
    // TODO
  }

  function testWriteRootSystem() public {
    // Register a new table
    bytes32 tableId = world.registerTable("namespace", "testTable", Bool.getSchema(), defaultKeySchema);

    // Register a new system
    WorldTestSystem system = new WorldTestSystem();
    world.registerSystem("", "testSystem", system, false);

    // Call a system function that writes data to the World
    world.call(
      "",
      "testSystem",
      abi.encodeWithSelector(WorldTestSystem.writeData.selector, bytes16("namespace"), bytes16("testTable"), true)
    );

    // Expect the data to be written
    assertTrue(Bool.get(world, tableId));
  }

  function testWriteAutonomousSystem() public {
    // Register a new table
    bytes32 tableId = world.registerTable("namespace", "testTable", Bool.getSchema(), defaultKeySchema);

    // Register a new system
    WorldTestSystem system = new WorldTestSystem();
    world.registerSystem("namespace", "testSystem", system, false);

    // Call a system function that writes data to the World
    world.call(
      "namespace",
      "testSystem",
      abi.encodeWithSelector(WorldTestSystem.writeData.selector, bytes16("namespace"), bytes16("testTable"), true)
    );

    // Expect the data to be written
    assertTrue(Bool.get(world, tableId));
  }

  function testDelegatecallRootSystem() public {
    // Register a new root system
    WorldTestSystem system = new WorldTestSystem();
    world.registerSystem("", "testSystem", system, false);

    // Call the root sysyem
    vm.expectEmit(true, true, true, true);
    emit WorldTestSystemLog("delegatecall");
    world.call("", "testSystem", abi.encodeWithSelector(WorldTestSystem.emitCallType.selector));
  }

  function testCallAutonomousSystem() public {
    // Register a new non-root system
    WorldTestSystem system = new WorldTestSystem();
    world.registerSystem("namespace", "testSystem", system, false);

    // Call the sysyem
    vm.expectEmit(true, true, true, true);
    emit WorldTestSystemLog("call");
    world.call("namespace", "testSystem", abi.encodeWithSelector(WorldTestSystem.emitCallType.selector));
  }

  function testRegisterFunctionSelector() public {
    bytes16 namespace = "testNamespace";
    bytes16 name = "testSystem";

    // Register a new system
    WorldTestSystem system = new WorldTestSystem();
    world.registerSystem(namespace, name, system, true);

    // !gasreport Register a function selector
    bytes4 functionSelector = world.registerFunctionSelector(namespace, name, "msgSender", "()");

    string memory expectedWorldFunctionSignature = "testNamespace_testSystem_msgSender()";
    bytes4 expectedWorldFunctionSelector = bytes4(keccak256(abi.encodePacked(expectedWorldFunctionSignature)));
    assertEq(functionSelector, expectedWorldFunctionSelector, "wrong function selector returned");

    // Call the system via the World with the registered function selector
    (bool success, bytes memory data) = address(world).call(abi.encodePacked(expectedWorldFunctionSelector));

    assertTrue(success, "call failed");
    assertEq(abi.decode(data, (address)), address(this), "wrong address returned");

    // Register a function selector to the error function
    functionSelector = world.registerFunctionSelector(namespace, name, "err", "(string)");

    // Expect errors to be passed through
    vm.expectRevert(abi.encodeWithSelector(WorldTestSystem.WorldTestSystemError.selector, "test error"));
    IWorldTestSystem(address(world)).testNamespace_testSystem_err("test error");
  }

  function testRegisterRootFunctionSelector() public {
    bytes16 namespace = "testNamespace";
    bytes16 name = "testSystem";

    // Register a new system
    WorldTestSystem system = new WorldTestSystem();
    world.registerSystem(namespace, name, system, true);

    bytes4 worldFunc = bytes4(abi.encodeWithSignature("testSelector()"));
    bytes4 sysFunc = WorldTestSystem.msgSender.selector;

    // Expect an error when trying to register a root function selector from an account without access
    _expectAccessDenied(address(0x01), "", "");
    world.registerRootFunctionSelector(namespace, name, worldFunc, sysFunc);

    // Expect the World to be able to register a root function selector
    vm.prank(address(world));
    world.registerRootFunctionSelector(namespace, name, "smth", "smth");

    // !gasreport Register a root function selector
    bytes4 functionSelector = world.registerRootFunctionSelector(namespace, name, worldFunc, sysFunc);

    assertEq(functionSelector, worldFunc, "wrong function selector returned");

    // Call the system via the World with the registered function selector
    (bool success, bytes memory data) = address(world).call(abi.encodePacked(worldFunc));

    assertTrue(success, "call failed");
    assertEq(abi.decode(data, (address)), address(this), "wrong address returned");

    // Register a function selector to the error function
    functionSelector = world.registerRootFunctionSelector(
      namespace,
      name,
      WorldTestSystem.err.selector,
      WorldTestSystem.err.selector
    );

    // Expect errors to be passed through
    vm.expectRevert(abi.encodeWithSelector(WorldTestSystem.WorldTestSystemError.selector, "test error"));
    WorldTestSystem(address(world)).err("test error");
  }

  function testRegisterFallbackSystem() public {
    bytes16 namespace = "testNamespace";
    bytes16 name = "testSystem";

    // Register a new system
    WorldTestSystem system = new WorldTestSystem();
    world.registerSystem(namespace, name, system, true);

    // !gasreport Register a fallback system
    bytes4 funcSelector1 = world.registerFunctionSelector(namespace, name, "", "");

    // Call the system's fallback function
    vm.expectEmit(true, true, true, true);
    emit WorldTestSystemLog("fallback");
    (bool success, bytes memory data) = address(world).call(abi.encodeWithSelector(funcSelector1));
    assertTrue(success, "call failed");

    bytes4 worldFunc = bytes4(abi.encodeWithSignature("testSelector()"));

    // !gasreport Register a root fallback system
    bytes4 funcSelector2 = world.registerRootFunctionSelector(namespace, name, worldFunc, 0);
    assertEq(funcSelector2, worldFunc, "wrong function selector returned");

    // Call the system's fallback function
    vm.expectEmit(true, true, true, true);
    emit WorldTestSystemLog("fallback");
    (success, data) = address(world).call(abi.encodeWithSelector(worldFunc));
    assertTrue(success, "call failed");
  }

  function testPayable() public {
    address alice = makeAddr("alice");
    startHoax(alice, 1 ether);

    // Sanity check: alice has 1 eth, world has 0 eth
    assertEq(alice.balance, 1 ether);
    assertEq(address(world).balance, 0);

    // Send 0.5 eth to the World (without calldata)
    (bool success, ) = address(world).call{ value: 0.5 ether }("");
    assertTrue(success, "transfer should succeed");
    assertEq(alice.balance, 0.5 ether, "alice should have 0.5 ether");
    assertEq(address(world).balance, 0.5 ether, "world should have 0.5 ether");

    // Send 0.5 eth to an invalid function on the World
    (success, ) = address(world).call{ value: 0.5 ether }(abi.encodeWithSignature("invalid()"));
    assertFalse(success, "transfer should fail");
    assertEq(alice.balance, 0.5 ether, "alice should still have 0.5 ether");
    assertEq(address(world).balance, 0.5 ether, "world should still have 0.5 ether");
  }

  function testPayableSystem() public {
    // Register a root system with a payable function in the world
    WorldTestSystem system = new WorldTestSystem();
    bytes16 namespace = "noroot";
    bytes16 name = "testSystem";
    world.registerSystem(namespace, name, system, true);
    world.registerRootFunctionSelector(
      namespace,
      name,
      WorldTestSystem.receiveEther.selector,
      WorldTestSystem.receiveEther.selector
    );

    // create new funded address and impersonate
    address alice = makeAddr("alice");
    startHoax(alice, 1 ether);

    // Sanity check: alice has 1 eth, world has 0 eth, system has 0 eth
    assertEq(alice.balance, 1 ether);
    assertEq(address(world).balance, 0);
    assertEq(address(system).balance, 0);

    // Send 0.5 eth to the system's receiveEther function via the World
    (bool success, ) = address(world).call{ value: 0.5 ether }(
      abi.encodeWithSelector(WorldTestSystem.receiveEther.selector)
    );
    assertTrue(success, "transfer should succeed");
    assertEq(alice.balance, 0.5 ether, "alice should have 0.5 ether");
    assertEq(address(world).balance, 0 ether, "world should still have 0 ether");
    assertEq(address(system).balance, 0.5 ether, "system should have 0.5 ether");
  }

  function testNonPayableSystem() public {
    // Register a root system with a non-payable function in the world
    WorldTestSystem system = new WorldTestSystem();
    bytes16 namespace = "noroot";
    bytes16 name = "testSystem";
    world.registerSystem(namespace, name, system, true);
    world.registerRootFunctionSelector(
      namespace,
      name,
      WorldTestSystem.msgSender.selector,
      WorldTestSystem.msgSender.selector
    );

    // create new funded address and impersonate
    address alice = makeAddr("alice");
    startHoax(alice, 1 ether);

    // Sanity check: alice has 1 eth, world has 0 eth, system has 0 eth
    assertEq(alice.balance, 1 ether);
    assertEq(address(world).balance, 0);
    assertEq(address(system).balance, 0);

    // Send 0.5 eth to the system's msgSender function (non-payable) via the World
    (bool success, ) = address(world).call{ value: 0.5 ether }(
      abi.encodeWithSelector(WorldTestSystem.msgSender.selector)
    );
    assertFalse(success, "transfer should fail");
    assertEq(alice.balance, 1 ether, "alice should have 1 ether");
    assertEq(address(world).balance, 0 ether, "world should have 0 ether");
    assertEq(address(system).balance, 0 ether, "system should have 0 ether");
  }

  function testNonPayableFallbackSystem() public {
    // Register a root system with a non-payable function in the world
    WorldTestSystem system = new WorldTestSystem();
    bytes16 namespace = "noroot";
    bytes16 name = "testSystem";
    world.registerSystem(namespace, name, system, true);
    world.registerRootFunctionSelector(
      namespace,
      name,
      bytes4(abi.encodeWithSignature("systemFallback()")),
      bytes4("")
    );

    // create new funded address and impersonate
    address alice = makeAddr("alice");
    startHoax(alice, 1 ether);

    // Sanity check: alice has 1 eth, world has 0 eth, system has 0 eth
    assertEq(alice.balance, 1 ether);
    assertEq(address(world).balance, 0);
    assertEq(address(system).balance, 0);

    // Send 0.5 eth to the system's fallback function (non-payable) via the World
    (bool success, ) = address(world).call{ value: 0.5 ether }(abi.encodeWithSignature("systemFallback()"));
    assertFalse(success, "transfer should fail");
    assertEq(alice.balance, 1 ether, "alice should have 1 ether");
    assertEq(address(world).balance, 0 ether, "world should have 0 ether");
    assertEq(address(system).balance, 0 ether, "system should have 0 ether");
  }

  function testPayableFallbackSystem() public {
    // Register a root system with a non-payable function in the world
    PayableFallbackSystem system = new PayableFallbackSystem();
    bytes16 namespace = "noroot";
    bytes16 name = "testSystem";
    world.registerSystem(namespace, name, system, true);
    world.registerRootFunctionSelector(
      namespace,
      name,
      bytes4(abi.encodeWithSignature("systemFallback()")),
      bytes4("")
    );

    // create new funded address and impersonate
    address alice = makeAddr("alice");
    startHoax(alice, 1 ether);

    // Sanity check: alice has 1 eth, world has 0 eth, system has 0 eth
    assertEq(alice.balance, 1 ether);
    assertEq(address(world).balance, 0);
    assertEq(address(system).balance, 0);

    // Send 0.5 eth to the system's fallback function (non-payable) via the World
    (bool success, ) = address(world).call{ value: 0.5 ether }(abi.encodeWithSignature("systemFallback()"));
    assertTrue(success, "transfer should fail");
    assertEq(alice.balance, 0.5 ether, "alice should have 0.5 ether");
    assertEq(address(world).balance, 0 ether, "world should have 0 ether");
    assertEq(address(system).balance, 0.5 ether, "system should have 0.5 ether");
  }

  function testPayableRootSystem() public {
    // Register a root system with a payable function in the world
    WorldTestSystem system = new WorldTestSystem();
    bytes16 namespace = "";
    bytes16 name = "testSystem";
    world.registerSystem(namespace, name, system, true);
    world.registerRootFunctionSelector(
      namespace,
      name,
      WorldTestSystem.receiveEther.selector,
      WorldTestSystem.receiveEther.selector
    );

    // create new funded address and impersonate
    address alice = makeAddr("alice");
    startHoax(alice, 1 ether);

    // Sanity check: alice has 1 eth, world has 0 eth, system has 0 eth
    assertEq(alice.balance, 1 ether);
    assertEq(address(world).balance, 0);
    assertEq(address(system).balance, 0);

    // Send 0.5 eth to the system's receiveEther function via the World
    (bool success, ) = address(world).call{ value: 0.5 ether }(
      abi.encodeWithSelector(WorldTestSystem.receiveEther.selector)
    );
    assertTrue(success, "transfer should succeed");
    assertEq(alice.balance, 0.5 ether, "alice should have 0.5 ether");
    assertEq(address(world).balance, 0.5 ether, "world should have 0.5 ether");
    assertEq(address(system).balance, 0 ether, "system should have 0 ether (bc it was delegatecalled)");
  }

  // TODO: add a test for systems writing to tables via the World
  // (see https://github.com/latticexyz/mud/issues/444)
}
