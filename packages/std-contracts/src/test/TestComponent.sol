// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IWorld } from "solecs/interfaces/IWorld.sol";
import { Component } from "solecs/Component.sol";
import { LibTypes } from "solecs/LibTypes.sol";

uint256 constant ID = uint256(keccak256("lib.testComponent"));

struct TestStruct {
  uint256 a;
  int32 b;
  address c;
  string d;
}

contract TestComponent is Component {
  constructor(IWorld world) Component(world) {}

  function getSchema() public pure override returns (string[] memory keys, LibTypes.SchemaValue[] memory values) {
    keys = new string[](4);
    values = new LibTypes.SchemaValue[](4);

    keys[0] = "a";
    values[0] = LibTypes.SchemaValue.UINT256;

    keys[1] = "b";
    values[1] = LibTypes.SchemaValue.INT32;

    keys[2] = "c";
    values[2] = LibTypes.SchemaValue.ADDRESS;

    keys[3] = "d";
    values[3] = LibTypes.SchemaValue.STRING;
  }

  function set(uint256 entity, TestStruct calldata value) public {
    set(entity, abi.encode(value));
  }

  function getValue(uint256 entity) public view returns (TestStruct memory) {
    (uint256 a, int32 b, address c, string memory d) = abi.decode(
      getRawValue(entity),
      (uint32, int32, address, string)
    );
    return TestStruct(a, b, c, d);
  }

  function getEntitiesWithValue(TestStruct calldata test) public view returns (uint256[] memory) {
    return getEntitiesWithValue(abi.encode(test));
  }
}
