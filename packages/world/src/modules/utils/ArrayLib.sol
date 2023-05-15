// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

library ArrayLib {
  function equal(bytes32[] memory arr1, bytes32[] memory arr2) internal pure returns (bool) {
    if (arr1.length != arr2.length) {
      return false;
    }

    for (uint256 i; i < arr1.length; i++) {
      if (arr1[i] != arr2[i]) {
        return false;
      }
    }

    return true;
  }

  function includes(bytes32[] memory arr, bytes32 element) internal pure returns (bool) {
    for (uint256 i; i < arr.length; i++) {
      if (arr[i] == element) {
        return true;
      }
    }
    return false;
  }

  function includes(bytes32[][] memory arr, bytes32[] memory element) internal pure returns (bool) {
    for (uint256 i; i < arr.length; i++) {
      if (equal(arr[i], element)) {
        return true;
      }
    }
    return false;
  }

  function filter(bytes32[] memory arr, bytes32 element) internal pure returns (bytes32[] memory) {
    bytes32[] memory filtered = new bytes32[](arr.length);
    uint256 filteredIndex = 0;
    for (uint256 i; i < arr.length; i++) {
      if (arr[i] != element) {
        filtered[filteredIndex] = arr[i];
        filteredIndex++;
      }
    }

    // In-place update the length of the array
    // (Note: this does not update the free memory pointer)
    assembly {
      mstore(filtered, filteredIndex)
    }

    return filtered;
  }
}
