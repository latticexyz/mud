// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Test } from "forge-std/Test.sol";
import { SchemaType } from "../../src/solidity/SchemaType.sol";

contract SchemaTypeTest is Test {
  function testGetStaticByteLength() public {
    assertEq(SchemaType.UINT8.getStaticByteLength(), 1);
    // TODO add more tests (https://github.com/latticexyz/mud/issues/444)
  }
}
