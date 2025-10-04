// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { Test } from "forge-std/Test.sol";
import { GasReporter } from "@latticexyz/gas-report/src/GasReporter.sol";

import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";

import { ResourceId, WorldResourceIdLib, WorldResourceIdInstance } from "@latticexyz/world/src/WorldResourceId.sol";
import { createWorld } from "@latticexyz/world/test/createWorld.sol";
import { WorldTestSystem } from "@latticexyz/world/test/World.t.sol";
import { IWorld } from "../src/codegen/world/IWorld.sol";
import { BatchStoreModule } from "../src/BatchStoreModule.sol";
import { NamespaceOwner } from "@latticexyz/world/src/codegen/tables/NamespaceOwner.sol";
import { batchStoreSystem, BatchStoreSystemType } from "../src/codegen/experimental/systems/BatchStoreSystemLib.sol";
import { TableRecord } from "../src/common.sol";
import { EncodedLengths } from "@latticexyz/store/src/EncodedLengths.sol";

contract BatchStoreModuleTest is Test, GasReporter {
  using WorldResourceIdInstance for ResourceId;

  IWorld world;
  BatchStoreModule batchStoreModule = new BatchStoreModule();

  function setUp() public {
    world = IWorld(address(createWorld()));
    StoreSwitch.setStoreAddress(address(world));
  }

  function testInstall() public {
    startGasReport("install batch store module");
    world.installRootModule(batchStoreModule, new bytes(0));
    endGasReport();
  }

  function testGetTableRecords() public {
    world.installRootModule(batchStoreModule, new bytes(0));

    bytes32[][] memory keys = new bytes32[][](1);
    keys[0] = NamespaceOwner.encodeKeyTuple(WorldResourceIdLib.encodeNamespace(""));

    startGasReport("get table records");
    batchStoreSystem.getTableRecords(NamespaceOwner._tableId, keys);
    endGasReport();

    TableRecord[] memory records = batchStoreSystem.getTableRecords(NamespaceOwner._tableId, keys);
    assertEq(records.length, 1);
    assertEq(records[0].keyTuple, keys[0]);

    (bytes memory staticData, EncodedLengths encodedLengths, bytes memory dynamicData) = NamespaceOwner.encode(
      address(this)
    );
    assertEq(records[0].staticData, staticData);
    assertEq(records[0].encodedLengths.unwrap(), encodedLengths.unwrap());
    assertEq(records[0].dynamicData, dynamicData);
  }

  function testSetTableRecords() public {
    world.installRootModule(batchStoreModule, new bytes(0));

    ResourceId namespace = WorldResourceIdLib.encodeNamespace("example");
    assertEq(NamespaceOwner.get(namespace), address(0));

    TableRecord[] memory records = new TableRecord[](1);
    (bytes memory staticData, EncodedLengths encodedLengths, bytes memory dynamicData) = NamespaceOwner.encode(
      address(this)
    );
    records[0] = TableRecord({
      keyTuple: NamespaceOwner.encodeKeyTuple(WorldResourceIdLib.encodeNamespace("example")),
      staticData: staticData,
      encodedLengths: encodedLengths,
      dynamicData: dynamicData
    });

    startGasReport("set table records");
    batchStoreSystem.setTableRecords(NamespaceOwner._tableId, records);
    endGasReport();

    assertEq(NamespaceOwner.get(namespace), address(this));
  }

  function testDeleteTableRecords() public {
    world.installRootModule(batchStoreModule, new bytes(0));

    ResourceId namespace = WorldResourceIdLib.encodeNamespace("example");
    NamespaceOwner.set(namespace, address(this));

    assertEq(NamespaceOwner.get(namespace), address(this));

    bytes32[][] memory keys = new bytes32[][](1);
    keys[0] = NamespaceOwner.encodeKeyTuple(namespace);

    startGasReport("delete table records");
    batchStoreSystem.deleteTableRecords(NamespaceOwner._tableId, keys);
    endGasReport();

    assertEq(NamespaceOwner.get(namespace), address(0));
  }
}
