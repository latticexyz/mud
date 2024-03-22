// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { Test, console } from "forge-std/Test.sol";
import { GasReporter } from "@latticexyz/gas-report/src/GasReporter.sol";
import { ResourceId, ResourceIdLib } from "@latticexyz/store/src/ResourceId.sol";

import { WorldResourceIdLib, WorldResourceIdInstance, NAMESPACE_BITS, NAME_BITS, TYPE_BITS } from "../src/WorldResourceId.sol";
import { RESOURCE_SYSTEM } from "../src/worldResourceTypes.sol";

contract WorldResourceIdTest is Test, GasReporter {
  using WorldResourceIdInstance for ResourceId;

  function testEncode() public {
    ResourceId resourceId = WorldResourceIdLib.encode({
      typeId: RESOURCE_SYSTEM,
      namespace: "namespace",
      name: "name"
    });

    assertEq(
      ResourceId.unwrap(resourceId),
      bytes32(abi.encodePacked(RESOURCE_SYSTEM, bytes14("namespace"), bytes16("name")))
    );
  }

  function testGetNamespace() public {
    ResourceId resourceId = WorldResourceIdLib.encode({
      typeId: RESOURCE_SYSTEM,
      namespace: "namespace",
      name: "name"
    });

    startGasReport("encode namespace, name and type");
    bytes14 namespace = resourceId.getNamespace();
    endGasReport();

    assertEq(namespace, "namespace");
  }

  function testGetNamespaceId() public {
    ResourceId resourceId = WorldResourceIdLib.encode({
      typeId: RESOURCE_SYSTEM,
      namespace: "namespace",
      name: "name"
    });

    startGasReport("get namespace ID from a resource ID");
    ResourceId namespaceId = resourceId.getNamespaceId();
    endGasReport();

    assertEq(ResourceId.unwrap(namespaceId), ResourceId.unwrap(WorldResourceIdLib.encodeNamespace("namespace")));
  }

  function testToString() public {
    ResourceId resourceId = WorldResourceIdLib.encode({
      typeId: RESOURCE_SYSTEM,
      namespace: "namespace",
      name: "name"
    });

    startGasReport("convert resource ID to string");
    string memory resourceIdString = resourceId.toString();
    endGasReport();

    assertEq(resourceIdString, "sy:namespace:name");
  }

  function testGetType() public {
    ResourceId resourceId = WorldResourceIdLib.encode({
      typeId: RESOURCE_SYSTEM,
      namespace: "namespace",
      name: "name"
    });

    startGasReport("get type from a resource ID");
    bytes2 resourceType = resourceId.getType();
    endGasReport();

    assertEq(resourceType, RESOURCE_SYSTEM);
  }

  function testMatchResourceTypeEncoding() public {
    ResourceId resourceId = WorldResourceIdLib.encode({
      typeId: RESOURCE_SYSTEM,
      namespace: "namespace",
      name: "name"
    });
    bytes30 resourceIdWithoutType = bytes30(ResourceId.unwrap(resourceId) << TYPE_BITS);
    assertEq(
      ResourceId.unwrap(resourceId),
      ResourceId.unwrap(ResourceIdLib.encode({ typeId: RESOURCE_SYSTEM, name: resourceIdWithoutType }))
    );
  }

  function testMatchingByteSizes() public {
    assertEq(NAMESPACE_BITS + NAME_BITS + TYPE_BITS, 256);
  }

  function testFuzz(bytes14 namespace, bytes16 name, bytes2 resourceType) public {
    bytes2 NOT_TYPE = bytes2("xx");
    vm.assume(resourceType != NOT_TYPE);
    ResourceId resourceId = WorldResourceIdLib.encode({ typeId: resourceType, namespace: namespace, name: name });
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
