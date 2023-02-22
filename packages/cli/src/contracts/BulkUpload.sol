// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";

import {BulkSetStateSystem, ID as BulkSetStateSystemID, ECSEvent} from "std-contracts/systems/BulkSetStateSystem.sol";
import {World} from "solecs/World.sol";
import {System} from "solecs/System.sol";
import {getAddressById} from "solecs/utils.sol";
import {Set} from "solecs/Set.sol";

struct ParsedState {
  string[] componentIds;
  string[] entities;
  ParsedECSEvent[] state;
}

struct ParsedECSEvent {
  uint8 component;
  uint32 entity;
  string value;
}

struct State {
  uint256[] componentIds;
  uint256[] entities;
  ECSEvent[] state;
}

/**
 * Usage:
 * forge script --sig "run(string, address)" --rpc-url http://localhost:8545 src/contracts/BulkUpload.sol:BulkUpload path/to/ecs-map-test.json <WORLD_ADDRESS>
 */
contract BulkUpload is Script {
  function run(
    string memory path,
    address worldAddress,
    uint256 eventsPerTx
  ) public {
    vmSafe.startBroadcast();

    // Read JSON
    console.log(path);
    string memory json = vmSafe.readFile(path);

    console.log(worldAddress);

    // Parse JSON
    ParsedState memory parsedState = abi.decode(vmSafe.parseJson(json), (ParsedState));

    // Convert component ids
    uint256[] memory componentIds = new uint256[](parsedState.componentIds.length);
    for (uint256 i; i < componentIds.length; i++) {
      componentIds[i] = hexToUint256(parsedState.componentIds[i]);
    }

    // Convert entitiy ids
    uint256[] memory entities = new uint256[](parsedState.entities.length);
    for (uint256 i; i < entities.length; i++) {
      entities[i] = hexToUint256(parsedState.entities[i]);
    }
    World world = World(worldAddress);
    System bulkSetStateSystem = System(getAddressById(world.systems(), BulkSetStateSystemID));

    // Convert state
    ECSEvent[] memory allEvents = new ECSEvent[](parsedState.state.length);
    for (uint256 i; i < parsedState.state.length; i++) {
      ParsedECSEvent memory p = parsedState.state[i];

      // Convert value hex string to bytes
      bytes memory value = hexToBytes(substring(p.value, 2, bytes(p.value).length));
      allEvents[i] = ECSEvent(p.component, p.entity, value);
    }

    uint256 numTxs = allEvents.length / eventsPerTx;

    for (uint256 i = 0; i < numTxs; i++) {
      ECSEvent[] memory events = new ECSEvent[](eventsPerTx);
      for (uint256 j = 0; j < eventsPerTx; j++) {
        events[j] = allEvents[i * eventsPerTx + j];
      }

      (uint256[] memory newEntities, ECSEvent[] memory newEvents) = transformEventsToOnlyUseNeededEntities(
        entities,
        events
      );

      bulkSetStateSystem.execute(abi.encode(componentIds, newEntities, newEvents));
    }

    // overflow tx
    uint256 overflowEventCount = allEvents.length - numTxs * eventsPerTx;

    ECSEvent[] memory overflowEvents = new ECSEvent[](overflowEventCount);
    for (uint256 j = 0; j < overflowEventCount; j++) {
      overflowEvents[j] = allEvents[numTxs * eventsPerTx + j];
    }

    (
      uint256[] memory newOverflowEntities,
      ECSEvent[] memory newOverflowEvents
    ) = transformEventsToOnlyUseNeededEntities(entities, overflowEvents);

    bulkSetStateSystem.execute(abi.encode(componentIds, newOverflowEntities, newOverflowEvents));

    vmSafe.stopBroadcast();
  }
}

function transformEventsToOnlyUseNeededEntities(uint256[] memory entities, ECSEvent[] memory events)
  returns (uint256[] memory, ECSEvent[] memory)
{
  Set uniqueEntityIndices = new Set();

  // Find unique entity indices
  for (uint256 i = 0; i < events.length; i++) {
    ECSEvent memory e = events[i];

    uniqueEntityIndices.add(e.entity);
  }

  // Grab the Entity IDs from the big entities array and put them into our new array
  uint256[] memory relevantEntities = new uint256[](uniqueEntityIndices.size());
  for (uint256 i = 0; i < uniqueEntityIndices.size(); i++) {
    relevantEntities[i] = entities[uniqueEntityIndices.getItems()[i]];
  }

  // Re-assign event entity indices to point to our new array
  for (uint256 i = 0; i < events.length; i++) {
    (, uint256 index) = uniqueEntityIndices.getIndex(events[i].entity);
    events[i].entity = uint32(index);
  }

  return (relevantEntities, events);
}

function hexToUint8(bytes1 b) pure returns (uint8 res) {
  if (b >= "0" && b <= "9") {
    return uint8(b) - uint8(bytes1("0"));
  } else if (b >= "A" && b <= "F") {
    return 10 + uint8(b) - uint8(bytes1("A"));
  } else if (b >= "a" && b <= "f") {
    return 10 + uint8(b) - uint8(bytes1("a"));
  }
  return uint8(b); // or return error ...
}

function hexToUint256(string memory str) pure returns (uint256 value) {
  bytes memory b = bytes(str);
  uint256 number = 0;
  for (uint256 i = 0; i < b.length; i++) {
    number = number << 4; // or number = number * 16
    number |= hexToUint8(b[i]); // or number += numberFromAscII(b[i]);
  }
  return number;
}

// Convert an hexadecimal string to raw bytes
function hexToBytes(string memory s) pure returns (bytes memory) {
  bytes memory ss = bytes(s);
  require(ss.length % 2 == 0); // length must be even
  bytes memory r = new bytes(ss.length / 2);
  for (uint256 i = 0; i < ss.length / 2; ++i) {
    r[i] = bytes1(hexToUint8(ss[2 * i]) * 16 + hexToUint8(ss[2 * i + 1]));
  }
  return r;
}

function substring(
  string memory str,
  uint256 start,
  uint256 end
) pure returns (string memory) {
  bytes memory strBytes = bytes(str);
  bytes memory result = new bytes(end - start);
  for (uint256 i = start; i < end; i++) {
    result[i - start] = strBytes[i];
  }
  return string(result);
}
