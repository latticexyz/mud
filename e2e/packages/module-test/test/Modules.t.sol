// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;
import { ResourceIds } from "@latticexyz/store/src/codegen/index.sol";

import { IBaseWorld } from "@latticexyz/world/src/codegen/interfaces/IBaseWorld.sol";
import { ResourceId, WorldResourceIdLib } from "@latticexyz/world/src/WorldResourceId.sol";
import { MudTest } from "@latticexyz/world/test/MudTest.t.sol";

contract ModulesTest is MudTest {
  function testModulesInstalled() public {
    ResourceId erc20PuppetNamespaceId = WorldResourceIdLib.encodeNamespace("MyToken");
    ResourceId erc721PuppetNamespaceId = WorldResourceIdLib.encodeNamespace("MyNFT");
    ResourceId erc20NamespaceId = WorldResourceIdLib.encodeNamespace("erc20Namespace");

    assertTrue(ResourceIds.getExists(erc20PuppetNamespaceId));
    assertTrue(ResourceIds.getExists(erc721PuppetNamespaceId));
    assertTrue(ResourceIds.getExists(erc20NamespaceId));
  }
}
