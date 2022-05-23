/* eslint-disable @typescript-eslint/no-explicit-any */
import { WorldCoord } from "../../../../types";
import { PixelCoord } from "../types";
import { ChunkedTilemap } from "@mudkit/phaserx";

/**
 * Converts a pixel coordinate to a world (tile) coordinate.
 * @param map Map to use for the calculation
 * @param pixel Pixel coordinate to convert
 * @returns World coordinate
 */
export function pixelToWorldCoord(map: ChunkedTilemap<any, any>, pixel: PixelCoord): WorldCoord {
  return { x: Math.floor(pixel.x / map.tileWidth), y: Math.floor(pixel.y / map.tileHeight) };
}
