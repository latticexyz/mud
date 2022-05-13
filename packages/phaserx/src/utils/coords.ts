import { Area, ChunkCoord, Coord, PixelCoord, WorldCoord } from "../types";

export function cornerTileCoordsFromRegionCoords(regionCoords: WorldCoord[], regionLength: number) {
  const tileCoords: WorldCoord[] = [];

  regionCoords.forEach((regionCoord) => {
    const topLeft = { x: regionCoord.x * regionLength, y: regionCoord.y * regionLength };
    const topRight = { x: (regionCoord.x + 1) * regionLength - 1, y: regionCoord.y * regionLength };
    const bottomLeft = { x: regionCoord.x * regionLength, y: (regionCoord.y + 1) * regionLength - 1 };
    const bottomRight = { x: (regionCoord.x + 1) * regionLength - 1, y: (regionCoord.y + 1) * regionLength - 1 };
    tileCoords.push(topLeft, topRight, bottomLeft, bottomRight);
  });

  return tileCoords;
}

export function isTileInArea(tileCoord: WorldCoord, area: Area) {
  return (
    tileCoord.x >= area.x &&
    tileCoord.x < area.x + area.width &&
    tileCoord.y >= area.x &&
    tileCoord.y < area.y + area.height
  );
}

export function coordEq(a?: Coord, b?: Coord) {
  if (!a && !b) return true;
  if (!a || !b) return false;
  return a.x === b.x && a.y === b.y;
}

export function pixelToChunkCoord(pixelCoord: PixelCoord, chunkSize: number): ChunkCoord {
  return { x: Math.floor(pixelCoord.x / chunkSize), y: Math.floor(pixelCoord.y / chunkSize) };
}

export function chunkToPixelCoord(chunkCoord: ChunkCoord, chunkSize: number): PixelCoord {
  return { x: chunkCoord.x * chunkSize, y: chunkCoord.y * chunkSize };
}

export function pixelCoordToTileCoord(pixelCoord: PixelCoord, tileWidth: number, tileHeight: number): WorldCoord {
  return {
    x: Math.floor(pixelCoord.x / tileWidth),
    y: Math.floor(pixelCoord.y / tileHeight),
  };
}

export function tileCoordToPixelCoord(tileCoord: WorldCoord, tileWidth: number, tileHeight: number): PixelCoord {
  return {
    x: tileCoord.x * tileWidth,
    y: tileCoord.y * tileHeight,
  };
}

export function tileCoordToChunkCoord(
  tileCoord: WorldCoord,
  tileWidth: number,
  tileHeight: number,
  chunkSize: number
): ChunkCoord {
  const pixelCoord = tileCoordToPixelCoord(tileCoord, tileWidth, tileHeight);
  return pixelToChunkCoord(pixelCoord, chunkSize);
}

export function chunkCoordToTileCoord(
  chunkCoord: ChunkCoord,
  tileWidth: number,
  tileHeight: number,
  chunkSize: number
): WorldCoord {
  const pixelCoord = chunkToPixelCoord(chunkCoord, chunkSize);
  return pixelCoordToTileCoord(pixelCoord, tileWidth, tileHeight);
}
