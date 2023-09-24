// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { DelegationControl } from "../src/DelegationControl.sol";
import { ResourceId, WorldResourceIdInstance } from "../src/WorldResourceId.sol";

contract DelegationControlMock is DelegationControl {
  using WorldResourceIdInstance for ResourceId;

  mapping(ResourceId => address) public trustedForwarders;

  function verify(address delegator, ResourceId systemId, bytes memory callData) public returns (bool) {
    return trustedForwarders[systemId.getNamespaceId()] == _msgSender();
  }

  function initDelegation(ResourceId namespaceId, address trustedForwarder) public {
    trustedForwarders[namespaceId] = trustedForwarder;
  }
}
