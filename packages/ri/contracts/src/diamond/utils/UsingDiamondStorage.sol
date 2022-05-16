// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import { LibDiamond, DiamondStorage } from "../libraries/LibDiamond.sol";

contract UsingDiamondStorage {
  function ds() internal pure returns (DiamondStorage storage) {
    return LibDiamond.diamondStorage();
  }
}
