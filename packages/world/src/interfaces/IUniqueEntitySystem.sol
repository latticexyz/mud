// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

// TODO allow overriding namespace per-system (or a separate config for modules?)
interface IUniqueEntitySystem {
  function uniqueEntity_system_getUniqueEntity() external returns (bytes32 uniqueEntity);
}
