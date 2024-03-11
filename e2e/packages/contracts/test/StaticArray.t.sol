// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { MudTest } from "@latticexyz/world/test/MudTest.t.sol";

import { toStaticArray_uint256_3 } from "../src/codegen/tables/StaticArray.sol";

uint256 constant memoryCorruptionCheck = uint256(keccak256("memoryCorruptionCheck"));

contract StaticArrayTest is MudTest {
  /*
   * Test that the data is correctly copied when the dynamic and static arrays are the same length
   */
  function testMemoryCorruptionSameLength() public {
    uint256[] memory data = new uint256[](3);
    data[0] = 1;
    data[1] = 2;
    data[2] = memoryCorruptionCheck;

    uint256[3] memory result = toStaticArray_uint256_3(data);
    assertEq(result[0], 1);
    assertEq(result[1], 2);

    uint256 memoryAfterResult;
    assembly {
      memoryAfterResult := mload(add(result, 0x40))
      mstore(0x40, add(mload(0x40), 0x40))
    }
    assertEq(memoryAfterResult, memoryCorruptionCheck);
  }

  /*
   * Test that the data is correctly copied when the dynamic array is longer
   */
  function testMemoryCorruptionLongerDynamic() public {
    uint256[] memory data = new uint256[](4);
    data[0] = 1;
    data[1] = 2;
    data[2] = 3;
    data[3] = memoryCorruptionCheck;

    uint256[3] memory result = toStaticArray_uint256_3(data);
    assertEq(result[0], 1);
    assertEq(result[1], 2);
    assertEq(result[2], 3);

    uint256 memoryAfterResult;
    assembly {
      memoryAfterResult := mload(add(result, 0x60))
      mstore(0x40, add(mload(0x40), 0x30))
    }
    assertEq(memoryAfterResult, memoryCorruptionCheck);
  }

  /*
   * Test that an uninitialized array is returned when the dynamic array is shorter
   */
  function testMemoryCorruptionShorterDynamic() public {
    uint256[] memory data = new uint256[](2);
    data[0] = 1;
    data[1] = memoryCorruptionCheck;

    uint256[3] memory result = toStaticArray_uint256_3(data);
    assertEq(result[0], 0);

    uint256 memoryAfterResult;
    assembly {
      memoryAfterResult := mload(add(result, 0x20))
      mstore(0x40, add(mload(0x40), 0x20))
    }
    assertNotEq(memoryAfterResult, memoryCorruptionCheck);
  }
}
