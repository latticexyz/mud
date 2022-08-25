// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

import "ds-test/test.sol";
import {console} from "forge-std/console.sol";
import {Cheats} from "./Cheats.sol";
import {BulkSetStateSystem, ID as BulkSetStateSystemID, ECSEvent} from "std-contracts/systems/BulkSetStateSystem.sol";
import {World} from "solecs/World.sol";
import {getAddressById} from "solecs/utils.sol";

uint256 constant oldBulkSetStateSystemID = uint256(keccak256("ember.system.bulkSetState"));

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

  function run(string memory path, address worldAddress) public {
    // string memory path = "./src/contracts/testdata.json";
    console.log(path);
    string memory json = vm.readFile(path);

    console.log(json);
    console.log(worldAddress);

    State memory state = abi.decode(vm.parseJson(json), (State));

    World world = World(worldAddress);

    BulkSetStateSystem bulkSetStateSystem = BulkSetStateSystem(
      getAddressById(world.systems(), oldBulkSetStateSystemID)
    );

    // TODO: split up into chunks and call in a loop to support bigger states
    bulkSetStateSystem.execute(abi.encode(state.componentIds, state.entities, state.state));
  }
}
