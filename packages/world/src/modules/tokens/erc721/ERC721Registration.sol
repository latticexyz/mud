// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IBaseWorld } from "@latticexyz/world/src/interfaces/IBaseWorld.sol";
import { ERC721Proxy } from "./ERC721Proxy.sol";

import { ERC721_S, ERC721_T, METADATA_T, BALANCE_T, ALLOWANCE_T } from "../common/constants.sol";
import { BalanceTable } from "../common/BalanceTable.sol";
import { AllowanceTable } from "../common/AllowanceTable.sol";
import { MetadataTable } from "../common/MetadataTable.sol";
import { ERC721Table } from "./ERC721Table.sol";
import { ResourceSelector } from "@latticexyz/world/src/ResourceSelector.sol";

library ERC721Registration {
  function install(IBaseWorld world, bytes16 namespace, string memory _name, string memory _symbol) internal {
    ERC721Proxy proxy = new ERC721Proxy(world, namespace);

    bytes32 metadataTableId = registerTables(world, namespace);

    address proxyAddress = address(proxy);
    MetadataTable.setProxy(world, metadataTableId, proxyAddress);
    MetadataTable.setName(world, metadataTableId, _name);
    MetadataTable.setSymbol(world, metadataTableId, _symbol);

    world.registerFunctionSelector(namespace, ERC721_S, "name", "(bytes16)");
    world.registerFunctionSelector(namespace, ERC721_S, "symbol", "(bytes16)");
    world.registerFunctionSelector(namespace, ERC721_S, "proxy", "(bytes16)");
    world.registerFunctionSelector(namespace, ERC721_S, "totalSupply", "(bytes16)");
    world.registerFunctionSelector(namespace, ERC721_S, "balanceOf", "(bytes16, address)");
    world.registerFunctionSelector(namespace, ERC721_S, "transfer", "(bytes16, address, uint256)");
    world.registerFunctionSelector(namespace, ERC721_S, "allowance", "(bytes16, address, address)");
    world.registerFunctionSelector(namespace, ERC721_S, "approve", "(bytes16, address, uint256)");
    world.registerFunctionSelector(namespace, ERC721_S, "transferFrom", "(bytes16, address, address, uint256)");
    world.registerFunctionSelector(namespace, ERC721_S, "increaseAllowance", "(bytes16, address, uint256)");
    world.registerFunctionSelector(namespace, ERC721_S, "decreaseAllowance", "(bytes16, address, uint256)");

    // set token metadata
    // let the proxy contract modify tables directly
    world.grantAccess(namespace, METADATA_T, proxyAddress);
    world.grantAccess(namespace, ALLOWANCE_T, proxyAddress);
    world.grantAccess(namespace, BALANCE_T, proxyAddress);
    world.grantAccess(namespace, ERC721_T, proxyAddress);
  }

  function registerCoreFunctions(IBaseWorld world, bytes16 namespace) private {
    world.registerFunctionSelector(namespace, ERC721_S, "name", "(bytes16)");
    world.registerFunctionSelector(namespace, ERC721_S, "symbol", "(bytes16)");
    world.registerFunctionSelector(namespace, ERC721_S, "proxy", "(bytes16)");
    world.registerFunctionSelector(namespace, ERC721_S, "totalSupply", "(bytes16)");
    world.registerFunctionSelector(namespace, ERC721_S, "balanceOf", "(bytes16, address)");
    world.registerFunctionSelector(namespace, ERC721_S, "transfer", "(bytes16, address, uint256)");
    world.registerFunctionSelector(namespace, ERC721_S, "allowance", "(bytes16, address, address)");
    world.registerFunctionSelector(namespace, ERC721_S, "approve", "(bytes16, address, uint256)");
    world.registerFunctionSelector(namespace, ERC721_S, "transferFrom", "(bytes16, address, address, uint256)");
    world.registerFunctionSelector(namespace, ERC721_S, "increaseAllowance", "(bytes16, address, uint256)");
    world.registerFunctionSelector(namespace, ERC721_S, "decreaseAllowance", "(bytes16, address, uint256)");
  }

  function registerTables(IBaseWorld world, bytes16 namespace) private returns (bytes32 metadataTableId) {
    world.registerTable(namespace, BALANCE_T, BalanceTable.getSchema(), BalanceTable.getKeySchema());
    world.registerTable(namespace, ALLOWANCE_T, AllowanceTable.getSchema(), AllowanceTable.getKeySchema());
    world.registerTable(namespace, ERC721_T, ERC721Table.getSchema(), ERC721Table.getKeySchema());
    metadataTableId = world.registerTable(
      namespace,
      METADATA_T,
      MetadataTable.getSchema(),
      MetadataTable.getKeySchema()
    );
  }
}
