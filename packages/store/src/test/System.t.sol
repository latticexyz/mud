// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "forge-std/Test.sol";
import { World } from "../World.sol";
import { System } from "../System.sol";

contract TestSystem is System {
  function msgSender() public pure returns (address) {
    // !gasreport extract msg.sender from calldata
    address sender = _msgSender();
    return sender;
  }
}

contract SystemTest is Test {
  function testMsgSender() public {
    TestSystem system = new TestSystem();
    address sender = address(0x123);
    (bool success, bytes memory returndata) = address(system).call(abi.encodeWithSignature("msgSender()", sender));
    assertTrue(success);
    assertEq(abi.decode(returndata, (address)), sender);
  }
}
