// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Test, console } from "forge-std/Test.sol";
import { GasReporter } from "@latticexyz/gas-report/src/GasReporter.sol";
import { ResourceId, ResourceIdLib, ResourceIdInstance } from "@latticexyz/store/src/ResourceId.sol";

import { WorldResourceIdLib, WorldResourceIdInstance } from "../src/WorldResourceId.sol";
import { RESOURCE_SYSTEM } from "../src/worldResourceTypes.sol";

contract WorldResourceIdTest is Test, GasReporter {
  using ResourceIdInstance for ResourceId;
  using WorldResourceIdInstance for ResourceId;

  function testGetNamespace() public {
    ResourceId resourceId = WorldResourceIdLib.encode("namespace", "name", RESOURCE_SYSTEM);

    startGasReport("encode namespace, name and type");
    bytes14 namespace = resourceId.getNamespace();
    endGasReport();

    assertEq(namespace, "namespace");
  }

  function testGetNamespaceId() public {
    ResourceId resourceId = WorldResourceIdLib.encode("namespace", "name", RESOURCE_SYSTEM);

    startGasReport("get namespace ID from a resource ID");
    ResourceId namespaceId = resourceId.getNamespaceId();
    endGasReport();

    assertEq(ResourceId.unwrap(namespaceId), ResourceId.unwrap(WorldResourceIdLib.encodeNamespace("namespace")));
  }

  function testGetType() public {
    ResourceId resourceId = WorldResourceIdLib.encode("namespace", "name", RESOURCE_SYSTEM);

    startGasReport("get type from a resource ID");
    bytes2 resourceType = resourceId.getType();
    endGasReport();

    assertEq(resourceType, "sy");
  }

  function testIsType() public {
    ResourceId resourceId = WorldResourceIdLib.encode("namespace", "name", RESOURCE_SYSTEM);

    startGasReport("check if a resource ID has a given type");
    bool isType = resourceId.isType(RESOURCE_SYSTEM);
    endGasReport();

    assertTrue(isType);
  }

  function testMatchResourceTypeEncoding() public {
    ResourceId resourceId = WorldResourceIdLib.encode("namespace", "name", RESOURCE_SYSTEM);
    bytes30 resourceIdWithoutType = bytes30(ResourceId.unwrap(resourceId));
    assertEq(
      ResourceId.unwrap(resourceId),
      ResourceId.unwrap(ResourceIdLib.encode(resourceIdWithoutType, RESOURCE_SYSTEM))
    );
  }

  function testFuzz(bytes14 namespace, bytes16 name, bytes2 resourceType) public {
    ResourceId resourceId = WorldResourceIdLib.encode(namespace, name, resourceType);
    assertEq(resourceId.getNamespace(), namespace);
    assertEq(
      ResourceId.unwrap(resourceId.getNamespaceId()),
      ResourceId.unwrap(WorldResourceIdLib.encodeNamespace(namespace))
    );
    assertEq(resourceId.getNamespaceId().getNamespace(), namespace);
    assertEq(resourceId.getName(), name);
    assertEq(resourceId.getType(), resourceType);
  }
}
