// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

import { IUint256Component } from "solecs/interfaces/IUint256Component.sol";
import { getAddressById } from "solecs/utils.sol";

import { PrototypeComponent, ID as PrototypeComponentID } from "../components/PrototypeComponent.sol";
import { TerrainTypeComponent, ID as TerrainTypeComponentID } from "../components/TerrainTypeComponent.sol";

import { TerrainTypes } from "../utils/Types.sol";

uint256 constant ID = uint256(keccak256("mudwar.prototype.Grass"));

function GrassPrototype(IUint256Component components) {
  TerrainTypeComponent(getAddressById(components, TerrainTypeComponentID)).set(ID, uint32(TerrainTypes.Grass));

  uint256[] memory componentIds = new uint256[](1);
  componentIds[0] = TerrainTypeComponentID;

  PrototypeComponent(getAddressById(components, PrototypeComponentID)).set(ID, componentIds);
}
