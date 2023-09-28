// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { Test } from "forge-std/Test.sol";

import { Utils } from "../src/Utils.sol";
import { System } from "../src/System.sol";
import { World } from "../src/World.sol";
import { IBaseWorld } from "../src/codegen/interfaces/IBaseWorld.sol";
import { ResourceId, WorldResourceIdLib, WorldResourceIdInstance } from "../src/WorldResourceId.sol";
import { RESOURCE_SYSTEM } from "../src/worldResourceTypes.sol";

import { CoreModule } from "../src/modules/core/CoreModule.sol";

contract UtilsTestSystem is System {
  function systemNamespace() public view returns (bytes16) {
    return Utils.systemNamespace();
  }
}

contract UtilsTest is Test {
  using WorldResourceIdInstance for ResourceId;
  IBaseWorld internal world;

  error SomeError(uint256 someValue, string someString);

  function setUp() public {
    world = IBaseWorld(address(new World()));
    world.initialize(new CoreModule());
  }

  function _registerAndGetNamespace(bytes14 namespace) internal returns (bytes16 returnedNamespace) {
    UtilsTestSystem testSystem = new UtilsTestSystem();
    bytes16 name = "testSystem";
    ResourceId systemId = WorldResourceIdLib.encode({ typeId: RESOURCE_SYSTEM, namespace: namespace, name: name });
    world.registerSystem(systemId, testSystem, true);

    bytes memory data = world.call(systemId, abi.encodeCall(UtilsTestSystem.systemNamespace, ()));

    returnedNamespace = abi.decode(data, (bytes16));
  }

  function testSystemNamespace() public {
    bytes14 namespace;
    bytes16 returnedNamespace;

    namespace = "";
    returnedNamespace = _registerAndGetNamespace(namespace);
    assertEq(returnedNamespace, namespace);

    namespace = "namespace";
    returnedNamespace = _registerAndGetNamespace(namespace);
    assertEq(returnedNamespace, namespace);

    namespace = "max_len_nmspce";
    returnedNamespace = _registerAndGetNamespace(namespace);
    assertEq(returnedNamespace, namespace);
  }
}
