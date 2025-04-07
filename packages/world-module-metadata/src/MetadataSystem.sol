// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { System } from "@latticexyz/world/src/System.sol";
import { AccessControl } from "@latticexyz/world/src/AccessControl.sol";

import { ResourceTag } from "./codegen/tables/ResourceTag.sol";

contract MetadataSystem is System {
  function getResourceTag(ResourceId resource, bytes32 tag) public view returns (bytes memory) {
    return ResourceTag.get(resource, tag);
  }

  function setResourceTag(ResourceId resource, bytes32 tag, bytes memory value) public {
    AccessControl.requireOwner(resource, _msgSender());
    ResourceTag.set(resource, tag, value);
  }

  function deleteResourceTag(ResourceId resource, bytes32 tag) public {
    AccessControl.requireOwner(resource, _msgSender());
    ResourceTag.deleteRecord(resource, tag);
  }
}
