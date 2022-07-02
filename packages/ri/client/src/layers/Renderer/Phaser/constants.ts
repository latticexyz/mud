export const TILE_WIDTH = 16;
export const TILE_HEIGHT = 16;

export enum Scenes {
  Main = "Main",
}

export enum Maps {
  Main = "Main",
  Pixel = "Pixel",
  Tactic = "Tactic",
  Strategic = "Strategic",
}

export enum Assets {
  Tilemap = "Tilemap",
  Imp = "Imp",
  Legendary = "Legendary",
  MainAtlas = "MainAtlas",
}

export enum Animations {
  ImpIdle = "ImpIdle",
  HeroIdle = "HeroIdle",
}

export enum Tileset {
  Empty = 0,
  Plain = 1,
  Tree1 = 55,
  Tree2 = 56,
  Tree3 = 57,
  Tree4 = 58,
  Tree5 = 59,
  Tree6 = 60,
  Tree7 = 61,
  Tree8 = 62,
  TreeSnow1 = 109,
  TreeSnow2 = 110,
  TreeSnow3 = 111,
  TreeSnow4 = 112,
  TreeSnow5 = 113,
  TreeSnow6 = 114,
  TreeSnow7 = 115,
  TreeSnow8 = 116,
  Grass = 72,
  Water = 73,
  Wall1 = 74,
  Wall2 = 128,
  Rock1 = 126,
  Rock2 = 127,
}

export enum RockWallTileset {
  // Transitions (inner faces, no outer border)
  upRightDown = 164,
  leftRightDown = 165,
  leftUpRight = 196,
  leftUpDown = 197,
  leftUpRightDown = 128,

  // Transitions (no inner faces, outer border)
  oUpRightDown = 230,
  oLeftUpRight = 260,
  oLeftUpDown = 231,
  oLeftRightDown = 165,
  oLeftRightDownFaceLeft = 232,
  oLeftRightDownFaceRight = 233,
  leftUpRightBorderRight = 265,
  leftUpRightBorderLeft = 264,

  // Transitions (inner faces, outer border)
  ioUpRightDown = 100,
  ioLeftRightDown = 101,
  ioLeftUpRight = 132,
  ioLeftUpDown = 133,

  // Corners (inner faces, no outer border)
  upRight = 192,
  leftUp = 193,
  leftDown = 161,
  rightDown = 160,

  // Corners (no inner faces, outer border)
  oUpRight = 194,
  oLeftUp = 195,
  oLeftDown = 163,
  oRightDown = 162,

  // Corners (inner faces && outer border)
  ioUpRight = 130,
  ioLeftUp = 131,
  ioLeftDown = 99,
  ioRightDown = 98,

  // Straight pieces
  leftRight = 166,
  upDown = 129,

  // Straight pieces (depth pass)
  horizontalFace = 199,
  horizontalFaceBorder = 97,
  verticalBorderRight = 198,
  verticalBorderLeft = 167,

  // End pieces
  down = 103,
  left = 135,
  right = 102,
  top = 134,
  single = 168,
}

export enum TileAnimationKey {
  GoldGenerator = "GoldGenerator",
}

export const TileAnimations: { [key in TileAnimationKey]: number[] } = {
  [TileAnimationKey.GoldGenerator]: [460, 461, 462, 463, 464, 465, 466, 467],
};
