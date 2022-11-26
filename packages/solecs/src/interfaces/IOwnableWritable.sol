// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

import { IERC173 } from "./IERC173.sol";

interface IOwnableWritable is IERC173 {
  function authorizeWriter(address writer) external;

  function unauthorizeWriter(address writer) external;
}
