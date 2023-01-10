// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IOwnableWritable } from "./IOwnableWritable.sol";
import { LibTypes } from "../LibTypes.sol";

interface IComponent is IOwnableWritable {
  /** Return the keys and value types of the schema of this component. */
  function getSchema() external pure returns (string[] memory keys, LibTypes.SchemaValue[] memory values);

  function set(uint256 entity, bytes memory value) external;

  function remove(uint256 entity) external;

  function has(uint256 entity) external view returns (bool);

  function getRawValue(uint256 entity) external view returns (bytes memory);

  function getEntities() external view returns (uint256[] memory);

  function getEntitiesWithValue(bytes memory value) external view returns (uint256[] memory);

  function registerIndexer(address indexer) external;

  function world() external view returns (address);
}
