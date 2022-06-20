pragma solidity ^0.8.0;
// SPDX-License-Identifier: MIT
import { PersonaMirror } from "persona/L2/PersonaMirror.sol";
import { LibAppStorage, AppStorage } from "./LibAppStorage.sol";
import { LibDiamond, DiamondStorage } from "../diamond/libraries/LibDiamond.sol";

library LibPersona {
  function getAppStorage() internal pure returns (AppStorage storage) {
    return LibAppStorage.diamondStorage();
  }

  function getDiamondStorage() internal pure returns (DiamondStorage storage) {
    return LibDiamond.diamondStorage();
  }

  function getActivePersona() internal view returns (uint256) {
    return getActivePersonaFromAddress(msg.sender, msg.sig);
  }

  function getActivePersonaFromAddress(address addr, bytes4 sig) internal view returns (uint256) {
    // TODO: make it gsn compatible
    address diamondAddress = address(this);
    PersonaMirror personaMirror = PersonaMirror(getAppStorage().config.personaMirror);
    uint256 personaId = personaMirror.getActivePersona(addr, diamondAddress);

    if (personaMirror.isAuthorized(personaId, addr, diamondAddress, sig)) {
      return personaId;
    } else {
      return 0;
    }
  }
}
