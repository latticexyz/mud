// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

import { IAccessController } from "./IAccessController.sol";

import { UsingAppStorage } from "../utils/UsingAppStorage.sol";
import { AppStorage } from "../libraries/LibAppStorage.sol";

import { PersonaComponent, ID as PersonaComponentID } from "../components/PersonaComponent.sol";
import { LibPersona } from "../libraries/LibPersona.sol";

contract PersonaAccessController is UsingAppStorage, IAccessController {
  function getEntityCallerIDFromAddress(address caller, bytes4 sig) external view override returns (uint256) {
    AppStorage storage s = getAppStorage();
    // Find the entity with a persona component value corresponding to the active persona of the caller
    uint256 personaId = LibPersona.getActivePersonaFromAddress(caller, sig);
    PersonaComponent personaComponent = PersonaComponent(s.world.getComponent(PersonaComponentID));
    uint256[] memory entities = personaComponent.getEntitiesWithValue(personaId);
    require(entities.length <= 1, "More than one Persona component with corresponding persona");
    if (entities.length == 0) {
      return 0;
    }
    return entities[0];
  }
}
