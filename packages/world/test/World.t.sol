// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Test } from "forge-std/Test.sol";
import { GasReporter } from "@latticexyz/gas-report/src/GasReporter.sol";

import { SchemaType } from "@latticexyz/schema-type/src/solidity/SchemaType.sol";

import { IStoreHook, STORE_HOOK_INTERFACE_ID } from "@latticexyz/store/src/IStoreHook.sol";
import { StoreCore, StoreCoreInternal } from "@latticexyz/store/src/StoreCore.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { FieldLayout, FieldLayoutLib } from "@latticexyz/store/src/FieldLayout.sol";
import { FieldLayoutEncodeHelper } from "@latticexyz/store/test/FieldLayoutEncodeHelper.sol";
import { Schema, SchemaLib } from "@latticexyz/store/src/Schema.sol";
import { SchemaEncodeHelper } from "@latticexyz/store/test/SchemaEncodeHelper.sol";
import { Tables, TablesTableId } from "@latticexyz/store/src/codegen/Tables.sol";
import { EncodeArray } from "@latticexyz/store/src/tightcoder/EncodeArray.sol";
import { StoreHookLib } from "@latticexyz/store/src/StoreHook.sol";
import { RevertSubscriber } from "@latticexyz/store/test/RevertSubscriber.sol";
import { EchoSubscriber } from "@latticexyz/store/test/EchoSubscriber.sol";

import { World } from "../src/World.sol";
import { System } from "../src/System.sol";
import { ResourceSelector } from "../src/ResourceSelector.sol";
import { ROOT_NAMESPACE, ROOT_NAME, UNLIMITED_DELEGATION } from "../src/constants.sol";
import { Resource } from "../src/Types.sol";
import { WorldContextProvider, WORLD_CONTEXT_CONSUMER_INTERFACE_ID } from "../src/WorldContext.sol";
import { SystemHookLib, SystemHook } from "../src/SystemHook.sol";
import { Module, MODULE_INTERFACE_ID } from "../src/Module.sol";

import { NamespaceOwner, NamespaceOwnerTableId } from "../src/tables/NamespaceOwner.sol";
import { ResourceAccess } from "../src/tables/ResourceAccess.sol";

import { CoreModule } from "../src/modules/core/CoreModule.sol";
import { Systems } from "../src/modules/core/tables/Systems.sol";
import { SystemRegistry } from "../src/modules/core/tables/SystemRegistry.sol";
import { ResourceType } from "../src/modules/core/tables/ResourceType.sol";

