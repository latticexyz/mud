/* eslint-disable @typescript-eslint/no-explicit-any */
import { WorldCoord } from "../../../../types";
import { PixelCoord } from "../types";
import { ChunkedTilemap } from "@mud/phaserx";

/**
 * Converts a world (tile) coordinate to a pixel coordinate.
 * @param map Map to use for the calculation
 * @param worldCoord world coordinate to convert
 * @returns Pixel coordinate
 */
export function worldCoordToPixel(map: ChunkedTilemap<any, any>, worldCoord: WorldCoord): PixelCoord {
  return { x: worldCoord.x * map.tileWidth, y: worldCoord.y * map.tileHeight };
}
