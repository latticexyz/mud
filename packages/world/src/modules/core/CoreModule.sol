// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { ROOT_NAMESPACE } from "../../Constants.sol";

import { IModule } from "../../interfaces/IModule.sol";

import { NamespaceOwner } from "../../tables/NamespaceOwner.sol";
import { ResourceAccess } from "../../tables/ResourceAccess.sol";
import { Systems } from "../../tables/Systems.sol";
import { FunctionSelectors } from "../../tables/FunctionSelectors.sol";

/**
 * The CoreModule registers internal World tables.

 * Note:
 * This module is required to be delegatecalled via `World.registerRootSystem`.
 * because otherwise the registration of tables would require the `registerTable`
 * function selector to already exist on the World, but it is only
 * added in `RegistrationModule`, which is installed after `CoreModule`.
 */
contract CoreModule is IModule {
  function install(bytes16) external override {
    NamespaceOwner.setMetadata();

    ResourceAccess.registerSchema();
    ResourceAccess.setMetadata();
    ResourceAccess.set(ROOT_NAMESPACE, msg.sender, true);

    Systems.registerSchema();
    Systems.setMetadata();

    FunctionSelectors.registerSchema();
    FunctionSelectors.setMetadata();
  }
}
