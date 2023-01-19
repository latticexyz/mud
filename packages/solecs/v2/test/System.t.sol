// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { console } from "forge-std/console.sol";
import { DSTestPlus } from "solmate/test/utils/DSTestPlus.sol";
import { World } from "../World.sol";
import { System } from "../System.sol";

contract TestSystem is System {
  function msgSender() public pure returns (address) {
    return _msgSender();
  }
}

contract SystemTest is DSTestPlus {
  function testMsgSender() public {
    TestSystem system = new TestSystem();
    address sender = address(0x123);
    (bool success, bytes memory returndata) = address(system).call(abi.encodeWithSignature("msgSender()", sender));
    assertTrue(success);
    assertEq(abi.decode(returndata, (address)), sender);
  }
}
