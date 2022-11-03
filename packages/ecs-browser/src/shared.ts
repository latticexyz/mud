/**
 * @see phaserx src/types
 */

export type Coord = {
  x: number;
  y: number;
};

type PixelCoord = Coord;
type WorldCoord = Coord;

/**
 * @see phaserx src/coords
 */

export function pixelCoordToTileCoord(pixelCoord: PixelCoord, tileWidth: number, tileHeight: number): WorldCoord {
  return {
    x: Math.floor(pixelCoord.x / tileWidth),
    y: Math.floor(pixelCoord.y / tileHeight),
  };
}
