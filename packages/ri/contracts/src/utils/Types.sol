// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

enum UnitTypes {
  Donkey,
  Soldier,
  Spear,
  Cavalry,
  Archer
}

enum CombatTypes {
  Passive,
  Sword,
  Spear,
  Cavalry,
  Ranged
}

uint256 constant CombatTypesLength = 5;

enum StructureTypes {
  Settlement,
  GoldShrine,
  EscapePortal,
  Container
}

enum ItemTypes {
  Gold,
  EmberCrown
}

enum TerrainTypes {
  Grass,
  Mountain,
  Water,
  Wall,
  Tree
}
