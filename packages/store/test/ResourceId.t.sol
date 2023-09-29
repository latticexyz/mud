// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { Test, console } from "forge-std/Test.sol";
import { GasReporter } from "@latticexyz/gas-report/src/GasReporter.sol";
import { ResourceId } from "../src/ResourceId.sol";
import { RESOURCE_TABLE, RESOURCE_OFFCHAIN_TABLE } from "../src/storeResourceTypes.sol";
import { ResourceId, ResourceIdInstance, ResourceIdLib } from "../src/ResourceId.sol";

contract ResourceIdTest is Test, GasReporter {
  using ResourceIdInstance for ResourceId;

  function testEncode() public {
    startGasReport("encode table ID with name and type");
    ResourceId tableId = ResourceIdLib.encode({ typeId: RESOURCE_TABLE, name: "name" });
    endGasReport();

    assertEq(ResourceId.unwrap(tableId), bytes32(abi.encodePacked(RESOURCE_TABLE, bytes30("name"))));
  }

  function testGetType() public {
    ResourceId tableId = ResourceIdLib.encode({ typeId: RESOURCE_TABLE, name: "name" });

    startGasReport("get type from a table ID");
    bytes2 resourceType = tableId.getType();
    endGasReport();

    assertEq(resourceType, RESOURCE_TABLE);
  }

  function testFuzz(bytes30 name, bytes2 resourceType) public {
    ResourceId tableId = ResourceIdLib.encode({ typeId: resourceType, name: name });
    assertEq(tableId.getType(), resourceType);
  }
}
