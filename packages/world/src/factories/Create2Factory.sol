// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { Create2 } from "./Create2.sol";

/**
  @dev Helper Contract to facilitate create2 deployment of Contracts.
*/
contract Create2Factory {
  event ContractDeployed(address addr, uint256 salt);

  /**
   * @dev Deploys a new Contract using create2.
   */
  function deployContract(bytes memory byteCode, uint256 salt) public {
    address addr = Create2.deploy(byteCode, salt);
    emit ContractDeployed(addr, salt);
  }
}
