// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { System } from "@latticexyz/world/src/System.sol";
import { AccessControlLib } from "./AccessControlLib.sol";
import { Resource } from "./codegen/tables/Resource.sol";

contract MetadataSystem is System {
  function setResource(ResourceId resource, bytes32 name, string memory value) public {
    AccessControlLib.requireExistence(resource);
    AccessControlLib.requireOwner(resource, _msgSender());
    Resource.set(resource, name, value);
  }
}
