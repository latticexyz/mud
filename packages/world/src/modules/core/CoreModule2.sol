// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { WorldContextProviderLib } from "../../WorldContext.sol";
import { Module } from "../../Module.sol";

import { CoreSystem2 } from "./CoreSystem2.sol";
import { CORE_MODULE_2_NAME, CORE_SYSTEM_ID, CORE_SYSTEM_2_ID } from "./constants.sol";

import { Systems } from "../../codegen/tables/Systems.sol";
import { FunctionSelectors } from "../../codegen/tables/FunctionSelectors.sol";
import { FunctionSignatures } from "../../codegen/tables/FunctionSignatures.sol";

import { WorldRegistrationSystem } from "./implementations/WorldRegistrationSystem.sol";

/**
 * @title Core Module 2
 * @notice Registers internal World tables, the CoreSystem2, and its function selectors.
 * @dev This module only supports `installRoot` because it installs root tables, systems and function selectors.
 */

contract CoreModule2 is Module {
  /**
   * @dev Since the CoreSystem2 only exists once per World and writes to
   * known tables, we can deploy it once and register it in multiple Worlds.
   */
  address immutable coreSystem2 = address(new CoreSystem2());

  /**
   * @notice Get the name of the module.
   * @return Module name as bytes16.
   */
  function getName() public pure returns (bytes16) {
    return CORE_MODULE_2_NAME;
  }

  /**
   * @notice Root installation of the module.
   * @dev Registers core tables, systems, and function selectors in the World.
   */
  function installRoot(bytes memory) public override {
    _registerCoreSystem2();
    _registerFunctionSelectors();
  }

  /**
   * @notice Non-root installation of the module.
   * @dev Installation is only supported at root level, so this function will always revert.
   */
  function install(bytes memory) public pure {
    revert Module_NonRootInstallNotSupported();
  }

  /**
   * @notice Register the CoreSystem2 in the World.
   * @dev Uses the CoreSystem2's `registerSystem` implementation to register itself on the World.
   */
  function _registerCoreSystem2() internal {
    (address coreSystem, ) = Systems.get(CORE_SYSTEM_ID);
    WorldContextProviderLib.delegatecallWithContextOrRevert({
      msgSender: _msgSender(),
      msgValue: 0,
      target: coreSystem,
      callData: abi.encodeCall(
        WorldRegistrationSystem.registerSystem,
        (CORE_SYSTEM_2_ID, CoreSystem2(coreSystem2), true)
      )
    });
  }

  /**
   * @notice Register function selectors for all CoreSystem2 functions in the World.
   * @dev Iterates through known function signatures and registers them.
   */
  function _registerFunctionSelectors() internal {
    (address coreSystem, ) = Systems.get(CORE_SYSTEM_ID);

    string[2] memory functionSignatures = [
      // --- BalanceTransferSystem ---
      "transferBalanceToNamespace(bytes32,bytes32,uint256)",
      "transferBalanceToAddress(bytes32,address,uint256)"
    ];

    for (uint256 i = 0; i < functionSignatures.length; i++) {
      // Use the CoreSystem's `registerRootFunctionSelector` to register the
      // root function selectors in the World.
      WorldContextProviderLib.delegatecallWithContextOrRevert({
        msgSender: _msgSender(),
        msgValue: 0,
        target: coreSystem,
        callData: abi.encodeCall(
          WorldRegistrationSystem.registerRootFunctionSelector,
          (CORE_SYSTEM_2_ID, functionSignatures[i], bytes4(keccak256(bytes(functionSignatures[i]))))
        )
      });
    }
  }
}
