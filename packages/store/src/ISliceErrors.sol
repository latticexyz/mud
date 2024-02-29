// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

library ISliceErrors {
  error Slice_OutOfBounds(bytes data, uint256 start, uint256 end);
}
