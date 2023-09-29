// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { Test } from "forge-std/Test.sol";
import { GasReporter } from "@latticexyz/gas-report/src/GasReporter.sol";
import { ResourceId } from "../src/ResourceId.sol";
import { StoreHooks } from "../src/codegen/tables/StoreHooks.sol";
import { StoreMock } from "./StoreMock.sol";

contract StoreHooksColdLoadTest is Test, GasReporter, StoreMock {
  bytes21[] hooks;

  function setUp() public {
    // StoreHooks schema is already registered by StoreCore
    ResourceId key = ResourceId.wrap(keccak256("somekey"));

    hooks = new bytes21[](1);
    hooks[0] = bytes21("some data");

    StoreHooks.set(key, hooks);
  }

  function testGet() public {
    ResourceId key = ResourceId.wrap(keccak256("somekey"));

    startGasReport("StoreHooks: get field (cold)");
    bytes21[] memory returnedAddresses = StoreHooks.get(key);
    endGasReport();

    assertEq(returnedAddresses.length, hooks.length);
    assertEq(returnedAddresses[0], hooks[0]);
  }

  function testLength() public {
    ResourceId key = ResourceId.wrap(keccak256("somekey"));

    startGasReport("StoreHooks: get length (cold)");
    uint256 length = StoreHooks.length(key);
    endGasReport();

    assertEq(length, hooks.length);
  }

  function testGetItem() public {
    ResourceId key = ResourceId.wrap(keccak256("somekey"));

    startGasReport("StoreHooks: get 1 element (cold)");
    bytes21 returnedAddress = StoreHooks.getItem(key, 0);
    endGasReport();

    assertEq(returnedAddress, hooks[0]);
  }

  function testPop() public {
    ResourceId key = ResourceId.wrap(keccak256("somekey"));

    startGasReport("StoreHooks: pop 1 element (cold)");
    StoreHooks.pop(key);
    endGasReport();

    uint256 length = StoreHooks.length(key);

    assertEq(length, hooks.length - 1);
  }

  function testUpdate() public {
    ResourceId key = ResourceId.wrap(keccak256("somekey"));

    bytes21 newAddress = bytes21(bytes20(keccak256("alice")));
    startGasReport("StoreHooks: update 1 element (cold)");
    StoreHooks.update(key, 0, newAddress);
    endGasReport();

    bytes21[] memory returnedAddresses = StoreHooks.get(key);
    assertEq(returnedAddresses.length, 1);
    assertEq(returnedAddresses[0], newAddress);
  }

  function testDelete() public {
    ResourceId key = ResourceId.wrap(keccak256("somekey"));

    startGasReport("StoreHooks: delete record (cold)");
    StoreHooks.deleteRecord(key);
    endGasReport();

    bytes21[] memory returnedAddresses = StoreHooks.get(key);
    assertEq(returnedAddresses.length, 0);
  }
}
