// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { MudTest } from "@latticexyz/world/test/MudTest.t.sol";

import { IStoreErrors } from "@latticexyz/store/src/IStoreErrors.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { ROOT_NAMESPACE_ID } from "@latticexyz/world/src/constants.sol";
import { NamespaceOwner } from "@latticexyz/world/src/codegen/tables/NamespaceOwner.sol";

import { StaticArray } from "../src/codegen/index.sol";
import { toStaticArray_uint256_3 } from "../src/codegen/tables/StaticArray.sol";

/**
 * @title GetItemValueWrapper
 * @dev For testing that calling getItemValue properly reverts
 * We use a seperate contract to ensure `expectRevert` does not only check the first external call
 */
contract GetItemValueWrapper {
  function getItemValue(address worldAddress, uint256 _index) public {
    StoreSwitch.setStoreAddress(worldAddress);

    StaticArray.getItemValue(_index);
  }
}

contract StaticArrayTest is MudTest {
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
    GetItemValueWrapper wrapper = new GetItemValueWrapper();
    vm.expectRevert(abi.encodeWithSelector(IStoreErrors.Store_IndexOutOfBounds.selector, 0, 96));
    wrapper.getItemValue(worldAddress, 3);

    vm.expectRevert(abi.encodeWithSelector(IStoreErrors.Store_IndexOutOfBounds.selector, 0, 128));
    wrapper.getItemValue(worldAddress, 4);

    uint256[3] memory value = [uint256(1), 2, 3];
    vm.prank(NamespaceOwner.get(ROOT_NAMESPACE_ID));
    StaticArray.set(value);

    // Values within the static length return the correct value
    assertEq(StaticArray.getValue()[0], 1);
    assertEq(StaticArray.getItemValue(0), 1);

    assertEq(StaticArray.getValue()[1], 2);
    assertEq(StaticArray.getItemValue(1), 2);

    assertEq(StaticArray.getValue()[2], 3);
    assertEq(StaticArray.getItemValue(2), 3);
  }
}
