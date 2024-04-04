// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { IStoreErrors } from "@latticexyz/store/src/IStoreErrors.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { MudTest } from "@latticexyz/world/test/MudTest.t.sol";

import { StaticArray } from "../src/codegen/index.sol";
import { IWorld } from "../src/codegen/world/IWorld.sol";

/**
 * @title Wrapper
 * @dev For testing that the getItemValue call properly reverts
 */
contract Wrapper {
  function getItemValue(address worldAddress, uint256 _index) public {
    StoreSwitch.setStoreAddress(worldAddress);

    StaticArray.getItemValue(_index);
  }
}

contract StaticArrayLengthTest is MudTest {
  function testLength() public {
    assertEq(StaticArray.lengthValue, 3);
    assertEq(StaticArray.getValue().length, 3);

    // Values within the static length return the default zeros value
    assertEq(StaticArray.getValue()[0], 0);
    assertEq(StaticArray.getItemValue(0), 0);

    assertEq(StaticArray.getValue()[1], 0);
    assertEq(StaticArray.getItemValue(1), 0);

    assertEq(StaticArray.getValue()[2], 0);
    assertEq(StaticArray.getItemValue(2), 0);

    // Values beyond the static length revert
    Wrapper wrapper = new Wrapper();
    vm.expectRevert(abi.encodeWithSelector(IStoreErrors.Store_IndexOutOfBounds.selector, 0, 96));
    wrapper.getItemValue(worldAddress, 3);

    vm.expectRevert(abi.encodeWithSelector(IStoreErrors.Store_IndexOutOfBounds.selector, 0, 128));
    wrapper.getItemValue(worldAddress, 4);
  }
}
