// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "forge-std/Test.sol";
import { World } from "../src/World.sol";
import { System } from "../src/System.sol";

contract TestSystem is System {
  function msgSender() public pure returns (address) {
    return _msgSender();
  }
}

contract SystemTest is Test {
  TestSystem internal system;

  function setUp() public {
    system = new TestSystem();
  }

  function testCallSystem() public {
    (, bytes memory data) = address(system).call(abi.encodeWithSignature("msgSender()", address(this)));
    assertEq(address(uint160(uint256(bytes32(data)))), address(this));
  }
}
