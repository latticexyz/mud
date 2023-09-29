// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { Create2 } from "./Create2.sol";

/**
 * @title Create2Factory
 * @dev Helper Contract to facilitate create2 deployment of Contracts.
 */
contract Create2Factory {
  /**
   * @dev Emitted when a new contract is deployed using the `deployContract` function.
   * @param addr The address of the newly deployed contract.
   * @param salt The salt value used in the `CREATE2` operation.
   */
  event ContractDeployed(address addr, uint256 salt);

  /**
   * @dev Deploys a new Contract using create2.
   * @param byteCode The bytecode of the contract to be deployed.
   * @param salt A 256-bit value that, combined with the bytecode, determines the address.
   * @dev Emit ContractDeployed on success
   */
  function deployContract(bytes memory byteCode, uint256 salt) public {
    address addr = Create2.deploy(byteCode, salt);
    emit ContractDeployed(addr, salt);
  }
}
