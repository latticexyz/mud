// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { MudTest } from "@latticexyz/world/test/MudTest.t.sol";

import { toStaticArray_uint256_2 } from "../src/codegen/tables/StaticArray.sol";

contract StaticArrayTest is MudTest {
  uint256 internal memoryCorruptionCheck = uint256(keccak256("memoryCorruptionCheck"));

  /*
   * Test that the data is correctly copied when the dynamic and static arrays are the same length
   */
  function testMemoryCorruptionSameLength() public {
    uint256[] memory data = new uint256[](2);
    data[0] = 1;
    data[1] = 2;

    uint256[2] memory result = toStaticArray_uint256_2(data);
    assertEq(result[0], 1);
    assertEq(result[1], 2);
  }

  /*
   * Test that the data is correctly copied when the dynamic array is longer
   */
  function testMemoryCorruptionLongerDynamic() public {
    uint256[] memory data = new uint256[](3);
    data[0] = 1;
    data[1] = 2;
    data[2] = memoryCorruptionCheck;

    uint256[2] memory result = toStaticArray_uint256_2(data);
    assertEq(result[0], 1);
    assertEq(result[1], 2);

    uint256 memoryAfterResult;
    assembly {
      memoryAfterResult := mload(add(result, 0x40))
      mstore(0x40, add(mload(0x40), 0x20))
    }
    assertEq(memoryAfterResult, memoryCorruptionCheck);
  }

  /*
   * Test that an uninitialized array is returned when the dynamic array is shorter
   */
  function testMemoryCorruptionShorterDynamic() public {
    uint256[] memory data = new uint256[](1);
    data[0] = 1;

    uint256[2] memory result = toStaticArray_uint256_2(data);
    assertEq(result[0], 0);
    assertEq(result[1], 0);
  }
}
