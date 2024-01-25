// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { System } from "@latticexyz/world/src/System.sol";

contract CustomStructEnumSystem is System {
  struct TestStruct {
    uint8 val1;
    bytes32 val2;
  }

  enum TestEnum {
    VAL1,
    VAL2
  }

  // TODO: this fails to codegen an interface
  // function stub3(TestStruct memory testStruct, TestEnum testEnum) public {
  //   testStruct.val1 = uint8(testEnum);
  // }
}
