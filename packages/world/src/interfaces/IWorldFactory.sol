// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

interface IWorldFactory {
  event ContractDeployed(address addr, uint256 salt);
  event WorldDeployed(address indexed newContract);

  function worldCount() external view returns (uint256);

  function deployContract(bytes memory byteCode, uint256 salt) external;

  function deployWorld() external;
}
