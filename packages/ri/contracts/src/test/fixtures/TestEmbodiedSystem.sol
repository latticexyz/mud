// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;
import { console } from "forge-std/console.sol";
import { DSTest } from "ds-test/test.sol";

import { UsingAppStorage } from "../../utils/UsingAppStorage.sol";
import { AppStorage } from "../../libraries/LibAppStorage.sol";
import { LibUtils } from "../../libraries/LibUtils.sol";

contract TestEmbodiedSystem is UsingAppStorage, DSTest {
  function dummyEmbodiedSystem(bytes memory argument) external {
    assertEq(abi.decode(argument, (uint256)), 42);
  }
}
