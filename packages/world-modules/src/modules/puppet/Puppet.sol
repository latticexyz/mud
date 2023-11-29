// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { IBaseWorld } from "@latticexyz/world/src/codegen/interfaces/IBaseWorld.sol";
import { Systems } from "@latticexyz/world/src/codegen/tables/Systems.sol";

contract Puppet {
  error Puppet_AccessDenied(address caller);

  IBaseWorld public immutable world;
  ResourceId public immutable systemId;

  constructor(IBaseWorld _world, ResourceId _systemId) {
    world = _world;
    systemId = _systemId;
    StoreSwitch.setStoreAddress(address(_world));
  }

  modifier onlyPuppetMaster() {
    (address systemAddress, ) = Systems.get(systemId);
    if (msg.sender != systemAddress) {
      revert Puppet_AccessDenied(msg.sender);
    }
    _;
  }

  fallback() external {
    // Forward all calls to the system in the world
    bytes memory returnData = world.callFrom(msg.sender, systemId, msg.data);

    // If the call was successful, return the return data
    assembly {
      return(add(returnData, 0x20), mload(returnData))
    }
  }

  /**
   * @dev Log an event with a signature and no additional topic
   */
  function log(bytes32 eventSignature, bytes memory eventData) public onlyPuppetMaster {
    assembly {
      log1(add(eventData, 0x20), mload(eventData), eventSignature)
    }
  }

  /**
   * @dev Log an event with a signature and one additional topics
   */
  function log(bytes32 eventSignature, bytes32 topic1, bytes memory eventData) public onlyPuppetMaster {
    assembly {
      log2(add(eventData, 0x20), mload(eventData), eventSignature, topic1)
    }
  }

  /**
   * @dev Log an event with a signature and two additional topics
   */
  function log(bytes32 eventSignature, bytes32 topic1, bytes32 topic2, bytes memory eventData) public onlyPuppetMaster {
    assembly {
      log3(add(eventData, 0x20), mload(eventData), eventSignature, topic1, topic2)
    }
  }

  /**
   * @dev Log an event with a signature and three additional topics
   */
  function log(
    bytes32 eventSignature,
    bytes32 topic1,
    bytes32 topic2,
    bytes32 topic3,
    bytes memory eventData
  ) public onlyPuppetMaster {
    assembly {
      log4(add(eventData, 0x20), mload(eventData), eventSignature, topic1, topic2, topic3)
    }
  }
}
