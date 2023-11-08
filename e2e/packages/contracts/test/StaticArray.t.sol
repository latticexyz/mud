// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { MudTest } from "@latticexyz/world/test/MudTest.t.sol";

import { toStaticArray_uint256_2 } from "../src/codegen/tables/StaticArray.sol";

contract StaticArrayTest is MudTest {
  uint256 internal memoryCorruptionCheck = uint256(keccak256("memoryCorruptionCheck"));

  function testMemoryCorruption() public {
    uint256[] memory data = new uint256[](3);
    data[0] = 1;
    data[1] = 2;
    data[2] = memoryCorruptionCheck;

    uint256[2] memory result = toStaticArray_uint256_2(data);
    assertEq(result[0], 0);
    assertEq(result[1], 0);

    uint256 memoryAfterResult;
    assembly {
      memoryAfterResult := mload(add(result, 0x40))
      mstore(0x40, add(mload(0x40), 0x20))
    }
    assertNotEq(memoryAfterResult, memoryCorruptionCheck);
  }
}
