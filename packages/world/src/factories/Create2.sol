// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

library Create2 {
  /**
   * @dev Deploys a contract using `CREATE2`. The address where the contract
   * will be deployed can be known in advance.
   *
   * The bytecode for a contract can be obtained from Solidity with
   * `type(contractName).creationCode`.
   *
   * Requirements:
   *
   * - `bytecode` must not be empty.
   * - `salt` must have not been used for `bytecode` already.
   */
  function deploy(bytes memory byteCode, uint256 salt) internal returns (address addr) {
    assembly {
      addr := create2(0, add(byteCode, 0x20), mload(byteCode), salt)
      if iszero(extcodesize(addr)) {
        revert(0, 0)
      }
    }
  }
}
