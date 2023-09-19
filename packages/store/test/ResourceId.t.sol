// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Test, console } from "forge-std/Test.sol";
import { GasReporter } from "@latticexyz/gas-report/src/GasReporter.sol";
import { ResourceId } from "../src/ResourceId.sol";
import { RESOURCE_TABLE } from "../src/storeResourceTypes.sol";
import { ResourceId, ResourceIdInstance, ResourceIdLib } from "../src/ResourceId.sol";

contract ResourceIdTest is Test, GasReporter {
  using ResourceIdInstance for ResourceId;

  function testEncode() public {
    startGasReport("encode table ID with name and type");
    ResourceId tableId = ResourceIdLib.encode("name", RESOURCE_TABLE);
    endGasReport();

    assertEq(tableId.unwrap(), bytes32(abi.encodePacked(bytes30("name"), RESOURCE_TABLE)));
  }

  function getGetType() public {
    ResourceId tableId = ResourceIdLib.encode("name", "tb");

    startGasReport("get type from a table ID");
    bytes2 resourceType = tableId.getType();
    endGasReport();

    assertEq(resourceType, "tb");
  }

  function testIsType() public {
    ResourceId tableId = ResourceIdLib.encode("name", RESOURCE_TABLE);

    startGasReport("check if a table ID is of type tb");
    bool isType = tableId.isType(RESOURCE_TABLE);
    endGasReport();

    assertTrue(isType);
  }

  function testFuzz(bytes30 name, bytes2 resourceType) public {
    ResourceId tableId = ResourceIdLib.encode(name, resourceType);
    assertEq(tableId.getType(), resourceType);
  }
}
