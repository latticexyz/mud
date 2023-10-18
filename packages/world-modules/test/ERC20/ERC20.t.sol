// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { Test } from "forge-std/Test.sol";
import { console } from "forge-std/console.sol";

import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { World } from "@latticexyz/world/src/World.sol";
import { WorldResourceIdLib } from "@latticexyz/world/src/WorldResourceId.sol";
import { CoreModule } from "@latticexyz/world/src/modules/core/CoreModule.sol";
import { IBaseWorld } from "@latticexyz/world/src/codegen/interfaces/IBaseWorld.sol";
import { NamespaceOwner } from "@latticexyz/world/src/codegen/tables/NamespaceOwner.sol";

import { ERC20Module } from "../../src/modules/erc20/ERC20Module.sol";
import { MetadataData } from "../../src/modules/erc20/tables/Metadata.sol";
import { ERC20Registry } from "../../src/modules/erc20/tables/ERC20Registry.sol";
import { ERC20_REGISTRY_TABLE_ID } from "../../src/modules/erc20/constants.sol";
import { ERC20Proxy } from "../../src/modules/erc20/ERC20Proxy.sol";
import { IERC20Events } from "../../src/modules/erc20/IERC20Events.sol";

bytes14 constant TEST_NAMESPACE = "myerc20";

contract ERC20Test is Test, IERC20Events {
  IBaseWorld world;
  ERC20Module erc20Module;
  ERC20Proxy token;
  ResourceId namespaceId;

  function setUp() public {
    world = IBaseWorld(address(new World()));
    world.initialize(new CoreModule());
    StoreSwitch.setStoreAddress(address(world));

    namespaceId = WorldResourceIdLib.encodeNamespace(TEST_NAMESPACE);

    // Deploy a new ERC20 module
    erc20Module = new ERC20Module();

    // Install the ERC20 module
    world.installModule(
      erc20Module,
      abi.encode(TEST_NAMESPACE, MetadataData({ totalSupply: 0, decimals: 18, name: "Token", symbol: "TKN" }))
    );

    token = ERC20Proxy(ERC20Registry.get(ERC20_REGISTRY_TABLE_ID, WorldResourceIdLib.encodeNamespace(TEST_NAMESPACE)));
  }

  function testSetUp() public {
    assertTrue(address(token) != address(0));
    assertEq(NamespaceOwner.get(namespaceId), address(this));
  }

  function testInstallTwice() public {
    bytes14 namespace = "anotherERC20";
    // Install the ERC20 module
    world.installModule(
      erc20Module,
      abi.encode(namespace, MetadataData({ totalSupply: 0, decimals: 18, name: "Test Token", symbol: "TST" }))
    );

    address tokenAddress = ERC20Registry.get(ERC20_REGISTRY_TABLE_ID, WorldResourceIdLib.encodeNamespace(namespace));
    assertTrue(tokenAddress != address(0));
  }

  /////////////////////////////////////////////////
  // SOLADY ERC20 TEST CAES
  // (https://github.com/Vectorized/solady/blob/main/test/ERC20.t.sol)
  /////////////////////////////////////////////////

  function testMetadata() public {
    assertEq(token.name(), "Token");
    assertEq(token.symbol(), "TKN");
    assertEq(token.decimals(), 18);
  }

  function testMint() public {
    vm.expectEmit(true, true, true, true);
    emit Transfer(address(0), address(0xBEEF), 1e18);
    token.mint(address(0xBEEF), 1e18);

    assertEq(token.totalSupply(), 1e18);
    assertEq(token.balanceOf(address(0xBEEF)), 1e18);
  }
}
