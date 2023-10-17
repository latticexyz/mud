// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;
import { DelegationControl } from "@latticexyz/world/src/DelegationControl.sol";
import { WorldResourceIdInstance } from "@latticexyz/world/src/WorldResourceId.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { ERC20Registry } from "./tables/ERC20Registry.sol";
import { ERC20_REGISTRY_TABLE_ID } from "./constants.sol";

contract ERC20DelegationControl is DelegationControl {
  using WorldResourceIdInstance for ResourceId;

  function verify(address, ResourceId systemId, bytes memory) external view returns (bool) {
    address delegatee = _msgSender();
    return ERC20Registry.get(ERC20_REGISTRY_TABLE_ID, systemId.getNamespaceId()) == delegatee;
  }
}
