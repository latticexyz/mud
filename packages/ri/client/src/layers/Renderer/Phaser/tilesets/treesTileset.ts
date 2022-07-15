export enum Tileset {
  Spruce = 8,
  DarkOak = 16,
  Jungle = 200,
  Oak = 208,
  OldTree = 216,
  Palm = 400,
  Pine = 408,
}
export enum TileAnimationKey {
  Azalea = "Azalea",
}
export const TileAnimations: { [key in TileAnimationKey]: number[] } = {
  [TileAnimationKey.Azalea]: [
    1, 2, 3, 4, 5, 6, 7, 25, 26, 27, 28, 29, 30, 31, 32, 50, 51, 52, 53, 54, 55, 56, 57, 75, 76, 77, 78, 79, 80, 81, 82,
    100, 101, 102, 103, 104, 105, 106, 107, 125, 126, 127, 128, 129, 130, 131, 132, 150, 151, 152, 153, 154, 155, 156,
    157, 175, 176, 177, 178,
  ],
};
