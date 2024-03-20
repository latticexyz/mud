// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";

// From https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/cryptography/MessageHashUtils.sol#L30
function toEthSignedMessageHash(bytes32 messageHash) pure returns (bytes32 digest) {
  /// @solidity memory-safe-assembly
  assembly {
    mstore(0x00, "\x19Ethereum Signed Message:\n32") // 32 is the bytes-length of messageHash
    mstore(0x1c, messageHash) // 0x1c (28) is the length of the prefix
    digest := keccak256(0x00, 0x3c) // 0x3c is the length of the prefix (0x1c) + messageHash (0x20)
  }
}

function getSignedMessageHash(
  address delegatee,
  ResourceId delegationControlId,
  bytes memory initCallData,
  uint256 nonce
) pure returns (bytes32) {
  return toEthSignedMessageHash(keccak256(abi.encodePacked(delegatee, delegationControlId, initCallData, nonce)));
}

// From https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/cryptography/ECDSA.sol#L122
function tryRecover(bytes32 hash, uint8 v, bytes32 r, bytes32 s) pure returns (address) {
  // EIP-2 still allows signature malleability for ecrecover(). Remove this possibility and make the signature
  // unique. Appendix F in the Ethereum Yellow paper (https://ethereum.github.io/yellowpaper/paper.pdf), defines
  // the valid range for s in (301): 0 < s < secp256k1n ÷ 2 + 1, and for v in (302): v ∈ {27, 28}. Most
  // signatures from current libraries generate a unique signature with an s-value in the lower half order.
  //
  // If your library generates malleable signatures, such as s-values in the upper range, calculate a new s-value
  // with 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141 - s1 and flip v from 27 to 28 or
  // vice versa. If your library also generates signatures with 0/1 for v instead 27/28, add 27 to v to accept
  // these malleable signatures as well.
  if (uint256(s) > 0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF5D576E7357A4501DDFE92F46681B20A0) {
    return address(0);
  }

  // If the signature is valid (and not malleable), return the signer address
  address signer = ecrecover(hash, v, r, s);
  if (signer == address(0)) {
    return address(0);
  }

  return signer;
}

// From https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/cryptography/ECDSA.sol#L100
function tryRecover(bytes32 hash, bytes32 r, bytes32 vs) pure returns (address) {
  unchecked {
    bytes32 s = vs & bytes32(0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff);
    // We do not check for an overflow here since the shift operation results in 0 or 1.
    uint8 v = uint8((uint256(vs) >> 255) + 27);
    return tryRecover(hash, v, r, s);
  }
}

// From https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/cryptography/ECDSA.sol#L56
function tryRecover(bytes32 hash, bytes memory signature) pure returns (address) {
  if (signature.length == 65) {
    bytes32 r;
    bytes32 s;
    uint8 v;
    // ecrecover takes the signature parameters, and the only way to get them
    // currently is to use assembly.
    /// @solidity memory-safe-assembly
    assembly {
      r := mload(add(signature, 0x20))
      s := mload(add(signature, 0x40))
      v := byte(0, mload(add(signature, 0x60)))
    }
    return tryRecover(hash, v, r, s);
  } else {
    return address(0);
  }
}
