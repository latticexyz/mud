// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

import "ds-test/test.sol";
import {console} from "forge-std/console.sol";
import {Cheats} from "./Cheats.sol";
import {BulkSetStateSystem, ID as BulkSetStateSystemID, ECSEvent} from "std-contracts/systems/BulkSetStateSystem.sol";
import {World} from "solecs/World.sol";
import {System} from "solecs/System.sol";
import {getAddressById} from "solecs/utils.sol";

uint256 constant oldBulkSetStateSystemID = uint256(keccak256("mudwar.system.BulkSetState"));
uint256 constant oldComponentDevSystemID = uint256(keccak256("mudwar.system.ComponentDev"));

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
contract BulkUpload is DSTest {
  Cheats internal immutable vm = Cheats(HEVM_ADDRESS);

  function run(
    string memory path,
    address worldAddress,
    uint256 split
  ) public {
    vm.startBroadcast();

    // Read JSON
    console.log(path);
    string memory json = vm.readFile(path);

    console.log(json);
    console.log(worldAddress);

    // Parse JSON
    ParsedState memory parsedState = abi.decode(vm.parseJson(json), (ParsedState));
    console.log(hexToUint256(parsedState.entities[0]));

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

    // Convert state
    ECSEvent[] memory state = new ECSEvent[](parsedState.state.length);
    for (uint256 i; i < parsedState.state.length; i++) {
      ParsedECSEvent memory p = parsedState.state[i];
      // Convert value hex string to bytes
      bytes memory value = hexToBytes(substring(p.value, 2, bytes(p.value).length));
      state[i] = ECSEvent(p.component, p.entity, value);
    }

    // Set state
    World world = World(worldAddress);
    System componentDevSystem = System(getAddressById(world.systems(), oldComponentDevSystemID));

    // Trivial version but much more gas intensive
    for (uint256 i; i < state.length; i++) {
      ECSEvent memory e = state[i];
      uint256 component = componentIds[e.component];
      uint256 entity = entities[e.entity];
      componentDevSystem.execute(abi.encode(component, entity, e.value));
    }

    // Proper version with Bulkupload (but incomplete, one TODO left, see below)
    // BulkSetStateSystem bulkSetStateSystem = BulkSetStateSystem(
    //   getAddressById(world.systems(), oldBulkSetStateSystemID)
    // );
    // // Split up into chunks and call in a loop to support bigger states
    // uint256 entriesPerRound = state.length / split;
    // uint256 overflow = state.length - entriesPerRound * split;
    // for (uint256 i; i <= split; i++) {
    //   ECSEvent[] memory stateRound = new ECSEvent[](i == split ? overflow : entriesPerRound);

    //   if (i == split) {
    //     for (uint256 j; j < overflow; j++) {
    //       console.log(j);
    //       stateRound[j] = state[entriesPerRound * split + j];
    //     }
    //   } else {
    //     for (uint256 j; j < entriesPerRound; j++) {
    //       console.log(j);
    //       uint256 index = i * split + j;
    //       stateRound[j] = state[index];
    //     }
    //   }

    //   // TODO: Create a new component and entity array with only the components and entities of this state round
    //   // and remap the state indices to those arrays. Right now we submit the entire entity and component array with each call,
    //   // which is extremely inefficient.
    //   bulkSetStateSystem.execute(abi.encode(componentIds, entities, stateRound));
    // }

    vm.stopBroadcast();
  }
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
