// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

import { DSTestPlus } from 'solmate/test/utils/DSTestPlus.sol';
import { Vm } from 'forge-std/Vm.sol';
import { console } from 'forge-std/console.sol';

import { Set } from '../Set.sol';

contract SetTest is DSTestPlus {
  Vm internal immutable vm = Vm(HEVM_ADDRESS);

  address payable[] internal users;

  Set internal set;

  function setUp() public {
    set = new Set();
  }

  // Should add the items to the list
  function testAdd() public {
    set.add(1);
    set.add(2);
    assertTrue(set.has(1));
    assertTrue(set.has(2));
    assertTrue(!set.has(3));
  }

  // Should not add if it already exists
  function testAddDuplicate() public {
    assertEq(set.size(), 0);
    set.add(1);
    assertEq(set.size(), 1);
    set.add(1);
    assertEq(set.size(), 1);
  }

  // Should remove the item
  function testRemove() public {
    set.add(1);
    assertEq(set.size(), 1);
    assertTrue(set.has(1));

    set.remove(1);

    assertEq(set.size(), 0);
    assertTrue(!set.has(1));

    set.remove(1);
    set.remove(0);

    assertEq(set.size(), 0);
    assertTrue(!set.has(1));
  }

  // Should return a list of all items
  function testGetItems() public {
    set.add(1);
    set.add(2);

    uint256[] memory items = set.getItems();

    assertEq(items[0], 1);
    assertEq(items[1], 2);
  }

  // Should return the number of items in the set
  function testSize() public {
    set.add(1);
    assertEq(set.size(), 1);

    set.add(2);
    assertEq(set.size(), 2);
  }

  // Should return true if the list has the value, false otherwise
  function testHas() public {
    assertTrue(!set.has(1));

    set.add(1);
    assertTrue(set.has(1));
    assertTrue(!set.has(2));

    set.add(4);
    assertTrue(set.has(1));
    assertTrue(set.has(4));
    assertTrue(!set.has(2));

    set.add(10);
    assertTrue(set.has(1));
    assertTrue(set.has(4));
    assertTrue(set.has(10));
    assertTrue(!set.has(2));

    set.remove(1);
    assertTrue(!set.has(1));
  }
}
