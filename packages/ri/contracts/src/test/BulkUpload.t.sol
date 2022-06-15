// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

import { World } from "solecs/World.sol";
import { EmberFacet, ECSEvent } from "../facets/EmberFacet.sol";
import { AppStorage } from "../libraries/LibAppStorage.sol";
import { PersonaFixture } from "./fixtures/PersonaFixture.sol";
import { EmberTest } from "./EmberTest.sol";
import { ID as PositionComponentID } from "../components/PositionComponent.sol";
import { console } from "forge-std/console.sol";

contract BulkUploadTest is EmberTest {
  function testInitMap() public {
    uint256 sizeX = 100;
    uint256 sizeY = 100;

    ECSEvent[] memory state = new ECSEvent[](sizeX * sizeY);

    for (uint256 y; y < sizeY; y++) {
      for (uint256 x; x < sizeY; x++) {
        state[y * sizeX + x] = ECSEvent(PositionComponentID, 1, new bytes(0));
      }
    }
    emberFacet.bulkSetState(state);
  }
}
