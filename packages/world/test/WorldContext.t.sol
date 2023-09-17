// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "forge-std/Test.sol";
import { GasReporter } from "@latticexyz/gas-report/src/GasReporter.sol";
import { WorldContextProvider, WorldContextConsumer } from "../src/WorldContext.sol";

contract TestContextConsumer is WorldContextConsumer {
  event Context(bytes args, address msgSender, uint256 msgValue);

  function emitContext(bytes memory someArgument) public {
    emit Context(someArgument, _msgSender(), _msgValue());
  }
}

contract WorldContextTest is Test, GasReporter {
  event Context(bytes args, address msgSender, uint256 msgValue);

  TestContextConsumer public consumer = new TestContextConsumer();

  function testFuzzAppendContext(bytes memory callData, address msgSender, uint256 msgValue) public {
    assertEq(
      keccak256(abi.encodePacked(callData, msgSender, msgValue)),
      keccak256(WorldContextProvider.appendContext(callData, msgSender, msgValue))
    );
  }

  function testFuzzCallExtractContext(bytes memory args, address msgSender, uint256 msgValue) public {
    vm.assume(msgSender != address(0));

    vm.expectEmit(true, true, true, true);
    emit Context(args, msgSender, msgValue);
    WorldContextProvider.callWithContextOrRevert({
      msgSender: msgSender,
      msgValue: msgValue,
      target: address(consumer),
      callData: abi.encodeWithSelector(TestContextConsumer.emitContext.selector, args)
    });
  }

  function testFuzzDelegatecallExtractContext(bytes memory args, address msgSender, uint256 msgValue) public {
    vm.assume(msgSender != address(0));

    vm.expectEmit(true, true, true, true);
    emit Context(args, msgSender, msgValue);
    WorldContextProvider.delegatecallWithContextOrRevert({
      msgSender: msgSender,
      msgValue: msgValue,
      target: address(consumer),
      callData: abi.encodeWithSelector(TestContextConsumer.emitContext.selector, args)
    });
  }
}
