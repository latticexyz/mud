// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

import { World } from "solecs/World.sol";
import { ECSEvent } from "../facets/DebugFacet.sol";
import { EmberTest } from "./EmberTest.sol";
import { ID as PositionComponentID } from "../components/PositionComponent.sol";
import { console } from "forge-std/console.sol";

contract BulkUploadTest is EmberTest {
  function testInitMap() public {
    uint256 sizeX = 100;
    uint256 sizeY = 100;

    uint256[] memory components = new uint256[](1);
    components[0] = PositionComponentID;

    uint256[] memory entities = new uint256[](sizeX * sizeY);

    ECSEvent[] memory state = new ECSEvent[](sizeX * sizeY);

    for (uint256 y; y < sizeY; y++) {
      for (uint256 x; x < sizeY; x++) {
        uint256 index = y * sizeX + x;
        entities[index] = index;
        state[index] = ECSEvent(0, 0, new bytes(0));
      }
    }
    debugFacet.bulkSetState(components, entities, state);
  }
}
