// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import { LibDiamond, DiamondStorage } from "../libraries/LibDiamond.sol";

contract UsingDiamondOwner {
  modifier onlyOwner() {
    DiamondStorage storage ds = LibDiamond.diamondStorage();
    require(msg.sender == ds.contractOwner, "Only owner is allowed to perform this action");
    _;
  }
}
