export const TILE_WIDTH = 24;
export const TILE_HEIGHT = 24;

export enum Scenes {
  Main = "Main",
}

export enum Maps {
  Main = "Main",
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
  ImpDigging = "ImpDigging",
}

if (import.meta.hot) {
  import.meta.hot.accept(() => {
    console.log("Constants changed, full reload");
    import.meta.hot?.invalidate();
  });
}

export enum Tileset {
  Wall = 168,
  WallMinedBottom = 136,
  WallRockBottom = 136,
  PlayerWall = 7,
  PlayerWallMinedBottom = 6,
  ForeignWall = 7,
  ForeignWallBottom = 6,
  Ground = 2,
  OwnedGround = 1,
  RockA = 9,
  RockB = 3,
  RockC = 32,
  RockD = 33,
  Full = 8,
  Empty = 9,
  Gold = 4,
  Soul = 5,
  SoulGroundResource = 35,
  BedRock = 0,
  DHa = 268,
  DHb = 269,
  DHc = 300,
  DHd = 301,
  GoldStorageA = 524,
  GoldStorageB = 525,
  GoldStorageC = 526,
  GoldStorageD = 527,
  GoldGenerator = 460,
  SoulStorage = 428,
  SoulGenerator = 396,
  Lair = 492,
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
