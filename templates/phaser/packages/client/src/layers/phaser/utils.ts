/* eslint-disable @typescript-eslint/no-explicit-any */
import { Entity } from "@latticexyz/recs";
import { PixelCoord, WorldCoord } from "../../types";
import { ChunkedTilemap } from "@latticexyz/phaserx";

/**
 * Converts a pixel coordinate to a world (tile) coordinate.
 * @param map Map to use for the calculation
 * @param pixel Pixel coordinate to convert
 * @returns World coordinate
 */
export function pixelToWorldCoord(map: ChunkedTilemap<any, any>, pixel: PixelCoord): WorldCoord {
  return { x: Math.floor(pixel.x / map.tileWidth), y: Math.floor(pixel.y / map.tileHeight) };
}

/**
 * Converts a world (tile) coordinate to a pixel coordinate.
 * @param map Map to use for the calculation
 * @param worldCoord world coordinate to convert
 * @returns Pixel coordinate
 */
export function worldCoordToPixel(map: ChunkedTilemap<any, any>, worldCoord: WorldCoord): PixelCoord {
  return { x: worldCoord.x * map.tileWidth, y: worldCoord.y * map.tileHeight };
}

/**
 * Converts an entity id to a short address.
 * @param entity Entity id to convert
 * @returns short address
 */
export function entityToShortAddress(entity: Entity) {
  const address = entity.slice(-40);
  return `0x${address.slice(0, 4)}..${address.slice(-4)}`;
}
