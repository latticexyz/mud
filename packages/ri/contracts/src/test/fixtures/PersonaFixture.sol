// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

import { DSTest } from "ds-test/test.sol";
import { Vm } from "forge-std/Vm.sol";
import { World } from "solecs/World.sol";

import { PersonaComponent, Persona, ID as PersonaComponentID } from "../../components/PersonaComponent.sol";

import { Deploy } from "../utils/Deploy.sol";

import { MockL2Bridge } from "persona/test/mocks/MockL2Bridge.sol";
import { MockConsumer } from "persona/test/mocks/MockConsumer.sol";
import { EmptyPersonaTokenURIGenerator } from "persona/L1/EmptyPersonaTokenURIGenerator.sol";
import { PersonaMirror } from "persona/L2/PersonaMirror.sol";
import { PersonaAllMinter } from "persona/L1/PersonaAllMinter.sol";

contract PersonaFixture is DSTest {
  Vm internal immutable vm = Vm(HEVM_ADDRESS);
  Deploy internal deploy;

  constructor(address deployAddr) {
    deploy = Deploy(deployAddr);
  }

  function mintPersonaToAddressAndSetupImpersonator(
    address alice,
    address bob,
    uint256 playerEntityID
  ) public returns (uint256) {
    // mint a persona for alice
    address deployer = deploy.deployer();
    address diamondAddress = address(deploy.diamond());
    World world = deploy.world();
    vm.startPrank(deployer);
    PersonaAllMinter personaAllMinter = deploy.personaAllMinter();
    PersonaMirror personaMirror = deploy.personaMirror();
    personaAllMinter.mintPersona(alice);
    uint256 personaId = 1;
    vm.stopPrank();
    // give access to bob
    vm.startPrank(alice);
    personaMirror.authorize(personaId, bob, diamondAddress, new bytes4[](0));
    vm.stopPrank();
    // impersonate that persona with bob
    vm.startPrank(bob);
    personaMirror.impersonate(personaId, diamondAddress);
    vm.stopPrank();
    // create an entity with a persona component inside the ECS system
    vm.startPrank(diamondAddress);
    PersonaComponent personaComponent = PersonaComponent(world.getComponent(PersonaComponentID));
    personaComponent.set(playerEntityID, Persona(personaId));
    vm.stopPrank();
    return personaId;
  }
}
