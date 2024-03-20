// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";

bytes32 constant EIP712_DOMAIN = keccak256(
  "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
);
bytes32 constant DELEGATION_TYPEHASH = keccak256(
  "Delegation(address delegatee,bytes32 delegationControlId,bytes initCallData,uint256 nonce)"
);

string constant name = "batman";
string constant version = "134";
bytes32 constant hashedName = keccak256(abi.encode(name));
bytes32 constant hashedVersion = keccak256(abi.encode(version));
address constant verifyingContract = 0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC;

function toTypedDataHash(bytes32 domainSeparator, bytes32 structHash) pure returns (bytes32 digest) {
  /// @solidity memory-safe-assembly
  assembly {
    let ptr := mload(0x40)
    mstore(ptr, hex"19_01")
    mstore(add(ptr, 0x02), domainSeparator)
    mstore(add(ptr, 0x22), structHash)
    digest := keccak256(ptr, 0x42)
  }
}

function _buildDomainSeparator() view returns (bytes32) {
  return keccak256(abi.encode(EIP712_DOMAIN, hashedName, hashedVersion, block.chainid, verifyingContract));
}

function _domainSeparatorV4() view returns (bytes32) {
  return _buildDomainSeparator();
}

function _hashTypedDataV4(bytes32 structHash) view returns (bytes32) {
  return toTypedDataHash(_domainSeparatorV4(), structHash);
}

function getSignedMessageHash(
  address delegatee,
  ResourceId delegationControlId,
  bytes memory initCallData,
  uint256 nonce
) view returns (bytes32) {
  return
    _hashTypedDataV4(
      keccak256(abi.encode(DELEGATION_TYPEHASH, delegatee, delegationControlId, keccak256(initCallData), nonce))
    );
}
