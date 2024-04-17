// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { MudTest } from "@latticexyz/world/test/MudTest.t.sol";

import { IStoreErrors } from "@latticexyz/store/src/IStoreErrors.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { ROOT_NAMESPACE_ID } from "@latticexyz/world/src/constants.sol";
import { NamespaceOwner } from "@latticexyz/world/src/codegen/tables/NamespaceOwner.sol";

import { StaticArrayWithNumber } from "../src/codegen/index.sol";
import { toStaticArray_uint256_3 } from "../src/codegen/tables/StaticArrayWithNumber.sol";

/**
 * @title GetItemValueWrapper
 * @dev For testing that calling getItemValue properly reverts
 * We use a seperate contract to ensure `expectRevert` does not only check the first external call
 */
contract GetItemValueWrapper {
  function getItemValue(address worldAddress, uint256 _index) public {
    StoreSwitch.setStoreAddress(worldAddress);

    StaticArrayWithNumber.getItemValue(_index);
  }
}

contract StaticArrayWithNumberTest is MudTest {
  function testLength() public {
    assertEq(StaticArrayWithNumber.lengthValue, 3);
    assertEq(StaticArrayWithNumber.getValue().length, 3);

    // Values within the static length return the default zeros value
    assertEq(StaticArrayWithNumber.getValue()[0], 0);
    assertEq(StaticArrayWithNumber.getItemValue(0), 0);

    assertEq(StaticArrayWithNumber.getValue()[1], 0);
    assertEq(StaticArrayWithNumber.getItemValue(1), 0);

    assertEq(StaticArrayWithNumber.getValue()[2], 0);
    assertEq(StaticArrayWithNumber.getItemValue(2), 0);

    // Values beyond the static length revert
    GetItemValueWrapper wrapper = new GetItemValueWrapper();
    vm.expectRevert(abi.encodeWithSelector(IStoreErrors.Store_IndexOutOfBounds.selector, 0, 96));
    wrapper.getItemValue(worldAddress, 3);

    vm.expectRevert(abi.encodeWithSelector(IStoreErrors.Store_IndexOutOfBounds.selector, 0, 128));
    wrapper.getItemValue(worldAddress, 4);

    uint256[3] memory value = [uint256(1), 2, 3];
    vm.prank(NamespaceOwner.get(ROOT_NAMESPACE_ID));
    StaticArrayWithNumber.set(0, value);

    // Values within the static length return the correct value
    assertEq(StaticArrayWithNumber.getValue()[0], 1);
    assertEq(StaticArrayWithNumber.getItemValue(0), 1);

    assertEq(StaticArrayWithNumber.getValue()[1], 2);
    assertEq(StaticArrayWithNumber.getItemValue(1), 2);

    assertEq(StaticArrayWithNumber.getValue()[2], 3);
    assertEq(StaticArrayWithNumber.getItemValue(2), 3);
  }
}
