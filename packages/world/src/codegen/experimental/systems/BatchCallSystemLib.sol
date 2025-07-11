// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

/* Autogenerated file. Do not edit manually. */

import { BatchCallSystem } from "../../../modules/init/implementations/BatchCallSystem.sol";
import { SystemCallData, SystemCallFromData } from "../../../modules/init/types.sol";
import { revertWithBytes } from "../../../revertWithBytes.sol";
import { IWorldCall } from "../../../IWorldKernel.sol";
import { SystemCall } from "../../../SystemCall.sol";
import { WorldContextConsumerLib } from "../../../WorldContext.sol";
import { Systems } from "../../../codegen/tables/Systems.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";

type BatchCallSystemType is bytes32;

// equivalent to WorldResourceIdLib.encode({ typeId: RESOURCE_SYSTEM, namespace: "", name: "BatchCall" }))
BatchCallSystemType constant batchCallSystem = BatchCallSystemType.wrap(
  0x73790000000000000000000000000000426174636843616c6c00000000000000
);

struct CallWrapper {
  ResourceId systemId;
  address from;
}

struct RootCallWrapper {
  ResourceId systemId;
  address from;
}

/**
 * @title BatchCallSystemLib
 * @author MUD (https://mud.dev) by Lattice (https://lattice.xyz)
 * @dev This library is automatically generated from the corresponding system contract. Do not edit manually.
 */
library BatchCallSystemLib {
  error BatchCallSystemLib_CallingFromRootSystem();

  function batchCall(
    BatchCallSystemType self,
    SystemCallData[] memory systemCalls
  ) internal returns (bytes[] memory returnDatas) {
    return CallWrapper(self.toResourceId(), address(0)).batchCall(systemCalls);
  }

  function batchCallFrom(
    BatchCallSystemType self,
    SystemCallFromData[] memory systemCalls
  ) internal returns (bytes[] memory returnDatas) {
    return CallWrapper(self.toResourceId(), address(0)).batchCallFrom(systemCalls);
  }

  function batchCall(
    CallWrapper memory self,
    SystemCallData[] memory systemCalls
  ) internal returns (bytes[] memory returnDatas) {
    // if the contract calling this function is a root system, it should use `callAsRoot`
    if (address(_world()) == address(this)) revert BatchCallSystemLib_CallingFromRootSystem();

    bytes memory systemCall = abi.encodeCall(_batchCall_SystemCallDataArray.batchCall, (systemCalls));

    bytes memory result = self.from == address(0)
      ? _world().call(self.systemId, systemCall)
      : _world().callFrom(self.from, self.systemId, systemCall);
    // skip decoding an empty result, which can happen after expectRevert
    if (result.length != 0) {
      return abi.decode(result, (bytes[]));
    }
  }

  function batchCallFrom(
    CallWrapper memory self,
    SystemCallFromData[] memory systemCalls
  ) internal returns (bytes[] memory returnDatas) {
    // if the contract calling this function is a root system, it should use `callAsRoot`
    if (address(_world()) == address(this)) revert BatchCallSystemLib_CallingFromRootSystem();

    bytes memory systemCall = abi.encodeCall(_batchCallFrom_SystemCallFromDataArray.batchCallFrom, (systemCalls));

    bytes memory result = self.from == address(0)
      ? _world().call(self.systemId, systemCall)
      : _world().callFrom(self.from, self.systemId, systemCall);
    // skip decoding an empty result, which can happen after expectRevert
    if (result.length != 0) {
      return abi.decode(result, (bytes[]));
    }
  }

  function batchCall(
    RootCallWrapper memory self,
    SystemCallData[] memory systemCalls
  ) internal returns (bytes[] memory returnDatas) {
    bytes memory systemCall = abi.encodeCall(_batchCall_SystemCallDataArray.batchCall, (systemCalls));

    bytes memory result = SystemCall.callWithHooksOrRevert(self.from, self.systemId, systemCall, msg.value);
    // skip decoding an empty result, which can happen after expectRevert
    if (result.length != 0) {
      return abi.decode(result, (bytes[]));
    }
  }

  function batchCallFrom(
    RootCallWrapper memory self,
    SystemCallFromData[] memory systemCalls
  ) internal returns (bytes[] memory returnDatas) {
    bytes memory systemCall = abi.encodeCall(_batchCallFrom_SystemCallFromDataArray.batchCallFrom, (systemCalls));

    bytes memory result = SystemCall.callWithHooksOrRevert(self.from, self.systemId, systemCall, msg.value);
    // skip decoding an empty result, which can happen after expectRevert
    if (result.length != 0) {
      return abi.decode(result, (bytes[]));
    }
  }

  function callFrom(BatchCallSystemType self, address from) internal pure returns (CallWrapper memory) {
    return CallWrapper(self.toResourceId(), from);
  }

  function callAsRoot(BatchCallSystemType self) internal view returns (RootCallWrapper memory) {
    return RootCallWrapper(self.toResourceId(), WorldContextConsumerLib._msgSender());
  }

  function callAsRootFrom(BatchCallSystemType self, address from) internal pure returns (RootCallWrapper memory) {
    return RootCallWrapper(self.toResourceId(), from);
  }

  function toResourceId(BatchCallSystemType self) internal pure returns (ResourceId) {
    return ResourceId.wrap(BatchCallSystemType.unwrap(self));
  }

  function fromResourceId(ResourceId resourceId) internal pure returns (BatchCallSystemType) {
    return BatchCallSystemType.wrap(resourceId.unwrap());
  }

  function getAddress(BatchCallSystemType self) internal view returns (address) {
    return Systems.getSystem(self.toResourceId());
  }

  function _world() private view returns (IWorldCall) {
    return IWorldCall(StoreSwitch.getStoreAddress());
  }
}

/**
 * System Function Interfaces
 *
 * We generate an interface for each system function, which is then used for encoding system calls.
 * This is necessary to handle function overloading correctly (which abi.encodeCall cannot).
 *
 * Each interface is uniquely named based on the function name and parameters to prevent collisions.
 */

interface _batchCall_SystemCallDataArray {
  function batchCall(SystemCallData[] memory systemCalls) external;
}

interface _batchCallFrom_SystemCallFromDataArray {
  function batchCallFrom(SystemCallFromData[] memory systemCalls) external;
}

using BatchCallSystemLib for BatchCallSystemType global;
using BatchCallSystemLib for CallWrapper global;
using BatchCallSystemLib for RootCallWrapper global;
