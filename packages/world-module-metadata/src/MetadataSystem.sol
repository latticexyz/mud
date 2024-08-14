// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { System } from "@latticexyz/world/src/System.sol";
import { requireExistence, requireOwner } from "./common.sol";
import { ResourceTag } from "./codegen/tables/ResourceTag.sol";

contract MetadataSystem is System {
  function hasResourceTag(ResourceId resource, bytes32 tag) public view returns (bool) {
    return ResourceTag.get(resource, tag).length != 0;
  }

  function getResourceTag(ResourceId resource, bytes32 tag) public view returns (bytes memory) {
    return ResourceTag.get(resource, tag);
  }

  function tagResource(ResourceId resource, bytes32 tag) public {
    _tagResource(resource, tag, abi.encodePacked(true));
  }

  function tagResource(ResourceId resource, bytes32 tag, bytes memory value) public {
    _tagResource(resource, tag, value);
  }

  function _tagResource(ResourceId resource, bytes32 tag, bytes memory value) internal {
    requireExistence(resource);
    requireOwner(resource, _msgSender());
    ResourceTag.set(resource, tag, value);
  }

  function untagResource(ResourceId resource, bytes32 tag) public {
    requireExistence(resource);
    requireOwner(resource, _msgSender());
    ResourceTag.deleteRecord(resource, tag);
  }
}
