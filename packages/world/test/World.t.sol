// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { Test } from "forge-std/Test.sol";
import { GasReporter } from "@latticexyz/gas-report/src/GasReporter.sol";

import { SchemaType } from "@latticexyz/schema-type/src/solidity/SchemaType.sol";

import { IStoreHook, STORE_HOOK_INTERFACE_ID } from "@latticexyz/store/src/IStoreHook.sol";
import { StoreCore, StoreCoreInternal } from "@latticexyz/store/src/StoreCore.sol";
import { IStoreErrors } from "@latticexyz/store/src/IStore.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { FieldLayout, FieldLayoutLib } from "@latticexyz/store/src/FieldLayout.sol";
import { FieldLayoutEncodeHelper } from "@latticexyz/store/test/FieldLayoutEncodeHelper.sol";
import { Schema, SchemaLib } from "@latticexyz/store/src/Schema.sol";
import { PackedCounter } from "@latticexyz/store/src/PackedCounter.sol";
import { SchemaEncodeHelper } from "@latticexyz/store/test/SchemaEncodeHelper.sol";
import { Tables, ResourceIds, TablesTableId } from "@latticexyz/store/src/codegen/index.sol";
import { EncodeArray } from "@latticexyz/store/src/tightcoder/EncodeArray.sol";
import { ALL, BEFORE_SET_RECORD, AFTER_SET_RECORD, BEFORE_SPLICE_STATIC_DATA, AFTER_SPLICE_STATIC_DATA, BEFORE_SPLICE_DYNAMIC_DATA, AFTER_SPLICE_DYNAMIC_DATA, BEFORE_DELETE_RECORD, AFTER_DELETE_RECORD } from "@latticexyz/store/src/storeHookTypes.sol";
import { RevertSubscriber } from "@latticexyz/store/test/RevertSubscriber.sol";
import { EchoSubscriber } from "@latticexyz/store/test/EchoSubscriber.sol";

import { WORLD_VERSION } from "../src/version.sol";
import { World } from "../src/World.sol";
import { System } from "../src/System.sol";
import { ResourceId, WorldResourceIdLib, WorldResourceIdInstance } from "../src/WorldResourceId.sol";
import { ROOT_NAMESPACE, ROOT_NAME, ROOT_NAMESPACE_ID, UNLIMITED_DELEGATION } from "../src/constants.sol";
import { RESOURCE_TABLE, RESOURCE_SYSTEM, RESOURCE_NAMESPACE } from "../src/worldResourceTypes.sol";
import { WorldContextProvider, WORLD_CONTEXT_CONSUMER_INTERFACE_ID } from "../src/WorldContext.sol";
import { SystemHook } from "../src/SystemHook.sol";
import { BEFORE_CALL_SYSTEM, AFTER_CALL_SYSTEM } from "../src/systemHookTypes.sol";
import { Module, MODULE_INTERFACE_ID } from "../src/Module.sol";

import { NamespaceOwner, NamespaceOwnerTableId } from "../src/tables/NamespaceOwner.sol";
import { ResourceAccess } from "../src/tables/ResourceAccess.sol";

import { CoreModule } from "../src/modules/core/CoreModule.sol";
import { Systems } from "../src/modules/core/tables/Systems.sol";
import { SystemRegistry } from "../src/modules/core/tables/SystemRegistry.sol";

import { IBaseWorld } from "../src/interfaces/IBaseWorld.sol";
import { IWorldErrors } from "../src/interfaces/IWorldErrors.sol";
import { ISystemHook, SYSTEM_HOOK_INTERFACE_ID } from "../src/interfaces/ISystemHook.sol";

