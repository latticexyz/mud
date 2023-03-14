// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "forge-std/Test.sol";

import { Schema, SchemaLib } from "@latticexyz/store/src/Schema.sol";
import { SchemaType } from "@latticexyz/schema-type/src/solidity/SchemaType.sol";

import { World } from "../src/World.sol";
import { IWorld } from "../src/interfaces/IWorld.sol";
import { ResourceSelector } from "../src/ResourceSelector.sol";

import { RegistrationModule } from "../src/modules/registration/RegistrationModule.sol";
import { CoreModule } from "../src/modules/core/CoreModule.sol";
import { IndexModule } from "../src/modules/index/IndexModule.sol";
import { ReverseMapping } from "../src/modules/index/tables/ReverseMapping.sol";

contract IndexModuleTest is Test {
  using ResourceSelector for bytes32;
  IWorld world;
  IndexModule indexModule = new IndexModule(); // Modules can be deployed once and installed multiple times

  function setUp() public {}

  function testInstall() public {
    world = IWorld(address(new World()));
    world.installRootModule(new CoreModule(), new bytes(0));
    world.installRootModule(new RegistrationModule(), new bytes(0));

    Schema sourceTableSchema = SchemaLib.encode(SchemaType.UINT256);
    Schema sourceTableKeySchema = SchemaLib.encode(SchemaType.BYTES32);

    bytes16 namespace = bytes16("test");
    bytes16 sourceFile = bytes16("source");
    bytes16 targetFile = bytes16("target");
    uint256 targetTableId = ResourceSelector.from(namespace, targetFile).toTableId();

    // Register source table
    uint256 sourceTableId = uint256(
      world.registerTable(namespace, sourceFile, sourceTableSchema, sourceTableKeySchema)
    );

    // Install the index module
    // TODO: add support for installing this via installModule
    // -> requires `callFrom` for the module to be able to register a hook in the name of the original caller
    world.installRootModule(indexModule, abi.encode(sourceTableId, targetTableId));

    // Set a value in the source table
    uint256 value = 1;
    bytes32 key = keccak256("test");
    bytes32[] memory keyTuple = new bytes32[](1);
    keyTuple[0] = key;

    world.setRecord(namespace, sourceFile, keyTuple, abi.encodePacked(value));

    // Get the list of entities with this value from the target table
    bytes32[] memory keysWithValue = ReverseMapping.get(targetTableId, world, keccak256(abi.encode(value)));

    // // Assert that the list is correct
    assertEq(keysWithValue.length, 1);
    // assertEq(keysWithValue[0], key);
  }
}
