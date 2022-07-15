// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

interface IOwned {
  function owner() external view returns (address);
}
