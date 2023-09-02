// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Test } from "forge-std/Test.sol";

import { Utils } from "../src/Utils.sol";
import { System } from "../src/System.sol";
import { World } from "../src/World.sol";
import { IBaseWorld } from "../src/interfaces/IBaseWorld.sol";
import { ResourceSelector } from "../src/ResourceSelector.sol";

import { CoreModule } from "../src/modules/core/CoreModule.sol";

contract UtilsTestSystem is System {
  function systemNamespace() public view returns (bytes16) {
    return Utils.systemNamespace();
  }
}

contract UtilsTest is Test {
  using ResourceSelector for bytes32;
  IBaseWorld internal world;

  error SomeError(uint256 someValue, string someString);

  function setUp() public {
    world = IBaseWorld(address(new World()));
    world.installRootModule(new CoreModule(), new bytes(0));
  }

  function _registerAndGetNamespace(bytes16 namespace) internal returns (bytes16 returnedNamespace) {
    UtilsTestSystem testSystem = new UtilsTestSystem();
    bytes16 name = "testSystem";
    world.registerSystem(ResourceSelector.from(namespace, name), testSystem, true);

    bytes memory data = world.call(
      ResourceSelector.from(namespace, name),
      abi.encodeWithSelector(UtilsTestSystem.systemNamespace.selector)
    );
    returnedNamespace = abi.decode(data, (bytes16));
  }

  function testSystemNamespace() public {
    bytes16 namespace;
    bytes16 returnedNamespace;

    namespace = "";
    returnedNamespace = _registerAndGetNamespace(namespace);
    assertEq(returnedNamespace, namespace);

    namespace = "namespace";
    returnedNamespace = _registerAndGetNamespace(namespace);
    assertEq(returnedNamespace, namespace);

    namespace = "maxlen_namespace";
    returnedNamespace = _registerAndGetNamespace(namespace);
    assertEq(returnedNamespace, namespace);
  }
}
