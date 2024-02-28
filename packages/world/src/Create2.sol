// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

/**
 * @title Create2
 * @author MUD (https://mud.dev) by Lattice (https://lattice.xyz)
 * @dev Library to deploy contracts using the CREATE2 opcode.
 */
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
   * - `creationCode` must not be empty.
   * - `salt` must have not been used for `creationCode` already.
   *
   * @param creationCode The bytecode of the contract to be deployed.
   * @param salt A 256-bit value that, combined with the bytecode, determines the address.
   * @return addr The address of the newly deployed contract.
   * @dev If the CREATE2 fails, reverts
   */
  function deploy(bytes memory creationCode, uint256 salt) internal returns (address addr) {
    assembly {
      // creationCode is one word (0x20 bytes) with the length, followed by the actual
      // code for the constructor. So the code starts at creationCode+0x20, and is mload(creationCode)
      // bytes long.
      addr := create2(0, add(creationCode, 0x20), mload(creationCode), salt)
      // If the create2 call failed, then the address will be zero
      if iszero(addr) {
        revert(0, 0)
      }
    }
  }
}
