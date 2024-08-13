// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { System } from "@latticexyz/world/src/System.sol";
import { AccessControl } from "@latticexyz/world/src/AccessControl.sol";
import { Metadata } from "./codegen/tables/Metadata.sol";

contract MetadataSystem is System {
  function setMetadata(ResourceId resource, bytes32 name, string memory value) external {
    AccessControl.requireExistence(resource);
    AccessControl.requireOwner(resource, _msgSender());
    Metadata.set(resource, name, value);
  }
}
