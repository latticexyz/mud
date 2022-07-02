// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

import { World } from "solecs/World.sol";
import { EmberFacet } from "../facets/EmberFacet.sol";
import { DebugFacet } from "../facets/DebugFacet.sol";
import { AppStorage } from "../libraries/LibAppStorage.sol";
import { PersonaFixture } from "./fixtures/PersonaFixture.sol";
import { EmberTest } from "./EmberTest.sol";

contract AccessControlTest is EmberTest {
  function testAccessControlWithPersona() public {
    uint256 PLAYER_ID = uint256(keccak256("alice"));
    uint256 personaId = deploy.personaFixture().mintPersonaToAddressAndSetupImpersonator(alice, bob, PLAYER_ID);
    // call the entry point and make sure the _callerEntityID is correct
    vm.startPrank(bob);
    debugFacet.entryPoint();
    uint256 callerEntityID = debugFacet.callerEntityID();
    assertEq(callerEntityID, PLAYER_ID);
    vm.stopPrank();
    // call the entry point with alice and make sure the _callerEntityID is correct
    vm.startPrank(alice);
    deploy.personaMirror().impersonate(personaId, diamondAddress);
    debugFacet.entryPoint();
    callerEntityID = debugFacet.callerEntityID();
    assertEq(callerEntityID, PLAYER_ID);
    vm.stopPrank();
    // now call the entry point with a random address and make sure the _callerEntityID is 0
    vm.startPrank(eve);
    debugFacet.entryPoint();
    callerEntityID = debugFacet.callerEntityID();
    assertEq(callerEntityID, 0);
    vm.stopPrank();
  }
}