import { IBaseWorld } from "../src/interfaces/IBaseWorld.sol";
import { IWorldErrors } from "../src/interfaces/IWorldErrors.sol";
import { ISystemHook, SYSTEM_HOOK_INTERFACE_ID } from "../src/interfaces/ISystemHook.sol";

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

  function getStoreAddress() public view returns (address) {
    return StoreSwitch.getStoreAddress();
  }

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
    bytes32 tableId = ResourceSelector.from(namespace, name);
    FieldLayout fieldLayout = StoreSwitch.getFieldLayout(tableId);

    if (StoreSwitch.getStoreAddress() == address(this)) {
      StoreCore.setRecord(tableId, key, abi.encodePacked(data), fieldLayout);
    } else {
      IBaseWorld(msg.sender).setRecord(tableId, key, abi.encodePacked(data), fieldLayout);
    }
  }

  function emitCallType() public {
    if (StoreSwitch.getStoreAddress() == address(this)) {
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

contract EchoSystemHook is SystemHook {
  event SystemHookCalled(bytes data);

  function onBeforeCallSystem(address msgSender, bytes32 resourceSelector, bytes memory funcSelectorAndArgs) public {
    emit SystemHookCalled(abi.encode("before", msgSender, resourceSelector, funcSelectorAndArgs));
  }

  function onAfterCallSystem(address msgSender, bytes32 resourceSelector, bytes memory funcSelectorAndArgs) public {
    emit SystemHookCalled(abi.encode("after", msgSender, resourceSelector, funcSelectorAndArgs));
  }
}

contract RevertSystemHook is SystemHook {
  event SystemHookCalled(bytes data);

  function onBeforeCallSystem(address, bytes32, bytes memory) public pure {
    revert("onBeforeCallSystem");
  }

  function onAfterCallSystem(address, bytes32, bytes memory) public pure {
    revert("onAfterCallSystem");
  }
}

contract WorldTest is Test, GasReporter {
  using ResourceSelector for bytes32;

  event HelloWorld();
  event HookCalled(bytes data);
  event SystemHookCalled(bytes data);
  event WorldTestSystemLog(string log);

  Schema defaultKeySchema = SchemaEncodeHelper.encode(SchemaType.BYTES32);
  IBaseWorld world;

  bytes32 key;
  bytes32[] keyTuple;
  bytes32[] singletonKey;

  function setUp() public {
    world = IBaseWorld(address(new World()));
    world.initialize(new CoreModule());

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

  function testConstructorAndInitialize() public {
    CoreModule coreModule = new CoreModule();

    vm.expectEmit(true, true, true, true);
    emit HelloWorld();
    IBaseWorld newWorld = IBaseWorld(address(new World()));

    // Expect the creator to be the original deployer
    assertEq(newWorld.creator(), address(this));

    // Expect calls to initialize to fail if the caller is not the creator
    vm.prank(address(0x4242));
    vm.expectRevert(
      abi.encodeWithSelector(
        IWorldErrors.AccessDenied.selector,
        ResourceSelector.from(ROOT_NAMESPACE).toString(),
        address(0x4242)
      )
    );
    newWorld.initialize(coreModule);

    // Expect the creator to be able to initialize the World
    newWorld.initialize(coreModule);

    // Should have registered the table data table (fka schema table)
    assertEq(Tables.getFieldLayout(newWorld, TablesTableId), FieldLayout.unwrap(Tables.getFieldLayout()));
    assertEq(Tables.getAbiEncodedKeyNames(newWorld, TablesTableId), abi.encode(Tables.getKeyNames()));
    assertEq(Tables.getAbiEncodedFieldNames(newWorld, TablesTableId), abi.encode(Tables.getFieldNames()));

    // Should have registered the namespace owner table
    assertEq(
      Tables.getFieldLayout(newWorld, NamespaceOwnerTableId),
      FieldLayout.unwrap(NamespaceOwner.getFieldLayout())
    );
    assertEq(Tables.getAbiEncodedKeyNames(newWorld, NamespaceOwnerTableId), abi.encode(NamespaceOwner.getKeyNames()));
    assertEq(
      Tables.getAbiEncodedFieldNames(newWorld, NamespaceOwnerTableId),
      abi.encode(NamespaceOwner.getFieldNames())
    );

    // Expect it to not be possible to initialize the World again
    vm.expectRevert(abi.encodeWithSelector(IWorldErrors.WorldAlreadyInitialized.selector));
    newWorld.initialize(coreModule);
  }

  function testRegisterModuleRevertInterfaceNotSupported() public {
    // Expect an error when trying to register a module that doesn't implement the IModule interface
    vm.expectRevert(
      abi.encodeWithSelector(
        IWorldErrors.InterfaceNotSupported.selector,
        Module(address(world)), // The World contract does not implement the IModule interface
        MODULE_INTERFACE_ID
      )
    );
    world.installModule(Module(address(world)), new bytes(0));

    // Expect an error when trying to register a root module that doesn't implement the IModule interface
    vm.expectRevert(
      abi.encodeWithSelector(
        IWorldErrors.InterfaceNotSupported.selector,
        Module(address(world)), // The World contract does not implement the IModule interface
        MODULE_INTERFACE_ID
      )
    );
    world.installRootModule(Module(address(world)), new bytes(0));
  }

  function testRootNamespace() public {
    // Owner of root route should be the creator of the World
    address rootOwner = NamespaceOwner.get(world, ROOT_NAMESPACE);
    assertEq(rootOwner, address(this));

    // The creator of the World should have access to the root namespace
    assertTrue(ResourceAccess.get(world, ROOT_NAMESPACE, address(this)));
  }

  function testStoreAddress() public {
    // Register a system and use it to get storeAddress
    WorldTestSystem system = new WorldTestSystem();
    bytes32 resourceSelector = ResourceSelector.from("namespace", "testSystem");

    world.registerSystem(resourceSelector, system, false);
    bytes memory result = world.call(
      resourceSelector,
      abi.encodeWithSelector(WorldTestSystem.getStoreAddress.selector)
    );

    assertEq(abi.decode(result, (address)), address(world));
  }

  function testRegisterNamespace() public {
    startGasReport("Register a new namespace");
    world.registerNamespace("test");
    endGasReport();

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

  function testTransferNamespace() public {
    world.registerNamespace("testTransfer");

    // Expect the new owner to not be namespace owner before transfer
    assertFalse(
      (NamespaceOwner.get(world, "testTransfer") == address(1)),
      "new owner should not be namespace owner before transfer"
    );
    // Expect the new owner to not have access before transfer
    assertEq(
      ResourceAccess.get(world, "testTransfer", address(1)),
      false,
      "new owner should not have access before transfer"
    );

    world.transferOwnership("testTransfer", address(1));
    // Expect the new owner to be namespace owner
    assertEq(NamespaceOwner.get(world, "testTransfer"), address(1), "new owner should be namespace owner");
    // Expect the new owner to have access
    assertEq(ResourceAccess.get(world, "testTransfer", address(1)), true, "new owner should have access");
    // Expect previous owner to no longer be owner
    assertFalse(
      (NamespaceOwner.get(world, "testTransfer") == address(this)),
      "caller should no longer be namespace owner"
    );
    // Expect previous owner to no longer have access
    assertEq(ResourceAccess.get(world, "testTransfer", address(this)), false, "caller should no longer have access");
    // Expect revert if caller is not the owner
    _expectAccessDenied(address(this), "testTransfer", 0);
    world.transferOwnership("testTransfer", address(1));
  }

  function testRegisterTable() public {
    FieldLayout fieldLayout = FieldLayoutEncodeHelper.encode(1, 32, 1);
    Schema valueSchema = SchemaEncodeHelper.encode(SchemaType.BOOL, SchemaType.UINT256, SchemaType.STRING);
    bytes16 namespace = "testNamespace";
    bytes16 tableName = "testTable";
    bytes32 tableSelector = ResourceSelector.from(namespace, tableName);
    string[] memory keyNames = new string[](1);
    keyNames[0] = "key1";
    string[] memory fieldNames = new string[](3);
    fieldNames[0] = "value1";
    fieldNames[1] = "value2";
    fieldNames[2] = "value3";

    startGasReport("Register a new table in the namespace");
    world.registerTable(tableSelector, fieldLayout, defaultKeySchema, valueSchema, keyNames, fieldNames);
    endGasReport();

    // Expect the namespace to be created and owned by the caller
    assertEq(NamespaceOwner.get(world, namespace), address(this), "namespace should be created by caller");

    // Expect the table to be registered
    assertEq(world.getFieldLayout(tableSelector).unwrap(), fieldLayout.unwrap(), "value schema should be registered");

    bytes memory loadedKeyNames = Tables.getAbiEncodedKeyNames(world, tableSelector);
    assertEq(loadedKeyNames, abi.encode(keyNames), "key names should be registered");

    bytes memory loadedfieldNames = Tables.getAbiEncodedFieldNames(world, tableSelector);
    assertEq(loadedfieldNames, abi.encode(fieldNames), "value names should be registered");

    // Expect an error when registering an existing table
    vm.expectRevert(abi.encodeWithSelector(IWorldErrors.ResourceExists.selector, tableSelector.toString()));
    world.registerTable(tableSelector, fieldLayout, defaultKeySchema, valueSchema, keyNames, fieldNames);

    // Expect an error when registering a table in a namespace that is not owned by the caller
    bytes32 otherTableSelector = ResourceSelector.from(namespace, "otherTable");
    _expectAccessDenied(address(0x01), namespace, "");
    world.registerTable(otherTableSelector, fieldLayout, defaultKeySchema, valueSchema, keyNames, fieldNames);

    // Expect the World to not be allowed to call registerTable via an external call
    _expectAccessDenied(address(world), namespace, "");
    world.registerTable(otherTableSelector, fieldLayout, defaultKeySchema, valueSchema, keyNames, fieldNames);
  }

  function testRegisterSystem() public {
    System system = new System();
    bytes16 namespace = "";
    bytes16 name = "testSystem";
    bytes32 resourceSelector = ResourceSelector.from(namespace, name);

    // !gasrepot Register a new system
    world.registerSystem(resourceSelector, system, false);

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
    world.registerSystem(ResourceSelector.from("newNamespace", "testSystem"), new System(), false);
    assertEq(NamespaceOwner.get(world, "newNamespace"), address(this));

    // Expect an error when registering an existing system at a new resource selector
    vm.expectRevert(abi.encodeWithSelector(IWorldErrors.SystemExists.selector, address(system)));
    world.registerSystem(ResourceSelector.from("", "newSystem"), system, true);

    // Don't expect an error when updating the public access of an existing system
    world.registerSystem(resourceSelector, system, true);

    // Expect an error when registering a system at an existing resource selector of a different type
    System newSystem = new System();
    bytes32 tableId = ResourceSelector.from("", "testTable");
    world.registerTable(
      tableId,
      Bool.getFieldLayout(),
      defaultKeySchema,
      Bool.getValueSchema(),
      new string[](1),
      new string[](1)
    );
    vm.expectRevert(abi.encodeWithSelector(IWorldErrors.ResourceExists.selector, tableId.toString()));
    world.registerSystem(tableId, newSystem, true);

    // Expect an error when registering a system in a namespace is not owned by the caller
    System yetAnotherSystem = new System();
    _expectAccessDenied(address(0x01), "", "");
    world.registerSystem(ResourceSelector.from("", "rootSystem"), yetAnotherSystem, true);

    // Expect the registration to fail when coming from the World (since the World address doesn't have access)
    _expectAccessDenied(address(world), "", "");
    world.registerSystem(ResourceSelector.from("", "rootSystem"), yetAnotherSystem, true);

    // Expect the registration to fail if the provided address does not implement the WorldContextConsumer interface
    vm.expectRevert(
      abi.encodeWithSelector(
        IWorldErrors.InterfaceNotSupported.selector,
        address(world),
        WORLD_CONTEXT_CONSUMER_INTERFACE_ID
      )
    );
    world.registerSystem(ResourceSelector.from("someNamespace", "invalidSystem"), System(address(world)), true);
  }

  function testUpgradeSystem() public {
    bytes16 namespace = "testNamespace";
    bytes16 systemName = "testSystem";
    bytes32 systemId = ResourceSelector.from(namespace, systemName);

    // Register a system
    System oldSystem = new System();
    world.registerSystem(systemId, oldSystem, true);

    // Upgrade the system and set public access to false
    System newSystem = new System();
    world.registerSystem(systemId, newSystem, false);

    // Expect the system address and public access to be updated in the System table
    (address registeredAddress, bool publicAccess) = Systems.get(world, systemId);
    assertEq(registeredAddress, address(newSystem));
    assertEq(publicAccess, false);

    // Expect the SystemRegistry table to not have a reference to the old system anymore
    bytes32 registeredSystemId = SystemRegistry.get(world, address(oldSystem));
    assertEq(registeredSystemId, bytes32(0));

    // Expect the SystemRegistry table to have a reference to the new system
    registeredSystemId = SystemRegistry.get(world, address(newSystem));
    assertEq(registeredSystemId, systemId);

    // Expect the old system to not have access to the namespace anymore
    assertFalse(ResourceAccess.get(world, namespace, address(oldSystem)));

    // Expect the new system to have access to the namespace
    assertTrue(ResourceAccess.get(world, namespace, address(newSystem)));

    // Expect the resource type to still be SYSTEM
    assertEq(uint8(ResourceType.get(world, systemId)), uint8(Resource.SYSTEM));
  }

  function testDuplicateSelectors() public {
    // Register a new table
    bytes32 resourceSelector = ResourceSelector.from("namespace", "name");
    world.registerTable(
      resourceSelector,
      Bool.getFieldLayout(),
      defaultKeySchema,
      Bool.getValueSchema(),
      new string[](1),
      new string[](1)
    );

    // Deploy a new system
    System system = new System();

    // Expect an error when trying to register a system at the same selector
    vm.expectRevert(abi.encodeWithSelector(IWorldErrors.ResourceExists.selector, resourceSelector.toString()));
    world.registerSystem(resourceSelector, system, false);

    // Register a new system
    bytes32 resourceSelector2 = ResourceSelector.from("namespace2", "name");
    world.registerSystem(resourceSelector2, new System(), false);

    // Expect an error when trying to register a table at the same selector
    vm.expectRevert(abi.encodeWithSelector(IWorldErrors.ResourceExists.selector, resourceSelector2.toString()));
    world.registerTable(
      resourceSelector2,
      Bool.getFieldLayout(),
      defaultKeySchema,
      Bool.getValueSchema(),
      new string[](1),
      new string[](1)
    );
  }

  function testGrantAccess() public {
    // TODO
  }

  function testRevokeAccess() public {
    // TODO
  }

  function testSetRecord() public {
    bytes32 tableId = ResourceSelector.from("testSetRecord", "testTable");
    // Register a new table
    world.registerTable(
      tableId,
      Bool.getFieldLayout(),
      defaultKeySchema,
      Bool.getValueSchema(),
      new string[](1),
      new string[](1)
    );

    startGasReport("Write data to the table");
    Bool.set(world, tableId, true);
    endGasReport();

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
    bytes32 tableId = ResourceSelector.from(namespace, name);
    FieldLayout fieldLayout = Bool.getFieldLayout();
    Schema valueSchema = Bool.getValueSchema();

    // Register a new table
    world.registerTable(tableId, fieldLayout, defaultKeySchema, valueSchema, new string[](1), new string[](1));

    startGasReport("Write data to a table field");
    world.setField(tableId, singletonKey, 0, abi.encodePacked(true), fieldLayout);
    endGasReport();

    // Expect the data to be written
    assertTrue(Bool.get(world, tableId));

    // Write data to the table via its tableId
    world.setField(tableId, singletonKey, 0, abi.encodePacked(false), fieldLayout);

    // Expect the data to be written
    assertFalse(Bool.get(world, tableId));

    // Expect an error when trying to write from an address that doesn't have access when calling via the namespace
    _expectAccessDenied(address(0x01), "testSetField", "testTable");
    world.setField(tableId, singletonKey, 0, abi.encodePacked(true), fieldLayout);

    // Expect an error when trying to write from an address that doesn't have access when calling via the tableId
    _expectAccessDenied(address(0x01), "testSetField", "testTable");
    world.setField(tableId, singletonKey, 0, abi.encodePacked(true), fieldLayout);

    // Expect the World to have access
    vm.prank(address(world));
    world.setField(tableId, singletonKey, 0, abi.encodePacked(true), fieldLayout);
  }

  function testPushToField() public {
    bytes16 namespace = "testPushToField";
    bytes16 name = "testTable";
    bytes32 tableId = ResourceSelector.from(namespace, name);
    FieldLayout fieldLayout = AddressArray.getFieldLayout();
    Schema valueSchema = AddressArray.getValueSchema();

    // Register a new table
    world.registerTable(tableId, fieldLayout, defaultKeySchema, valueSchema, new string[](1), new string[](1));

    // Create data
    address[] memory dataToPush = new address[](3);
    dataToPush[0] = address(0x01);
    dataToPush[1] = address(bytes20(keccak256("some address")));
    dataToPush[2] = address(bytes20(keccak256("another address")));
    bytes memory encodedData = EncodeArray.encode(dataToPush);

    startGasReport("Push data to the table");
    world.pushToField(tableId, keyTuple, 0, encodedData, fieldLayout);
    endGasReport();

    // Expect the data to be written
    assertEq(AddressArray.get(world, tableId, key), dataToPush);

    // Delete the data
    world.deleteRecord(tableId, keyTuple, fieldLayout);

    // Push data to the table via direct access
    world.pushToField(tableId, keyTuple, 0, encodedData, fieldLayout);

    // Expect the data to be written
    assertEq(AddressArray.get(world, tableId, key), dataToPush);

    // Expect an error when trying to write from an address that doesn't have access
    _expectAccessDenied(address(0x01), namespace, name);
    world.pushToField(tableId, keyTuple, 0, encodedData, fieldLayout);

    // Expect the World to have access
    vm.prank(address(world));
    world.pushToField(tableId, keyTuple, 0, encodedData, fieldLayout);
  }

  function testDeleteRecord() public {
    bytes16 namespace = "testDeleteRecord";
    bytes16 name = "testTable";
    bytes32 tableId = ResourceSelector.from(namespace, name);
    FieldLayout fieldLayout = Bool.getFieldLayout();
    Schema valueSchema = Bool.getValueSchema();

    // Register a new table
    world.registerTable(tableId, fieldLayout, defaultKeySchema, valueSchema, new string[](1), new string[](1));

    // Write data to the table via the namespace and expect it to be written
    world.setRecord(tableId, singletonKey, abi.encodePacked(true), fieldLayout);
    assertTrue(Bool.get(world, tableId));

    startGasReport("Delete record");
    world.deleteRecord(tableId, singletonKey, fieldLayout);
    endGasReport();

    // expect it to be deleted
    assertFalse(Bool.get(world, tableId));

    // Write data to the table via the namespace and expect it to be written
    world.setRecord(tableId, singletonKey, abi.encodePacked(true), fieldLayout);
    assertTrue(Bool.get(world, tableId));

    // Delete the record via the tableId and expect it to be deleted
    world.deleteRecord(tableId, singletonKey, fieldLayout);
    assertFalse(Bool.get(world, tableId));

    // Write data to the table via the namespace and expect it to be written
    world.setRecord(tableId, singletonKey, abi.encodePacked(true), fieldLayout);
    assertTrue(Bool.get(world, tableId));

    // Expect an error when trying to delete from an address that doesn't have access
    _expectAccessDenied(address(0x02), "testDeleteRecord", "testTable");
    world.deleteRecord(tableId, singletonKey, fieldLayout);

    // Expect the World to have access
    vm.prank(address(world));
    world.deleteRecord(tableId, singletonKey, fieldLayout);
  }

  function testCall() public {
    // Register a new system
    WorldTestSystem system = new WorldTestSystem();
    bytes32 resourceSelector = ResourceSelector.from("namespace", "testSystem");
    world.registerSystem(resourceSelector, system, false);

    // Call a system function without arguments via the World
    startGasReport("call a system via the World");
    bytes memory result = world.call(resourceSelector, abi.encodeWithSelector(WorldTestSystem.msgSender.selector));
    endGasReport();

    // Expect the system to have received the caller's address
    assertEq(address(uint160(uint256(bytes32(result)))), address(this));

    // Call a system function with arguments via the World
    result = world.call(
      resourceSelector,
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
    world.call(resourceSelector, abi.encodeWithSelector(WorldTestSystem.msgSender.selector));

    // Expect the World to have access
    vm.prank(address(world));
    world.call(resourceSelector, abi.encodeWithSelector(WorldTestSystem.msgSender.selector));

    // Expect errors from the system to be forwarded
    vm.expectRevert(abi.encodeWithSelector(WorldTestSystem.WorldTestSystemError.selector, "test error"));
    world.call(resourceSelector, abi.encodeWithSelector(WorldTestSystem.err.selector, "test error"));

    // Register another system in the same namespace
    WorldTestSystem subSystem = new WorldTestSystem();
    bytes32 subsystemResourceSelector = ResourceSelector.from("namespace", "testSubSystem");
    world.registerSystem(subsystemResourceSelector, subSystem, false);

    // Call the subsystem via the World (with access to the base route)
    returnedAddress = abi.decode(
      world.call(subsystemResourceSelector, abi.encodeWithSelector(WorldTestSystem.msgSender.selector)),
      (address)
    );
    assertEq(returnedAddress, address(this));

    // Call the subsystem via delegatecall from the system
    // (Note: just for testing purposes, in reality systems can call subsystems directly instead of via two indirections like here)
    bytes memory nestedReturndata = world.call(
      resourceSelector,
      abi.encodeWithSelector(
        WorldTestSystem.delegateCallSubSystem.selector, // Function in system
        address(subSystem), // Address of subsystem
        WorldContextProvider.appendContext({
          funcSelectorAndArgs: abi.encodeWithSelector(WorldTestSystem.msgSender.selector),
          msgSender: address(this),
          msgValue: uint256(0)
        })
      )
    );

    returnedAddress = abi.decode(abi.decode(nestedReturndata, (bytes)), (address));
    assertEq(returnedAddress, address(this), "subsystem returned wrong address");
  }

  function testCallFromSelf() public {
    // Register a new system
    WorldTestSystem system = new WorldTestSystem();
    bytes32 resourceSelector = ResourceSelector.from("namespace", "testSystem");
    world.registerSystem(resourceSelector, system, true);

    address caller = address(1);

    // Call a system via callFrom with the own address
    vm.prank(caller);
    bytes memory returnData = world.callFrom(
      caller,
      resourceSelector,
      abi.encodeWithSelector(WorldTestSystem.msgSender.selector)
    );
    address returnedAddress = abi.decode(returnData, (address));

    // Expect the system to have received the delegator's address
    assertEq(returnedAddress, caller);
  }

  function testCallFromUnlimitedDelegation() public {
    // Register a new system
    WorldTestSystem system = new WorldTestSystem();
    bytes32 resourceSelector = ResourceSelector.from("namespace", "testSystem");
    world.registerSystem(resourceSelector, system, true);

    // Register an unlimited delegation
    address delegator = address(1);
    address delegatee = address(2);
    vm.prank(delegator);
    startGasReport("register an unlimited delegation");
    world.registerDelegation(delegatee, UNLIMITED_DELEGATION, new bytes(0));
    endGasReport();

    // Call a system from the delegatee on behalf of the delegator
    vm.prank(delegatee);
    startGasReport("call a system via an unlimited delegation");
    bytes memory returnData = world.callFrom(
      delegator,
      resourceSelector,
      abi.encodeWithSelector(WorldTestSystem.msgSender.selector)
    );
    endGasReport();
    address returnedAddress = abi.decode(returnData, (address));

    // Expect the system to have received the delegator's address
    assertEq(returnedAddress, delegator);
  }

  function testCallFromFailDelegationNotFound() public {
    // Register a new system
    WorldTestSystem system = new WorldTestSystem();
    bytes32 resourceSelector = ResourceSelector.from("namespace", "testSystem");
    world.registerSystem(resourceSelector, system, true);

    // Expect a revert when attempting to perform a call on behalf of an address that doesn't have a delegation
    vm.expectRevert(
      abi.encodeWithSelector(
        IWorldErrors.DelegationNotFound.selector,
        address(2), // Delegator
        address(1) // Delegatee
      )
    );
    vm.prank(address(1));
    world.callFrom(address(2), resourceSelector, abi.encodeWithSelector(WorldTestSystem.msgSender.selector));
  }

  function testCallFromLimitedDelegation() public {
    // Register a new system
    WorldTestSystem system = new WorldTestSystem();
    bytes32 resourceSelector = ResourceSelector.from("namespace", "testSystem");
    world.registerSystem(resourceSelector, system, true);

    // Register a limited delegation
    address delegator = address(1);
    address delegatee = address(2);
    vm.prank(delegator);
    world.registerDelegation(delegatee, UNLIMITED_DELEGATION, new bytes(0));
  }

  function testRegisterStoreHook() public {
    FieldLayout fieldLayout = Bool.getFieldLayout();
    Schema valueSchema = Bool.getValueSchema();
    bytes32 tableId = ResourceSelector.from("", "testTable");

    // Register a new table
    world.registerTable(tableId, fieldLayout, defaultKeySchema, valueSchema, new string[](1), new string[](1));

    // Register a new hook
    IStoreHook tableHook = new EchoSubscriber();
    world.registerStoreHook(
      tableId,
      tableHook,
      StoreHookLib.encodeBitmap({
        onBeforeSetRecord: true,
        onAfterSetRecord: true,
        onBeforeSetField: true,
        onAfterSetField: true,
        onBeforeDeleteRecord: true,
        onAfterDeleteRecord: true
      })
    );

    // Prepare data to write to the table
    bytes memory value = abi.encodePacked(true);

    // Expect the hook to be notified when a record is written (once before and once after the record is written)
    vm.expectEmit(true, true, true, true);
    emit HookCalled(abi.encode(tableId, singletonKey, value, fieldLayout));

    vm.expectEmit(true, true, true, true);
    emit HookCalled(abi.encode(tableId, singletonKey, value, fieldLayout));

    world.setRecord(tableId, singletonKey, value, fieldLayout);

    // Expect the hook to be notified when a field is written (once before and once after the field is written)
    vm.expectEmit(true, true, true, true);
    emit HookCalled(abi.encode(tableId, singletonKey, uint8(0), value, fieldLayout));

    vm.expectEmit(true, true, true, true);
    emit HookCalled(abi.encode(tableId, singletonKey, uint8(0), value, fieldLayout));

    world.setField(tableId, singletonKey, 0, value, fieldLayout);

    // Expect the hook to be notified when a record is deleted (once before and once after the field is written)
    vm.expectEmit(true, true, true, true);
    emit HookCalled(abi.encode(tableId, singletonKey, fieldLayout));

    vm.expectEmit(true, true, true, true);
    emit HookCalled(abi.encode(tableId, singletonKey, fieldLayout));

    world.deleteRecord(tableId, singletonKey, fieldLayout);

    // Expect an error when trying to register an address that doesn't implement the IStoreHook interface
    vm.expectRevert(
      abi.encodeWithSelector(IWorldErrors.InterfaceNotSupported.selector, address(world), STORE_HOOK_INTERFACE_ID)
    );
    world.registerStoreHook(
      tableId,
      IStoreHook(address(world)), // the World contract does not implement the store hook interface
      StoreHookLib.encodeBitmap({
        onBeforeSetRecord: true,
        onAfterSetRecord: true,
        onBeforeSetField: true,
        onAfterSetField: true,
        onBeforeDeleteRecord: true,
        onAfterDeleteRecord: true
      })
    );
  }

  function testUnregisterStoreHook() public {
    FieldLayout fieldLayout = Bool.getFieldLayout();
    Schema valueSchema = Bool.getValueSchema();
    bytes32 tableId = ResourceSelector.from("", "testTable");

    // Register a new table
    world.registerTable(tableId, fieldLayout, defaultKeySchema, valueSchema, new string[](1), new string[](1));

    // Register a new RevertSubscriber
    IStoreHook revertSubscriber = new RevertSubscriber();
    world.registerStoreHook(
      tableId,
      revertSubscriber,
      StoreHookLib.encodeBitmap({
        onBeforeSetRecord: true,
        onAfterSetRecord: true,
        onBeforeSetField: true,
        onAfterSetField: true,
        onBeforeDeleteRecord: true,
        onAfterDeleteRecord: true
      })
    );
    // Register a new EchoSubscriber
    IStoreHook echoSubscriber = new EchoSubscriber();
    world.registerStoreHook(
      tableId,
      echoSubscriber,
      StoreHookLib.encodeBitmap({
        onBeforeSetRecord: true,
        onAfterSetRecord: true,
        onBeforeSetField: true,
        onAfterSetField: true,
        onBeforeDeleteRecord: true,
        onAfterDeleteRecord: true
      })
    );

    // Prepare data to write to the table
    bytes memory value = abi.encodePacked(true);

    // Expect a revert when the RevertSubscriber's onBeforeSetRecord hook is called
    vm.expectRevert(bytes("onBeforeSetRecord"));
    world.setRecord(tableId, singletonKey, value, fieldLayout);

    // Expect a revert when the RevertSubscriber's onBeforeSetField hook is called
    vm.expectRevert(bytes("onBeforeSetField"));
    world.setField(tableId, singletonKey, 0, value, fieldLayout);

    // Expect a revert when the RevertSubscriber's onBeforeDeleteRecord hook is called
    vm.expectRevert(bytes("onBeforeDeleteRecord"));
    world.deleteRecord(tableId, singletonKey, fieldLayout);

    // Unregister the RevertSubscriber
    world.unregisterStoreHook(tableId, revertSubscriber);

    // Expect the hook to be notified when a record is written (once before and once after the record is written)
    vm.expectEmit(true, true, true, true);
    emit HookCalled(abi.encode(tableId, singletonKey, value, fieldLayout));

    vm.expectEmit(true, true, true, true);
    emit HookCalled(abi.encode(tableId, singletonKey, value, fieldLayout));

    world.setRecord(tableId, singletonKey, value, fieldLayout);

    // Expect the hook to be notified when a field is written (once before and once after the field is written)
    vm.expectEmit(true, true, true, true);
    emit HookCalled(abi.encode(tableId, singletonKey, uint8(0), value, fieldLayout));

    vm.expectEmit(true, true, true, true);
    emit HookCalled(abi.encode(tableId, singletonKey, uint8(0), value, fieldLayout));

    world.setField(tableId, singletonKey, 0, value, fieldLayout);

    // Expect the hook to be notified when a record is deleted (once before and once after the field is written)
    vm.expectEmit(true, true, true, true);
    emit HookCalled(abi.encode(tableId, singletonKey, fieldLayout));

    vm.expectEmit(true, true, true, true);
    emit HookCalled(abi.encode(tableId, singletonKey, fieldLayout));

    world.deleteRecord(tableId, singletonKey, fieldLayout);
  }

  function testRegisterSystemHook() public {
    bytes32 systemId = ResourceSelector.from("namespace", "testTable");

    // Register a new system
    WorldTestSystem system = new WorldTestSystem();
    world.registerSystem(systemId, system, false);

    // Expect the registration to fail if the contract does not implement the system hook interface
    vm.expectRevert(
      abi.encodeWithSelector(IWorldErrors.InterfaceNotSupported.selector, address(world), SYSTEM_HOOK_INTERFACE_ID)
    );
    world.registerSystemHook(
      systemId,
      ISystemHook(address(world)), // the World contract does not implement the system hook interface
      SystemHookLib.encodeBitmap({ onBeforeCallSystem: true, onAfterCallSystem: true })
    );

    // Register a new hook
    ISystemHook systemHook = new EchoSystemHook();
    world.registerSystemHook(
      systemId,
      systemHook,
      SystemHookLib.encodeBitmap({ onBeforeCallSystem: true, onAfterCallSystem: true })
    );

    bytes memory funcSelectorAndArgs = abi.encodeWithSelector(bytes4(keccak256("fallbackselector")));

    // Expect the hooks to be called in correct order
    vm.expectEmit(true, true, true, true);
    emit SystemHookCalled(abi.encode("before", address(this), systemId, funcSelectorAndArgs));

    vm.expectEmit(true, true, true, true);
    emit WorldTestSystemLog("fallback");

    vm.expectEmit(true, true, true, true);
    emit SystemHookCalled(abi.encode("after", address(this), systemId, funcSelectorAndArgs));

    // Call a system fallback function without arguments via the World
    world.call(systemId, funcSelectorAndArgs);
  }

  function testUnregisterSystemHook() public {
    bytes32 systemId = ResourceSelector.from("namespace", "testTable");

    // Register a new system
    WorldTestSystem system = new WorldTestSystem();
    world.registerSystem(systemId, system, false);

    // Register a new RevertSystemHook
    ISystemHook revertSystemHook = new RevertSystemHook();
    world.registerSystemHook(
      systemId,
      revertSystemHook,
      SystemHookLib.encodeBitmap({ onBeforeCallSystem: true, onAfterCallSystem: true })
    );

    // Register a new EchoSystemHook
    ISystemHook echoSystemHook = new EchoSystemHook();
    world.registerSystemHook(
      systemId,
      echoSystemHook,
      SystemHookLib.encodeBitmap({ onBeforeCallSystem: true, onAfterCallSystem: true })
    );

    bytes memory funcSelectorAndArgs = abi.encodeWithSelector(bytes4(keccak256("fallbackselector")));

    // Expect calls to fail while the RevertSystemHook is registered
    vm.expectRevert(bytes("onBeforeCallSystem"));
    world.call(systemId, funcSelectorAndArgs);

    // Unregister the RevertSystemHook
    world.unregisterSystemHook(systemId, revertSystemHook);

    // Expect the echo hooks to be called in correct order
    vm.expectEmit(true, true, true, true);
    emit SystemHookCalled(abi.encode("before", address(this), systemId, funcSelectorAndArgs));

    vm.expectEmit(true, true, true, true);
    emit WorldTestSystemLog("fallback");

    vm.expectEmit(true, true, true, true);
    emit SystemHookCalled(abi.encode("after", address(this), systemId, funcSelectorAndArgs));

    // Call a system fallback function without arguments via the World
    world.call(systemId, funcSelectorAndArgs);
  }

  function testWriteRootSystem() public {
    bytes32 tableId = ResourceSelector.from("namespace", "testTable");
    // Register a new table
    world.registerTable(
      tableId,
      Bool.getFieldLayout(),
      defaultKeySchema,
      Bool.getValueSchema(),
      new string[](1),
      new string[](1)
    );

    // Register a new system
    bytes32 rootSystemId = ResourceSelector.from("", "testSystem");
    WorldTestSystem system = new WorldTestSystem();
    world.registerSystem(rootSystemId, system, false);

    // Call a system function that writes data to the World
    world.call(
      rootSystemId,
      abi.encodeWithSelector(WorldTestSystem.writeData.selector, bytes16("namespace"), bytes16("testTable"), true)
    );

    // Expect the data to be written
    assertTrue(Bool.get(world, tableId));
  }

  function testWriteAutonomousSystem() public {
    bytes32 tableId = ResourceSelector.from("namespace", "testTable");
    // Register a new table
    world.registerTable(
      tableId,
      Bool.getFieldLayout(),
      defaultKeySchema,
      Bool.getValueSchema(),
      new string[](1),
      new string[](1)
    );

    // Register a new system
    bytes32 systemId = ResourceSelector.from("namespace", "testSystem");
    WorldTestSystem system = new WorldTestSystem();
    world.registerSystem(systemId, system, false);

    // Call a system function that writes data to the World
    world.call(
      systemId,
      abi.encodeWithSelector(WorldTestSystem.writeData.selector, bytes16("namespace"), bytes16("testTable"), true)
    );

    // Expect the data to be written
    assertTrue(Bool.get(world, tableId));
  }

  function testDelegatecallRootSystem() public {
    bytes32 resourceSelector = ResourceSelector.from("", "testSystem");
    // Register a new root system
    WorldTestSystem system = new WorldTestSystem();
    world.registerSystem(resourceSelector, system, false);

    // Call the root sysyem
    vm.expectEmit(true, true, true, true);
    emit WorldTestSystemLog("delegatecall");
    world.call(resourceSelector, abi.encodeWithSelector(WorldTestSystem.emitCallType.selector));
  }

  function testCallAutonomousSystem() public {
    bytes32 resourceSelector = ResourceSelector.from("namespace", "testSystem");
    // Register a new non-root system
    WorldTestSystem system = new WorldTestSystem();
    world.registerSystem(resourceSelector, system, false);

    // Call the sysyem
    vm.expectEmit(true, true, true, true);
    emit WorldTestSystemLog("call");
    world.call(resourceSelector, abi.encodeWithSelector(WorldTestSystem.emitCallType.selector));
  }

  function testRegisterFunctionSelector() public {
    bytes16 namespace = "testNamespace";
    bytes16 name = "testSystem";
    bytes32 resourceSelector = ResourceSelector.from(namespace, name);

    // Register a new system
    WorldTestSystem system = new WorldTestSystem();
    world.registerSystem(resourceSelector, system, true);

    startGasReport("Register a function selector");
    bytes4 functionSelector = world.registerFunctionSelector(resourceSelector, "msgSender", "()");
    endGasReport();

    string memory expectedWorldFunctionSignature = "testNamespace_testSystem_msgSender()";
    bytes4 expectedWorldFunctionSelector = bytes4(keccak256(abi.encodePacked(expectedWorldFunctionSignature)));
    assertEq(functionSelector, expectedWorldFunctionSelector, "wrong function selector returned");

    // Call the system via the World with the registered function selector
    (bool success, bytes memory data) = address(world).call(abi.encodePacked(expectedWorldFunctionSelector));

    assertTrue(success, "call failed");
    assertEq(abi.decode(data, (address)), address(this), "wrong address returned");

    // Register a function selector to the error function
    functionSelector = world.registerFunctionSelector(resourceSelector, "err", "(string)");

    // Expect errors to be passed through
    vm.expectRevert(abi.encodeWithSelector(WorldTestSystem.WorldTestSystemError.selector, "test error"));
    IWorldTestSystem(address(world)).testNamespace_testSystem_err("test error");
  }

  function testRegisterRootFunctionSelector() public {
    bytes16 namespace = "testNamespace";
    bytes16 name = "testSystem";
    bytes32 resourceSelector = ResourceSelector.from(namespace, name);

    // Register a new system
    WorldTestSystem system = new WorldTestSystem();
    world.registerSystem(resourceSelector, system, true);

    bytes4 worldFunc = bytes4(abi.encodeWithSignature("testSelector()"));
    bytes4 sysFunc = WorldTestSystem.msgSender.selector;

    // Expect an error when trying to register a root function selector from an account without access
    _expectAccessDenied(address(0x01), "", "");
    world.registerRootFunctionSelector(resourceSelector, worldFunc, sysFunc);

    // Expect the World to not be able to register a root function selector when calling the function externally
    _expectAccessDenied(address(world), "", "");
    world.registerRootFunctionSelector(resourceSelector, "smth", "smth");

    startGasReport("Register a root function selector");
    bytes4 functionSelector = world.registerRootFunctionSelector(resourceSelector, worldFunc, sysFunc);
    endGasReport();

    assertEq(functionSelector, worldFunc, "wrong function selector returned");

    // Call the system via the World with the registered function selector
    (bool success, bytes memory data) = address(world).call(abi.encodePacked(worldFunc));

    assertTrue(success, "call failed");
    assertEq(abi.decode(data, (address)), address(this), "wrong address returned");

    // Register a function selector to the error function
    functionSelector = world.registerRootFunctionSelector(
      resourceSelector,
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
    bytes32 resourceSelector = ResourceSelector.from(namespace, name);

    // Register a new system
    WorldTestSystem system = new WorldTestSystem();
    world.registerSystem(resourceSelector, system, true);

    startGasReport("Register a fallback system");
    bytes4 funcSelector1 = world.registerFunctionSelector(resourceSelector, "", "");
    endGasReport();

    // Call the system's fallback function
    vm.expectEmit(true, true, true, true);
    emit WorldTestSystemLog("fallback");
    (bool success, bytes memory data) = address(world).call(abi.encodeWithSelector(funcSelector1));
    assertTrue(success, "call failed");

    bytes4 worldFunc = bytes4(abi.encodeWithSignature("testSelector()"));

    startGasReport("Register a root fallback system");
    bytes4 funcSelector2 = world.registerRootFunctionSelector(resourceSelector, worldFunc, 0);
    endGasReport();

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
    bytes32 resourceSelector = ResourceSelector.from(namespace, name);

    world.registerSystem(resourceSelector, system, true);
    world.registerRootFunctionSelector(
      resourceSelector,
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
    assertEq(address(system).balance, 0 ether, "system should have 0 ether");
  }

  function testNonPayableSystem() public {
    // Register a non-root system with a non-payable function in the world
    WorldTestSystem system = new WorldTestSystem();
    bytes16 namespace = "noroot";
    bytes16 name = "testSystem";
    bytes32 resourceSelector = ResourceSelector.from(namespace, name);
    world.registerSystem(resourceSelector, system, true);
    world.registerRootFunctionSelector(
      resourceSelector,
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
    // The call should succeed because the value is not forwarded to the system
    assertTrue(success, "transfer should succeed");
    assertEq(alice.balance, 0.5 ether, "alice should have 0.5 ether");
    assertEq(address(world).balance, 0.5 ether, "world should have 0.5 ether");
    assertEq(address(system).balance, 0 ether, "system should have 0 ether");
  }

  function testNonPayableFallbackSystem() public {
    // Register a root system with a non-payable function in the world
    WorldTestSystem system = new WorldTestSystem();
    bytes16 namespace = ROOT_NAMESPACE;
    bytes16 name = "testSystem";
    bytes32 resourceSelector = ResourceSelector.from(namespace, name);
    world.registerSystem(resourceSelector, system, true);
    world.registerRootFunctionSelector(
      resourceSelector,
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
    // Register a root system with a payable function in the world
    PayableFallbackSystem system = new PayableFallbackSystem();
    bytes16 namespace = ROOT_NAMESPACE;
    bytes16 name = "testSystem";
    bytes32 resourceSelector = ResourceSelector.from(namespace, name);
    world.registerSystem(resourceSelector, system, true);
    world.registerRootFunctionSelector(
      resourceSelector,
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
    assertTrue(success, "transfer should succeed");
    assertEq(alice.balance, 0.5 ether, "alice should have 0.5 ether");
    assertEq(address(world).balance, 0.5 ether, "world should have 0.5 ether");
    assertEq(address(system).balance, 0 ether, "system should have 0 ether");
  }

  function testPayableRootSystem() public {
    // Register a root system with a payable function in the world
    WorldTestSystem system = new WorldTestSystem();
    bytes16 namespace = ROOT_NAMESPACE;
    bytes16 name = "testSystem";
    bytes32 resourceSelector = ResourceSelector.from(namespace, name);
    world.registerSystem(resourceSelector, system, true);
    world.registerRootFunctionSelector(
      resourceSelector,
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
    assertEq(address(system).balance, 0 ether, "system should have 0 ether");
  }

  // TODO: add a test for systems writing to tables via the World
  // (see https://github.com/latticexyz/mud/issues/444)
}
