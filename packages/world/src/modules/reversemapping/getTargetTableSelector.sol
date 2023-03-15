// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { ResourceSelector } from "../../ResourceSelector.sol";
import { MODULE_NAMESPACE } from "./constants.sol";

/**
 * Get a deterministic selector for the reverse mapping table for the given source table.
 * The selector is constructed as follows:
 *  - The first 12 bytes are the module namespace
 *  - The next 4 bytes are an ASCII hash of the source table id (namespace + file)
 *    -- This is to avoid collisions between tables with the same name in different namespaces
 *    -- We use ASCII to make the selector readable in logs and errors
 *  - The last 16 bytes are the source table name
 */
function getTargetTableSelector(uint256 sourceTableId) pure returns (bytes32) {
  bytes16 tableName = ResourceSelector.getFile(ResourceSelector.from(sourceTableId));
  bytes4 sourceTableHash = toPrintableASCII_bytes4(bytes4(keccak256(abi.encodePacked(sourceTableId))));
  return bytes32(abi.encodePacked(MODULE_NAMESPACE, sourceTableHash, tableName));
}

/**
 * Map the given bytes to a printable ASCII character (32-126).
 */
function toPrintableASCII_bytes1(bytes1 input) pure returns (bytes1) {
  return bytes1(32 + uint8(input) / 3);
}

function toPrintableASCII_bytes4(bytes4 input) pure returns (bytes4) {
  return
    bytes4(toPrintableASCII_bytes1(input[0])) |
    (bytes4(toPrintableASCII_bytes1(input[1])) >> 8) |
    (bytes4(toPrintableASCII_bytes1(input[2])) >> 16) |
    (bytes4(toPrintableASCII_bytes1(input[3])) >> 24);
}
