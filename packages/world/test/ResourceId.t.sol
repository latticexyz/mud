// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Test, console } from "forge-std/Test.sol";
import { GasReporter } from "@latticexyz/gas-report/src/GasReporter.sol";
import { ResourceType } from "@latticexyz/store/src/ResourceType.sol";

import { ResourceId } from "../src/ResourceId.sol";
import { RESOURCE_SYSTEM } from "../src/worldResourceTypes.sol";

contract ResourceIdTest is Test, GasReporter {
  using ResourceId for bytes32;
  using ResourceType for bytes32;

  function testGetNamespace() public {
    bytes32 resourceId = ResourceId.encode("namespace", "name", RESOURCE_SYSTEM);

    startGasReport("encode namespace, name and type");
    bytes14 namespace = resourceId.getNamespace();
    endGasReport();

    assertEq(namespace, "namespace");
  }

  function testGetNamespaceId() public {
    bytes32 resourceId = ResourceId.encode("namespace", "name", RESOURCE_SYSTEM);

    startGasReport("get namespace ID from a resource ID");
    ResourceId namespaceId = resourceId.getNamespaceId();
    endGasReport();

    assertEq(namespaceId, ResourceId.encodeNamespace("namespace"));
  }

  function testGetType() public {
    bytes32 resourceId = ResourceId.encode("namespace", "name", RESOURCE_SYSTEM);

    startGasReport("get type from a resource ID");
    bytes2 resourceType = resourceId.getType();
    endGasReport();

    assertEq(resourceType, "sy");
  }

  function testIsType() public {
    bytes32 resourceId = ResourceId.encode("namespace", "name", RESOURCE_SYSTEM);

    startGasReport("check if a resource ID has a given type");
    bool isType = resourceId.isType(RESOURCE_SYSTEM);
    endGasReport();

    assertTrue(isType);
  }

  function testMatchResourceTypeEncoding() public {
    bytes32 resourceId = ResourceId.encode("namespace", "name", RESOURCE_SYSTEM);
    bytes30 resourceIdWithoutType = bytes30(resourceId);
    assertEq(resourceId, ResourceType.encode(resourceIdWithoutType, RESOURCE_SYSTEM));
  }

  function testFuzz(bytes14 namespace, bytes16 name, bytes2 resourceType) public {
    bytes32 resourceId = ResourceId.encode(namespace, name, resourceType);
    assertEq(resourceId.getNamespace(), namespace);
    assertEq(resourceId.getNamespaceId(), ResourceId.encodeNamespace(namespace));
    assertEq(resourceId.getNamespaceId().getNamespace(), namespace);
    assertEq(resourceId.getName(), name);
    assertEq(resourceId.getType(), resourceType);
  }
}
