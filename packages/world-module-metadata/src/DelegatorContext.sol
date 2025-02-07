// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { IBaseWorld } from "@latticexyz/world/src/codegen/interfaces/IBaseWorld.sol";
import { ResourceId } from "@latticexyz/world/src/WorldResourceId.sol";
import { REGISTRATION_SYSTEM_ID } from "@latticexyz/world/src/modules/init/constants.sol";
import { FieldLayout } from "@latticexyz/store/src/FieldLayout.sol";
import { Schema } from "@latticexyz/store/src/Schema.sol";
import { System } from "@latticexyz/world/src/System.sol";

// TODO: move this into world? or codegen it? would be nice to have this for every system

// TODO: name?
struct DelegatorContext {
  IBaseWorld world;
  address delegator;
}

library DelegatedRegistrationSystemLib {
  function registerNamespace(DelegatorContext memory context, ResourceId namespace) internal {
    context.world.callFrom(
      context.delegator,
      REGISTRATION_SYSTEM_ID,
      abi.encodeCall(context.world.registerNamespace, (namespace))
    );
  }

  function registerTable(
    DelegatorContext memory context,
    ResourceId tableId,
    FieldLayout fieldLayout,
    Schema keySchema,
    Schema valueSchema,
    string[] memory keyNames,
    string[] memory fieldNames
  ) internal {
    context.world.callFrom(
      context.delegator,
      REGISTRATION_SYSTEM_ID,
      abi.encodeCall(context.world.registerTable, (tableId, fieldLayout, keySchema, valueSchema, keyNames, fieldNames))
    );
  }

  function registerSystem(
    DelegatorContext memory context,
    ResourceId systemId,
    System system,
    bool publicAccess
  ) internal {
    context.world.callFrom(
      context.delegator,
      REGISTRATION_SYSTEM_ID,
      abi.encodeCall(context.world.registerSystem, (systemId, system, publicAccess))
    );
  }

  function registerFunctionSelector(
    DelegatorContext memory context,
    ResourceId systemId,
    string memory systemFunctionSignature
  ) internal returns (bytes4 worldFunctionSelector) {
    bytes memory returnData = context.world.callFrom(
      context.delegator,
      REGISTRATION_SYSTEM_ID,
      abi.encodeCall(context.world.registerFunctionSelector, (systemId, systemFunctionSignature))
    );
    return bytes4(returnData);
  }
}
