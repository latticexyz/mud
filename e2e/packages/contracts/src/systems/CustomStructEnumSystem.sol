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

  TestStruct internal testStruct;
  TestEnum internal testEnum;

  function stub3(uint8 val1, bytes32 val2) public {
    testStruct = TestStruct({ val1: val1, val2: val2 });
    testEnum = TestEnum.VAL2;
  }
}