import { Bool } from "./tables/Bool.sol";
import { TwoFields, TwoFieldsData } from "./tables/TwoFields.sol";
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

  function writeData(bytes14 namespace, bytes16 name, bool data) public {
    bytes32[] memory keyTuple = new bytes32[](0);
    ResourceId tableId = WorldResourceIdLib.encode({ typeId: RESOURCE_TABLE, namespace: namespace, name: name });
    FieldLayout fieldLayout = StoreSwitch.getFieldLayout(tableId);

    if (StoreSwitch.getStoreAddress() == address(this)) {
      StoreCore.setRecord(
        tableId,
        keyTuple,
        abi.encodePacked(data),
        PackedCounter.wrap(bytes32(0)),
        new bytes(0),
        fieldLayout
      );
    } else {
      IBaseWorld(msg.sender).setRecord(
        tableId,
        keyTuple,
        abi.encodePacked(data),
        PackedCounter.wrap(bytes32(0)),
        new bytes(0),
        fieldLayout
      );
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

  function onBeforeCallSystem(address msgSender, ResourceId systemId, bytes memory callData) public {
    emit SystemHookCalled(abi.encode("before", msgSender, systemId, callData));
  }

  function onAfterCallSystem(address msgSender, ResourceId systemId, bytes memory callData) public {
    emit SystemHookCalled(abi.encode("after", msgSender, systemId, callData));
  }
}

contract RevertSystemHook is SystemHook {
  event SystemHookCalled(bytes data);

  function onBeforeCallSystem(address, ResourceId, bytes memory) public pure {
    revert("onBeforeCallSystem");
  }

  function onAfterCallSystem(address, ResourceId, bytes memory) public pure {
    revert("onAfterCallSystem");
  }
}

contract WorldTest is Test, GasReporter {
  using WorldResourceIdInstance for ResourceId;

  event HelloWorld(bytes32 indexed worldVersion);
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
  function _expectAccessDenied(address caller, bytes14 namespace, bytes16 name, bytes2 resourceType) internal {
    vm.prank(caller);
    vm.expectRevert(
      abi.encodeWithSelector(
        IWorldErrors.AccessDenied.selector,
        WorldResourceIdLib.encode({ typeId: resourceType, namespace: namespace, name: name }).toString(),
        caller
      )
    );
  }

  function testConstructorAndInitialize() public {
    CoreModule coreModule = new CoreModule();

    vm.expectEmit(true, true, true, true);
    emit HelloWorld(WORLD_VERSION);
    IBaseWorld newWorld = IBaseWorld(address(new World()));

    // Expect the creator to be the original deployer
    assertEq(newWorld.creator(), address(this));

    // Expect calls to initialize to fail if the caller is not the creator
    vm.prank(address(0x4242));
    vm.expectRevert(
      abi.encodeWithSelector(
        IWorldErrors.AccessDenied.selector,
        WorldResourceIdLib.encodeNamespace(ROOT_NAMESPACE).toString(),
        address(0x4242)
      )
    );
    newWorld.initialize(coreModule);

    // Expect the creator to be able to initialize the World
    newWorld.initialize(coreModule);

    // Should have registered the table data table (fka schema table)
    assertEq(
      Tables.getFieldLayout(newWorld, ResourceId.unwrap(TablesTableId)),
      FieldLayout.unwrap(Tables.getFieldLayout())
    );
    assertEq(
      Tables.getAbiEncodedKeyNames(newWorld, ResourceId.unwrap(TablesTableId)),
      abi.encode(Tables.getKeyNames())
    );
    assertEq(
      Tables.getAbiEncodedFieldNames(newWorld, ResourceId.unwrap(TablesTableId)),
      abi.encode(Tables.getFieldNames())
    );

    // Should have registered the namespace owner table
    assertEq(
      Tables.getFieldLayout(newWorld, ResourceId.unwrap(NamespaceOwnerTableId)),
      FieldLayout.unwrap(NamespaceOwner.getFieldLayout())
    );
    assertEq(
      Tables.getAbiEncodedKeyNames(newWorld, ResourceId.unwrap(NamespaceOwnerTableId)),
      abi.encode(NamespaceOwner.getKeyNames())
    );
    assertEq(
      Tables.getAbiEncodedFieldNames(newWorld, ResourceId.unwrap(NamespaceOwnerTableId)),
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
    address rootOwner = NamespaceOwner.get(world, ResourceId.unwrap(ROOT_NAMESPACE_ID));
    assertEq(rootOwner, address(this));

    // The creator of the World should have access to the root namespace
    assertTrue(ResourceAccess.get(world, ResourceId.unwrap(ROOT_NAMESPACE_ID), address(this)));
  }

  function testStoreAddress() public {
    // Register a system and use it to get storeAddress
    WorldTestSystem system = new WorldTestSystem();
    ResourceId systemId = WorldResourceIdLib.encode({
      typeId: RESOURCE_SYSTEM,
      namespace: "namespace",
      name: "testSystem"
    });

    world.registerSystem(systemId, system, false);
    bytes memory result = world.call(systemId, abi.encodeCall(WorldTestSystem.getStoreAddress, ()));

    assertEq(abi.decode(result, (address)), address(world));
  }

  function testRegisterNamespace() public {
    bytes14 namespace = "testNamespace";
    ResourceId namespaceId = WorldResourceIdLib.encodeNamespace(namespace);
    startGasReport("Register a new namespace");
    world.registerNamespace(namespaceId);
    endGasReport();

    // Expect the caller to be the namespace owner
    assertEq(
      NamespaceOwner.get(world, ResourceId.unwrap(namespaceId)),
      address(this),
      "caller should be namespace owner"
    );

    // Expect the caller to have access
    assertEq(
      ResourceAccess.get(world, ResourceId.unwrap(namespaceId), address(this)),
      true,
      "caller should have access"
    );

    // Expect the resource ID to have been registered
    assertTrue(ResourceIds.getExists(world, ResourceId.unwrap(namespaceId)));

    // Expect an error when registering an existing namespace
    vm.expectRevert(abi.encodeWithSelector(IWorldErrors.ResourceExists.selector, namespaceId, namespaceId.toString()));
    world.registerNamespace(namespaceId);
  }

  function testRegisterNamespaceRevertInvalidType() public {
    ResourceId invalidNamespaceId = WorldResourceIdLib.encode({
      typeId: RESOURCE_TABLE,
      namespace: "namespace",
      name: "name"
    });

    // Expect an error when trying to register a namespace with an invalid type
    vm.expectRevert(
      abi.encodeWithSelector(
        IWorldErrors.InvalidResourceType.selector,
        RESOURCE_NAMESPACE,
        invalidNamespaceId,
        invalidNamespaceId.toString()
      )
    );
    world.registerNamespace(invalidNamespaceId);
  }

  function testTransferNamespace() public {
    bytes14 namespace = "testTransfer";
    ResourceId namespaceId = WorldResourceIdLib.encodeNamespace(namespace);

    world.registerNamespace(namespaceId);

    // Expect the new owner to not be namespace owner before transfer
    assertFalse(
      (NamespaceOwner.get(world, ResourceId.unwrap(namespaceId)) == address(1)),
      "new owner should not be namespace owner before transfer"
    );
    // Expect the new owner to not have access before transfer
    assertEq(
      ResourceAccess.get(world, ResourceId.unwrap(namespaceId), address(1)),
      false,
      "new owner should not have access before transfer"
    );

    world.transferOwnership(namespaceId, address(1));

    // Expect the new owner to be namespace owner
    assertEq(
      NamespaceOwner.get(world, ResourceId.unwrap(namespaceId)),
      address(1),
      "new owner should be namespace owner"
    );

    // Expect the new owner to have access
    assertEq(
      ResourceAccess.get(world, ResourceId.unwrap(namespaceId), address(1)),
      true,
      "new owner should have access"
    );

    // Expect previous owner to no longer be owner
    assertFalse(
      (NamespaceOwner.get(world, ResourceId.unwrap(namespaceId)) == address(this)),
      "caller should no longer be namespace owner"
    );

    // Expect previous owner to no longer have access
    assertEq(
      ResourceAccess.get(world, ResourceId.unwrap(namespaceId), address(this)),
      false,
      "caller should no longer have access"
    );

    // Expect revert if caller is not the owner
    _expectAccessDenied(address(this), namespace, 0, RESOURCE_NAMESPACE);
    world.transferOwnership(namespaceId, address(1));
  }

  function testRegisterTable() public {
    FieldLayout fieldLayout = FieldLayoutEncodeHelper.encode(1, 32, 1);
    Schema valueSchema = SchemaEncodeHelper.encode(SchemaType.BOOL, SchemaType.UINT256, SchemaType.STRING);
    bytes14 namespace = "testNamespace";
    bytes16 tableName = "testTable";
    ResourceId namespaceId = WorldResourceIdLib.encodeNamespace(namespace);
    ResourceId tableId = WorldResourceIdLib.encode({ typeId: RESOURCE_TABLE, namespace: namespace, name: tableName });
    string[] memory keyNames = new string[](1);
    keyNames[0] = "key1";
    string[] memory fieldNames = new string[](3);
    fieldNames[0] = "value1";
    fieldNames[1] = "value2";
    fieldNames[2] = "value3";

    startGasReport("Register a new table in the namespace");
    world.registerTable(tableId, fieldLayout, defaultKeySchema, valueSchema, keyNames, fieldNames);
    endGasReport();

    // Expect the namespace to be created and owned by the caller
    assertEq(
      NamespaceOwner.get(world, ResourceId.unwrap(namespaceId)),
      address(this),
      "namespace should be created by caller"
    );

    // Expect the table to be registered
    assertEq(world.getFieldLayout(tableId).unwrap(), fieldLayout.unwrap(), "value schema should be registered");

    bytes memory loadedKeyNames = Tables.getAbiEncodedKeyNames(world, ResourceId.unwrap(tableId));
    assertEq(loadedKeyNames, abi.encode(keyNames), "key names should be registered");

    bytes memory loadedfieldNames = Tables.getAbiEncodedFieldNames(world, ResourceId.unwrap(tableId));
    assertEq(loadedfieldNames, abi.encode(fieldNames), "value names should be registered");

    // Expect an error when registering an existing table
    vm.expectRevert(
      abi.encodeWithSelector(
        IStoreErrors.StoreCore_TableAlreadyExists.selector,
        tableId,
        string(bytes.concat(ResourceId.unwrap(tableId)))
      )
    );
    world.registerTable(tableId, fieldLayout, defaultKeySchema, valueSchema, keyNames, fieldNames);

    // Expect an error when registering a table in a namespace that is not owned by the caller
    ResourceId otherTableId = WorldResourceIdLib.encode({
      typeId: RESOURCE_TABLE,
      namespace: namespace,
      name: "otherTable"
    });
    _expectAccessDenied(address(0x01), namespace, "", RESOURCE_NAMESPACE);
    world.registerTable(otherTableId, fieldLayout, defaultKeySchema, valueSchema, keyNames, fieldNames);

    // Expect the World to not be allowed to call registerTable via an external call
    _expectAccessDenied(address(world), namespace, "", RESOURCE_NAMESPACE);
    world.registerTable(otherTableId, fieldLayout, defaultKeySchema, valueSchema, keyNames, fieldNames);
  }

  function testRegisterSystem() public {
    System system = new System();
    bytes14 namespace = "";
    ResourceId namespaceId = WorldResourceIdLib.encodeNamespace(namespace);
    bytes16 name = "testSystem";
    ResourceId systemId = WorldResourceIdLib.encode({ typeId: RESOURCE_SYSTEM, namespace: namespace, name: name });

    startGasReport("register a system");
    world.registerSystem(systemId, system, false);
    endGasReport();

    // Expect the system to be registered
    (address registeredAddress, bool publicAccess) = Systems.get(world, ResourceId.unwrap(systemId));
    assertEq(registeredAddress, address(system));

    // Expect the system's resource ID to have been registered
    assertTrue(ResourceIds.getExists(world, ResourceId.unwrap(systemId)));

    // Expect the system namespace to be owned by the caller
    address routeOwner = NamespaceOwner.get(world, ResourceId.unwrap(namespaceId));
    assertEq(routeOwner, address(this));

    // Expect the system to not be publicly accessible
    assertFalse(publicAccess);

    // Expect the system to be accessible by the caller
    assertTrue(
      ResourceAccess.get({ _store: world, resourceId: ResourceId.unwrap(namespaceId), caller: address(this) })
    );

    // Expect the system to not be accessible by another address
    assertFalse(
      ResourceAccess.get({ _store: world, resourceId: ResourceId.unwrap(namespaceId), caller: address(0x1) })
    );

    // Expect the system to have access to its own namespace
    assertTrue(
      ResourceAccess.get({ _store: world, resourceId: ResourceId.unwrap(namespaceId), caller: address(system) })
    );

    ResourceId newNamespaceId = WorldResourceIdLib.encodeNamespace("newNamespace");
    // Expect the namespace to be created if it doesn't exist yet
    assertEq(NamespaceOwner.get(world, ResourceId.unwrap(newNamespaceId)), address(0));
    world.registerSystem(
      WorldResourceIdLib.encode({ typeId: RESOURCE_SYSTEM, namespace: "newNamespace", name: "testSystem" }),
      new System(),
      false
    );
    assertEq(NamespaceOwner.get(world, ResourceId.unwrap(newNamespaceId)), address(this));

    // Expect an error when registering an existing system at a new system ID
    vm.expectRevert(abi.encodeWithSelector(IWorldErrors.SystemExists.selector, address(system)));
    world.registerSystem(
      WorldResourceIdLib.encode({ typeId: RESOURCE_SYSTEM, namespace: "", name: "newSystem" }),
      system,
      true
    );

    // Don't expect an error when updating the public access of an existing system
    world.registerSystem(systemId, system, true);

    // Expect an error when registering a system at an existing resource ID of a different type
    System newSystem = new System();
    ResourceId tableId = WorldResourceIdLib.encode({ typeId: RESOURCE_TABLE, namespace: "", name: "testTable" });
    world.registerTable(
      tableId,
      Bool.getFieldLayout(),
      defaultKeySchema,
      Bool.getValueSchema(),
      new string[](1),
      new string[](1)
    );
    vm.expectRevert(
      abi.encodeWithSelector(IWorldErrors.InvalidResourceType.selector, RESOURCE_SYSTEM, tableId, tableId.toString())
    );
    world.registerSystem(tableId, newSystem, true);

    // Expect an error when registering a system in a namespace that is not owned by the caller
    System yetAnotherSystem = new System();
    _expectAccessDenied(address(0x01), "", "", RESOURCE_NAMESPACE);
    world.registerSystem(
      WorldResourceIdLib.encode({ typeId: RESOURCE_SYSTEM, namespace: "", name: "rootSystem" }),
      yetAnotherSystem,
      true
    );

    // Expect the registration to fail when coming from the World (since the World address doesn't have access)
    _expectAccessDenied(address(world), "", "", RESOURCE_NAMESPACE);
    world.registerSystem(
      WorldResourceIdLib.encode({ typeId: RESOURCE_SYSTEM, namespace: "", name: "rootSystem" }),
      yetAnotherSystem,
      true
    );

    // Expect the registration to fail if the provided address does not implement the WorldContextConsumer interface
    vm.expectRevert(
      abi.encodeWithSelector(
        IWorldErrors.InterfaceNotSupported.selector,
        address(world),
        WORLD_CONTEXT_CONSUMER_INTERFACE_ID
      )
    );
    world.registerSystem(
      WorldResourceIdLib.encode({ typeId: RESOURCE_SYSTEM, namespace: "someNamespace", name: "invalidSystem" }),
      System(address(world)),
      true
    );
  }

  function testUpgradeSystem() public {
    bytes14 namespace = "testNamespace";
    ResourceId namespaceId = WorldResourceIdLib.encodeNamespace(namespace);
    bytes16 systemName = "testSystem";
    ResourceId systemId = WorldResourceIdLib.encode({
      typeId: RESOURCE_SYSTEM,
      namespace: namespace,
      name: systemName
    });

    // Register a system
    System oldSystem = new System();
    world.registerSystem(systemId, oldSystem, true);

    // Upgrade the system and set public access to false
    System newSystem = new System();
    world.registerSystem(systemId, newSystem, false);

    // Expect the system address and public access to be updated in the System table
    (address registeredAddress, bool publicAccess) = Systems.get(world, ResourceId.unwrap(systemId));
    assertEq(registeredAddress, address(newSystem), "system address should be updated");
    assertEq(publicAccess, false, "public access should be updated");

    // Expect the SystemRegistry table to not have a reference to the old system anymore
    bytes32 registeredSystemId = SystemRegistry.get(world, address(oldSystem));
    assertEq(registeredSystemId, bytes32(0), "old system should be removed from SystemRegistry");

    // Expect the SystemRegistry table to have a reference to the new system
    registeredSystemId = SystemRegistry.get(world, address(newSystem));
    assertEq(registeredSystemId, ResourceId.unwrap(systemId), "new system should be added to SystemRegistry");

    // Expect the old system to not have access to the namespace anymore
    assertFalse(
      ResourceAccess.get(world, ResourceId.unwrap(namespaceId), address(oldSystem)),
      "old system should not have access to the namespace"
    );

    // Expect the new system to have access to the namespace
    assertTrue(
      ResourceAccess.get(world, ResourceId.unwrap(namespaceId), address(newSystem)),
      "new system should have access to the namespace"
    );

    // Expect the resource ID to still be registered
    assertTrue(ResourceIds.getExists(world, ResourceId.unwrap(systemId)), "resource type should still be SYSTEM");
  }

  function testInvalidIds() public {
    // Register a new table
    ResourceId tableId = WorldResourceIdLib.encode({ typeId: RESOURCE_TABLE, namespace: "namespace", name: "name" });
    world.registerTable(
      tableId,
      Bool.getFieldLayout(),
      defaultKeySchema,
      Bool.getValueSchema(),
      new string[](1),
      new string[](1)
    );

    // Deploy a new system
    System system = new System();

    // Expect an error when trying to register a system at the same ID
    vm.expectRevert(
      abi.encodeWithSelector(IWorldErrors.InvalidResourceType.selector, RESOURCE_SYSTEM, tableId, tableId.toString())
    );
    world.registerSystem(tableId, system, false);

    // Register a new system
    ResourceId systemId = WorldResourceIdLib.encode({ typeId: RESOURCE_SYSTEM, namespace: "namespace2", name: "name" });
    world.registerSystem(systemId, new System(), false);

    // Expect an error when trying to register a table at the same ID
    vm.expectRevert(
      abi.encodeWithSelector(
        IStoreErrors.StoreCore_InvalidResourceType.selector,
        RESOURCE_TABLE,
        systemId,
        string(abi.encodePacked(systemId))
      )
    );
    world.registerTable(
      systemId,
      Bool.getFieldLayout(),
      defaultKeySchema,
      Bool.getValueSchema(),
      new string[](1),
      new string[](1)
    );

    // Expect an error when trying to register a new table at an existing table ID
    vm.expectRevert(
      abi.encodeWithSelector(
        IStoreErrors.StoreCore_TableAlreadyExists.selector,
        ResourceId.unwrap(tableId),
        string(bytes.concat(ResourceId.unwrap(tableId)))
      )
    );
    world.registerTable(
      tableId,
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
    ResourceId tableId = WorldResourceIdLib.encode({
      typeId: RESOURCE_TABLE,
      namespace: "testSetRecord",
      name: "testTable"
    });
    // Register a new table
    world.registerTable(
      tableId,
      TwoFields.getFieldLayout(),
      TwoFields.getKeySchema(),
      TwoFields.getValueSchema(),
      new string[](0),
      new string[](2)
    );

    startGasReport("Write data to the table");
    TwoFields.set(world, tableId, true, true);
    endGasReport();

    // Expect the data to be written
    TwoFieldsData memory tableData = (TwoFields.get(world, tableId));
    assertTrue(tableData.value1);
    assertTrue(tableData.value2);

    // Expect an error when trying to write from an address that doesn't have access
    _expectAccessDenied(address(0x01), "testSetRecord", "testTable", RESOURCE_TABLE);
    TwoFields.set(world, tableId, true, true);

    // Expect the World to not have access
    vm.prank(address(world));
    vm.expectRevert(abi.encodeWithSelector(IWorldErrors.WorldCallbackNotAllowed.selector, world.setRecord.selector));
    TwoFields.set(world, tableId, true, true);
  }

  function testSetField() public {
    bytes14 namespace = "testSetField";
    bytes16 name = "testTable";
    ResourceId tableId = WorldResourceIdLib.encode({ typeId: RESOURCE_TABLE, namespace: namespace, name: name });
    FieldLayout fieldLayout = Bool.getFieldLayout();
    Schema valueSchema = Bool.getValueSchema();

    // Register a new table
    world.registerTable(tableId, fieldLayout, defaultKeySchema, valueSchema, new string[](1), new string[](1));

    startGasReport("Write data to a table field");
    world.setField(tableId, singletonKey, 0, abi.encodePacked(true), fieldLayout);
    endGasReport();

    // Expect the data to be written
    assertTrue(Bool.get(world, tableId));

    // Expect an error when trying to write from an address that doesn't have access
    _expectAccessDenied(address(0x01), "testSetField", "testTable", RESOURCE_TABLE);
    world.setField(tableId, singletonKey, 0, abi.encodePacked(true), fieldLayout);

    // Expect the World to not have access
    vm.prank(address(world));
    vm.expectRevert(abi.encodeWithSelector(IWorldErrors.WorldCallbackNotAllowed.selector, world.setField.selector));
    world.setField(tableId, singletonKey, 0, abi.encodePacked(true), fieldLayout);
  }

  function testPushToField() public {
    bytes14 namespace = "testPushField";
    bytes16 name = "testTable";
    ResourceId tableId = WorldResourceIdLib.encode({ typeId: RESOURCE_TABLE, namespace: namespace, name: name });
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
    _expectAccessDenied(address(0x01), namespace, name, RESOURCE_TABLE);
    world.pushToField(tableId, keyTuple, 0, encodedData, fieldLayout);

    // Expect the World to not have access
    vm.prank(address(world));
    vm.expectRevert(abi.encodeWithSelector(IWorldErrors.WorldCallbackNotAllowed.selector, world.pushToField.selector));
    world.pushToField(tableId, keyTuple, 0, encodedData, fieldLayout);
  }

  function testDeleteRecord() public {
    bytes14 namespace = "testDeleteReco";
    bytes16 name = "testTable";
    ResourceId tableId = WorldResourceIdLib.encode({ typeId: RESOURCE_TABLE, namespace: namespace, name: name });
    FieldLayout fieldLayout = Bool.getFieldLayout();
    Schema valueSchema = Bool.getValueSchema();

    // Register a new table
    world.registerTable(tableId, fieldLayout, defaultKeySchema, valueSchema, new string[](1), new string[](1));

    // Write data to the table and expect it to be written
    world.setRecord(
      tableId,
      singletonKey,
      abi.encodePacked(true),
      PackedCounter.wrap(bytes32(0)),
      new bytes(0),
      fieldLayout
    );
    assertTrue(Bool.get(world, tableId));

    startGasReport("Delete record");
    world.deleteRecord(tableId, singletonKey, fieldLayout);
    endGasReport();

    // expect it to be deleted
    assertFalse(Bool.get(world, tableId));

    // Write data to the table and expect it to be written
    world.setRecord(
      tableId,
      singletonKey,
      abi.encodePacked(true),
      PackedCounter.wrap(bytes32(0)),
      new bytes(0),
      fieldLayout
    );
    assertTrue(Bool.get(world, tableId));
    assertTrue(Bool.get(world, tableId));

    // Expect an error when trying to delete from an address that doesn't have access
    _expectAccessDenied(address(0x02), namespace, name, RESOURCE_TABLE);
    world.deleteRecord(tableId, singletonKey, fieldLayout);

    // Expect the World to not have access
    vm.prank(address(world));
    vm.expectRevert(abi.encodeWithSelector(IWorldErrors.WorldCallbackNotAllowed.selector, world.deleteRecord.selector));
    world.deleteRecord(tableId, singletonKey, fieldLayout);
  }

  function testCall() public {
    // Register a new system
    WorldTestSystem system = new WorldTestSystem();
    ResourceId systemId = WorldResourceIdLib.encode({
      typeId: RESOURCE_SYSTEM,
      namespace: "namespace",
      name: "testSystem"
    });
    world.registerSystem(systemId, system, false);

    // Call a system function without arguments via the World
    startGasReport("call a system via the World");
    bytes memory result = world.call(systemId, abi.encodeCall(WorldTestSystem.msgSender, ()));
    endGasReport();

    // Expect the system to have received the caller's address
    assertEq(address(uint160(uint256(bytes32(result)))), address(this));

    // Call a system function with arguments via the World
    result = world.call(systemId, abi.encodeCall(WorldTestSystem.echo, (bytes32(uint256(0x123)))));

    // Expect the return data to be decodeable as a tuple
    (address returnedAddress, bytes32 returnedBytes32) = abi.decode(result, (address, bytes32));
    assertEq(returnedAddress, address(this));
    assertEq(returnedBytes32, bytes32(uint256(0x123)));

    // Expect the return data to be decodable as a struct
    WorldTestSystemReturn memory returnStruct = abi.decode(result, (WorldTestSystemReturn));
    assertEq(returnStruct.sender, address(this));
    assertEq(returnStruct.input, bytes32(uint256(0x123)));

    // Expect an error when trying to call a private system from an address that doesn't have access
    _expectAccessDenied(address(0x01), "namespace", "testSystem", RESOURCE_SYSTEM);
    world.call(systemId, abi.encodeCall(WorldTestSystem.msgSender, ()));

    // Expect the World to have not access
    vm.prank(address(world));
    vm.expectRevert(abi.encodeWithSelector(IWorldErrors.WorldCallbackNotAllowed.selector, world.call.selector));
    world.call(systemId, abi.encodeCall(WorldTestSystem.msgSender, ()));

    // Expect errors from the system to be forwarded
    vm.expectRevert(abi.encodeWithSelector(WorldTestSystem.WorldTestSystemError.selector, "test error"));
    world.call(systemId, abi.encodeCall(WorldTestSystem.err, ("test error")));

    // Register another system in the same namespace
    WorldTestSystem subSystem = new WorldTestSystem();
    ResourceId subsystemId = WorldResourceIdLib.encode({
      typeId: RESOURCE_SYSTEM,
      namespace: "namespace",
      name: "testSubSystem"
    });
    world.registerSystem(subsystemId, subSystem, false);

    // Call the subsystem via the World (with access to the base route)
    returnedAddress = abi.decode(world.call(subsystemId, abi.encodeCall(WorldTestSystem.msgSender, ())), (address));
    assertEq(returnedAddress, address(this));

    // Call the subsystem via delegatecall from the system
    // (Note: just for testing purposes, in reality systems can call subsystems directly instead of via two indirections like here)
    bytes memory nestedReturndata = world.call(
      systemId,
      abi.encodeCall(
        WorldTestSystem.delegateCallSubSystem, // Function in system
        (
          address(subSystem), // Address of subsystem
          WorldContextProvider.appendContext({
            callData: abi.encodeCall(WorldTestSystem.msgSender, ()),
            msgSender: address(this),
            msgValue: uint256(0)
          })
        )
      )
    );

    returnedAddress = abi.decode(abi.decode(nestedReturndata, (bytes)), (address));
    assertEq(returnedAddress, address(this), "subsystem returned wrong address");
  }

  function testCallFromSelf() public {
    // Register a new system
    WorldTestSystem system = new WorldTestSystem();
    ResourceId systemId = WorldResourceIdLib.encode({
      typeId: RESOURCE_SYSTEM,
      namespace: "namespace",
      name: "testSystem"
    });
    world.registerSystem(systemId, system, true);

    address caller = address(1);

    // Call a system via callFrom with the own address
    vm.prank(caller);
    bytes memory returnData = world.callFrom(caller, systemId, abi.encodeCall(WorldTestSystem.msgSender, ()));
    address returnedAddress = abi.decode(returnData, (address));

    // Expect the system to have received the delegator's address
    assertEq(returnedAddress, caller);
  }

  function testCallFromUnlimitedDelegation() public {
    // Register a new system
    WorldTestSystem system = new WorldTestSystem();
    ResourceId systemId = WorldResourceIdLib.encode({
      typeId: RESOURCE_SYSTEM,
      namespace: "namespace",
      name: "testSystem"
    });
    world.registerSystem(systemId, system, true);

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
    bytes memory returnData = world.callFrom(delegator, systemId, abi.encodeCall(WorldTestSystem.msgSender, ()));
    endGasReport();
    address returnedAddress = abi.decode(returnData, (address));

    // Expect the system to have received the delegator's address
    assertEq(returnedAddress, delegator);
  }

  function testCallFromFailDelegationNotFound() public {
    // Register a new system
    WorldTestSystem system = new WorldTestSystem();
    ResourceId systemId = WorldResourceIdLib.encode({
      typeId: RESOURCE_SYSTEM,
      namespace: "namespace",
      name: "testSystem"
    });
    world.registerSystem(systemId, system, true);

    // Expect a revert when attempting to perform a call on behalf of an address that doesn't have a delegation
    vm.expectRevert(
      abi.encodeWithSelector(
        IWorldErrors.DelegationNotFound.selector,
        address(2), // Delegator
        address(1) // Delegatee
      )
    );
    vm.prank(address(1));
    world.callFrom(address(2), systemId, abi.encodeCall(WorldTestSystem.msgSender, ()));
  }

  function testCallFromLimitedDelegation() public {
    // Register a new system
    WorldTestSystem system = new WorldTestSystem();
    ResourceId systemId = WorldResourceIdLib.encode({
      typeId: RESOURCE_SYSTEM,
      namespace: "namespace",
      name: "testSystem"
    });
    world.registerSystem(systemId, system, true);

    // Register a limited delegation
    address delegator = address(1);
    address delegatee = address(2);
    vm.prank(delegator);
    world.registerDelegation(delegatee, UNLIMITED_DELEGATION, new bytes(0));
  }

  function testRegisterStoreHook() public {
    FieldLayout fieldLayout = Bool.getFieldLayout();
    Schema valueSchema = Bool.getValueSchema();
    ResourceId tableId = WorldResourceIdLib.encode({ typeId: RESOURCE_TABLE, namespace: "", name: "testTable" });

    // Register a new table
    world.registerTable(tableId, fieldLayout, defaultKeySchema, valueSchema, new string[](1), new string[](1));

    // Register a new hook
    IStoreHook tableHook = new EchoSubscriber();
    world.registerStoreHook(tableId, tableHook, ALL);

    // Prepare data to write to the table
    bytes memory staticData = abi.encodePacked(true);

    // Expect the hook to be notified when a record is written (once before and once after the record is written)
    vm.expectEmit(true, true, true, true);
    emit HookCalled(
      abi.encodeCall(
        IStoreHook.onBeforeSetRecord,
        (tableId, singletonKey, staticData, PackedCounter.wrap(bytes32(0)), new bytes(0), fieldLayout)
      )
    );

    vm.expectEmit(true, true, true, true);
    emit HookCalled(
      abi.encodeCall(
        IStoreHook.onAfterSetRecord,
        (tableId, singletonKey, staticData, PackedCounter.wrap(bytes32(0)), new bytes(0), fieldLayout)
      )
    );

    world.setRecord(tableId, singletonKey, staticData, PackedCounter.wrap(bytes32(0)), new bytes(0), fieldLayout);

    // Expect the hook to be notified when a static field is written (once before and once after the field is written)
    vm.expectEmit(true, true, true, true);
    emit HookCalled(
      abi.encodeCall(
        IStoreHook.onBeforeSpliceStaticData,
        (tableId, singletonKey, 0, uint40(staticData.length), staticData)
      )
    );

    vm.expectEmit(true, true, true, true);
    emit HookCalled(
      abi.encodeCall(
        IStoreHook.onAfterSpliceStaticData,
        (tableId, singletonKey, 0, uint40(staticData.length), staticData)
      )
    );

    world.setField(tableId, singletonKey, 0, staticData, fieldLayout);

    // Expect the hook to be notified when a record is deleted (once before and once after the field is written)
    vm.expectEmit(true, true, true, true);
    emit HookCalled(abi.encodeCall(IStoreHook.onBeforeDeleteRecord, (tableId, singletonKey, fieldLayout)));

    vm.expectEmit(true, true, true, true);
    emit HookCalled(abi.encodeCall(IStoreHook.onAfterDeleteRecord, (tableId, singletonKey, fieldLayout)));

    world.deleteRecord(tableId, singletonKey, fieldLayout);

    // Expect an error when trying to register an address that doesn't implement the IStoreHook interface
    vm.expectRevert(
      abi.encodeWithSelector(IWorldErrors.InterfaceNotSupported.selector, address(world), STORE_HOOK_INTERFACE_ID)
    );
    world.registerStoreHook(
      tableId,
      IStoreHook(address(world)), // the World contract does not implement the store hook interface
      ALL
    );
  }

  function testUnregisterStoreHook() public {
    FieldLayout fieldLayout = Bool.getFieldLayout();
    Schema valueSchema = Bool.getValueSchema();
    ResourceId tableId = WorldResourceIdLib.encode({ typeId: RESOURCE_TABLE, namespace: "", name: "testTable" });

    // Register a new table
    world.registerTable(tableId, fieldLayout, defaultKeySchema, valueSchema, new string[](1), new string[](1));

    // Register a new RevertSubscriber
    IStoreHook revertSubscriber = new RevertSubscriber();
    world.registerStoreHook(tableId, revertSubscriber, ALL);
    // Register a new EchoSubscriber
    IStoreHook echoSubscriber = new EchoSubscriber();
    world.registerStoreHook(tableId, echoSubscriber, ALL);

    // Prepare data to write to the table
    bytes memory staticData = abi.encodePacked(true);

    // Expect a revert when the RevertSubscriber's onBeforeSetRecord hook is called
    vm.expectRevert(bytes("onBeforeSetRecord"));
    world.setRecord(tableId, singletonKey, staticData, PackedCounter.wrap(bytes32(0)), new bytes(0), fieldLayout);

    // Expect a revert when the RevertSubscriber's onBeforeSpliceStaticData hook is called
    vm.expectRevert(bytes("onBeforeSpliceStaticData"));
    world.setField(tableId, singletonKey, 0, staticData, fieldLayout);

    // Expect a revert when the RevertSubscriber's onBeforeDeleteRecord hook is called
    vm.expectRevert(bytes("onBeforeDeleteRecord"));
    world.deleteRecord(tableId, singletonKey, fieldLayout);

    // Unregister the RevertSubscriber
    world.unregisterStoreHook(tableId, revertSubscriber);

    // Expect the hook to be notified when a record is written (once before and once after the record is written)
    vm.expectEmit(true, true, true, true);
    emit HookCalled(
      abi.encodeCall(
        IStoreHook.onBeforeSetRecord,
        (tableId, singletonKey, staticData, PackedCounter.wrap(bytes32(0)), new bytes(0), fieldLayout)
      )
    );

    vm.expectEmit(true, true, true, true);
    emit HookCalled(
      abi.encodeCall(
        IStoreHook.onAfterSetRecord,
        (tableId, singletonKey, staticData, PackedCounter.wrap(bytes32(0)), new bytes(0), fieldLayout)
      )
    );

    world.setRecord(tableId, singletonKey, staticData, PackedCounter.wrap(bytes32(0)), new bytes(0), fieldLayout);

    // Expect the hook to be notified when a static field is written (once before and once after the field is written)
    vm.expectEmit(true, true, true, true);
    emit HookCalled(
      abi.encodeCall(
        IStoreHook.onBeforeSpliceStaticData,
        (tableId, singletonKey, 0, uint40(staticData.length), staticData)
      )
    );

    vm.expectEmit(true, true, true, true);
    emit HookCalled(
      abi.encodeCall(
        IStoreHook.onAfterSpliceStaticData,
        (tableId, singletonKey, 0, uint40(staticData.length), staticData)
      )
    );

    world.setField(tableId, singletonKey, 0, staticData, fieldLayout);

    // Expect the hook to be notified when a record is deleted (once before and once after the field is written)
    vm.expectEmit(true, true, true, true);
    emit HookCalled(abi.encodeCall(IStoreHook.onBeforeDeleteRecord, (tableId, singletonKey, fieldLayout)));

    vm.expectEmit(true, true, true, true);
    emit HookCalled(abi.encodeCall(IStoreHook.onAfterDeleteRecord, (tableId, singletonKey, fieldLayout)));

    world.deleteRecord(tableId, singletonKey, fieldLayout);
  }

  function testRegisterSystemHook() public {
    ResourceId systemId = WorldResourceIdLib.encode({
      typeId: RESOURCE_SYSTEM,
      namespace: "namespace",
      name: "testSystem"
    });

    // Register a new system
    WorldTestSystem system = new WorldTestSystem();
    world.registerSystem(systemId, system, true);

    // Expect the registration to fail if the contract does not implement the system hook interface
    vm.expectRevert(
      abi.encodeWithSelector(IWorldErrors.InterfaceNotSupported.selector, address(world), SYSTEM_HOOK_INTERFACE_ID)
    );
    world.registerSystemHook(
      systemId,
      ISystemHook(address(world)), // the World contract does not implement the system hook interface
      BEFORE_CALL_SYSTEM | AFTER_CALL_SYSTEM
    );

    // Register a new hook
    ISystemHook systemHook = new EchoSystemHook();
    world.registerSystemHook(systemId, systemHook, BEFORE_CALL_SYSTEM | AFTER_CALL_SYSTEM);

    bytes memory callData = abi.encodeWithSelector(bytes4(keccak256("fallbackselector")));

    // Expect the hooks to be called in correct order
    vm.expectEmit(true, true, true, true);
    emit SystemHookCalled(abi.encode("before", address(this), systemId, callData));

    vm.expectEmit(true, true, true, true);
    emit WorldTestSystemLog("fallback");

    vm.expectEmit(true, true, true, true);
    emit SystemHookCalled(abi.encode("after", address(this), systemId, callData));

    // Call a system fallback function without arguments via the World
    world.call(systemId, callData);
  }

  function testUnregisterSystemHook() public {
    ResourceId systemId = WorldResourceIdLib.encode({
      typeId: RESOURCE_SYSTEM,
      namespace: "namespace",
      name: "testTable"
    });

    // Register a new system
    WorldTestSystem system = new WorldTestSystem();
    world.registerSystem(systemId, system, false);

    // Register a new RevertSystemHook
    ISystemHook revertSystemHook = new RevertSystemHook();
    world.registerSystemHook(systemId, revertSystemHook, BEFORE_CALL_SYSTEM | AFTER_CALL_SYSTEM);

    // Register a new EchoSystemHook
    ISystemHook echoSystemHook = new EchoSystemHook();
    world.registerSystemHook(systemId, echoSystemHook, BEFORE_CALL_SYSTEM | AFTER_CALL_SYSTEM);

    bytes memory callData = abi.encodeWithSelector(bytes4(keccak256("fallbackselector")));

    // Expect calls to fail while the RevertSystemHook is registered
    vm.expectRevert(bytes("onBeforeCallSystem"));
    world.call(systemId, callData);

    // Unregister the RevertSystemHook
    world.unregisterSystemHook(systemId, revertSystemHook);

    // Expect the echo hooks to be called in correct order
    vm.expectEmit(true, true, true, true);
    emit SystemHookCalled(abi.encode("before", address(this), systemId, callData));

    vm.expectEmit(true, true, true, true);
    emit WorldTestSystemLog("fallback");

    vm.expectEmit(true, true, true, true);
    emit SystemHookCalled(abi.encode("after", address(this), systemId, callData));

    // Call a system fallback function without arguments via the World
    world.call(systemId, callData);
  }

  function testWriteRootSystem() public {
    ResourceId tableId = WorldResourceIdLib.encode({
      typeId: RESOURCE_TABLE,
      namespace: "namespace",
      name: "testTable"
    });
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
    ResourceId rootSystemId = WorldResourceIdLib.encode({ typeId: RESOURCE_SYSTEM, namespace: "", name: "testSystem" });
    WorldTestSystem system = new WorldTestSystem();
    world.registerSystem(rootSystemId, system, false);

    // Call a system function that writes data to the World
    world.call(rootSystemId, abi.encodeCall(WorldTestSystem.writeData, ("namespace", "testTable", true)));

    // Expect the data to be written
    assertTrue(Bool.get(world, tableId));
  }

  function testWriteNonRootSystem() public {
    ResourceId tableId = WorldResourceIdLib.encode({
      typeId: RESOURCE_TABLE,
      namespace: "namespace",
      name: "testTable"
    });
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
    ResourceId systemId = WorldResourceIdLib.encode({
      typeId: RESOURCE_SYSTEM,
      namespace: "namespace",
      name: "testSystem"
    });
    WorldTestSystem system = new WorldTestSystem();
    world.registerSystem(systemId, system, false);

    // Call a system function that writes data to the World
    world.call(systemId, abi.encodeCall(WorldTestSystem.writeData, ("namespace", "testTable", true)));

    // Expect the data to be written
    assertTrue(Bool.get(world, tableId));
  }

  function testDelegatecallRootSystem() public {
    ResourceId systemId = WorldResourceIdLib.encode({ typeId: RESOURCE_SYSTEM, namespace: "", name: "testSystem" });
    // Register a new root system
    WorldTestSystem system = new WorldTestSystem();
    world.registerSystem(systemId, system, false);

    // Call the root sysyem
    vm.expectEmit(true, true, true, true);
    emit WorldTestSystemLog("delegatecall");
    world.call(systemId, abi.encodeCall(WorldTestSystem.emitCallType, ()));
  }

  function testCallAutonomousSystem() public {
    ResourceId systemId = WorldResourceIdLib.encode({
      typeId: RESOURCE_SYSTEM,
      namespace: "namespace",
      name: "testSystem"
    });
    // Register a new non-root system
    WorldTestSystem system = new WorldTestSystem();
    world.registerSystem(systemId, system, false);

    // Call the sysyem
    vm.expectEmit(true, true, true, true);
    emit WorldTestSystemLog("call");
    world.call(systemId, abi.encodeCall(WorldTestSystem.emitCallType, ()));
  }

  function testRegisterFunctionSelector() public {
    bytes14 namespace = "testNamespace";
    bytes16 name = "testSystem";
    ResourceId systemId = WorldResourceIdLib.encode({ typeId: RESOURCE_SYSTEM, namespace: namespace, name: name });

    // Register a new system
    WorldTestSystem system = new WorldTestSystem();
    world.registerSystem(systemId, system, true);

    startGasReport("Register a function selector");
    bytes4 functionSelector = world.registerFunctionSelector(systemId, "msgSender", "()");
    endGasReport();

    string memory expectedWorldFunctionSignature = "testNamespace_testSystem_msgSender()";
    bytes4 expectedWorldFunctionSelector = bytes4(keccak256(abi.encodePacked(expectedWorldFunctionSignature)));
    assertEq(functionSelector, expectedWorldFunctionSelector, "wrong function selector returned");

    // Call the system via the World with the registered function selector
    (bool success, bytes memory data) = address(world).call(abi.encodePacked(expectedWorldFunctionSelector));

    assertTrue(success, "call failed");
    assertEq(abi.decode(data, (address)), address(this), "wrong address returned");

    // Register a function selector to the error function
    functionSelector = world.registerFunctionSelector(systemId, "err", "(string)");

    // Expect errors to be passed through
    vm.expectRevert(abi.encodeWithSelector(WorldTestSystem.WorldTestSystemError.selector, "test error"));
    IWorldTestSystem(address(world)).testNamespace_testSystem_err("test error");
  }

  function testRegisterRootFunctionSelector() public {
    bytes14 namespace = "testNamespace";
    bytes16 name = "testSystem";
    ResourceId systemId = WorldResourceIdLib.encode({ typeId: RESOURCE_SYSTEM, namespace: namespace, name: name });

    // Register a new system
    WorldTestSystem system = new WorldTestSystem();
    world.registerSystem(systemId, system, true);

    bytes4 worldFunc = bytes4(abi.encodeWithSignature("testSelector()"));
    bytes4 sysFunc = WorldTestSystem.msgSender.selector;

    // Expect an error when trying to register a root function selector from an account without access
    _expectAccessDenied(address(0x01), "", "", RESOURCE_NAMESPACE);
    world.registerRootFunctionSelector(systemId, worldFunc, sysFunc);

    // Expect the World to not be able to register a root function selector when calling the function externally
    _expectAccessDenied(address(world), "", "", RESOURCE_NAMESPACE);
    world.registerRootFunctionSelector(systemId, "smth", "smth");

    startGasReport("Register a root function selector");
    bytes4 functionSelector = world.registerRootFunctionSelector(systemId, worldFunc, sysFunc);
    endGasReport();

    assertEq(functionSelector, worldFunc, "wrong function selector returned");

    // Call the system via the World with the registered function selector
    (bool success, bytes memory data) = address(world).call(abi.encodePacked(worldFunc));

    assertTrue(success, "call failed");
    assertEq(abi.decode(data, (address)), address(this), "wrong address returned");

    // Register a function selector to the error function
    functionSelector = world.registerRootFunctionSelector(
      systemId,
      WorldTestSystem.err.selector,
      WorldTestSystem.err.selector
    );

    // Expect errors to be passed through
    vm.expectRevert(abi.encodeWithSelector(WorldTestSystem.WorldTestSystemError.selector, "test error"));
    WorldTestSystem(address(world)).err("test error");
  }

  function testRegisterFallbackSystem() public {
    bytes14 namespace = "testNamespace";
    bytes16 name = "testSystem";
    ResourceId systemId = WorldResourceIdLib.encode({ typeId: RESOURCE_SYSTEM, namespace: namespace, name: name });

    // Register a new system
    WorldTestSystem system = new WorldTestSystem();
    world.registerSystem(systemId, system, true);

    startGasReport("Register a fallback system");
    bytes4 funcSelector1 = world.registerFunctionSelector(systemId, "", "");
    endGasReport();

    // Call the system's fallback function
    vm.expectEmit(true, true, true, true);
    emit WorldTestSystemLog("fallback");
    (bool success, bytes memory data) = address(world).call(abi.encodeWithSelector(funcSelector1));
    assertTrue(success, "call failed");

    bytes4 worldFunc = bytes4(abi.encodeWithSignature("testSelector()"));

    startGasReport("Register a root fallback system");
    bytes4 funcSelector2 = world.registerRootFunctionSelector(systemId, worldFunc, 0);
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
    bytes14 namespace = "noroot";
    bytes16 name = "testSystem";
    ResourceId systemId = WorldResourceIdLib.encode({ typeId: RESOURCE_SYSTEM, namespace: namespace, name: name });

    world.registerSystem(systemId, system, true);
    world.registerRootFunctionSelector(
      systemId,
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
    (bool success, ) = address(world).call{ value: 0.5 ether }(abi.encodeCall(WorldTestSystem.receiveEther, ()));
    assertTrue(success, "transfer should succeed");
    assertEq(alice.balance, 0.5 ether, "alice should have 0.5 ether");
    assertEq(address(world).balance, 0.5 ether, "world should have 0.5 ether");
    assertEq(address(system).balance, 0 ether, "system should have 0 ether");
  }

  function testNonPayableSystem() public {
    // Register a non-root system with a non-payable function in the world
    WorldTestSystem system = new WorldTestSystem();
    bytes14 namespace = "noroot";
    bytes16 name = "testSystem";
    ResourceId systemId = WorldResourceIdLib.encode({ typeId: RESOURCE_SYSTEM, namespace: namespace, name: name });
    world.registerSystem(systemId, system, true);
    world.registerRootFunctionSelector(
      systemId,
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
    (bool success, ) = address(world).call{ value: 0.5 ether }(abi.encodeCall(WorldTestSystem.msgSender, ()));
    // The call should succeed because the value is not forwarded to the system
    assertTrue(success, "transfer should succeed");
    assertEq(alice.balance, 0.5 ether, "alice should have 0.5 ether");
    assertEq(address(world).balance, 0.5 ether, "world should have 0.5 ether");
    assertEq(address(system).balance, 0 ether, "system should have 0 ether");
  }

  function testNonPayableFallbackSystem() public {
    // Register a root system with a non-payable function in the world
    WorldTestSystem system = new WorldTestSystem();
    bytes14 namespace = ROOT_NAMESPACE;
    bytes16 name = "testSystem";
    ResourceId systemId = WorldResourceIdLib.encode({ typeId: RESOURCE_SYSTEM, namespace: namespace, name: name });
    world.registerSystem(systemId, system, true);
    world.registerRootFunctionSelector(systemId, bytes4(abi.encodeWithSignature("systemFallback()")), bytes4(""));

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
    bytes14 namespace = ROOT_NAMESPACE;
    bytes16 name = "testSystem";
    ResourceId systemId = WorldResourceIdLib.encode({ typeId: RESOURCE_SYSTEM, namespace: namespace, name: name });
    world.registerSystem(systemId, system, true);
    world.registerRootFunctionSelector(systemId, bytes4(abi.encodeWithSignature("systemFallback()")), bytes4(""));

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
    bytes14 namespace = ROOT_NAMESPACE;
    bytes16 name = "testSystem";
    ResourceId systemId = WorldResourceIdLib.encode({ typeId: RESOURCE_SYSTEM, namespace: namespace, name: name });
    world.registerSystem(systemId, system, true);
    world.registerRootFunctionSelector(
      systemId,
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
    (bool success, ) = address(world).call{ value: 0.5 ether }(abi.encodeCall(WorldTestSystem.receiveEther, ()));
    assertTrue(success, "transfer should succeed");
    assertEq(alice.balance, 0.5 ether, "alice should have 0.5 ether");
    assertEq(address(world).balance, 0.5 ether, "world should have 0.5 ether");
    assertEq(address(system).balance, 0 ether, "system should have 0 ether");
  }

  // TODO: add a test for systems writing to tables via the World
  // (see https://github.com/latticexyz/mud/issues/444)
}
