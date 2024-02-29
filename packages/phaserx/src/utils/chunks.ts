import { CoordMap } from "@latticexyz/utils";
import { Area } from "../types";
import { pixelToChunkCoord } from "./coords";

export function getChunksInArea(area: Area, chunkSize: number) {
  const topLeft = { x: area.x, y: area.y };
  const bottomRight = { x: area.x + area.width, y: area.y + area.height };

  const topLeftChunk = pixelToChunkCoord(topLeft, chunkSize);
  const bottomRightChunk = pixelToChunkCoord(bottomRight, chunkSize);

  const numChunksX = bottomRightChunk.x - topLeftChunk.x + 1;
  const numChunksY = bottomRightChunk.y - topLeftChunk.y + 1;

  const chunksInArea = new CoordMap<boolean>();

  for (let x = 0; x < numChunksX; x++) {
    for (let y = 0; y < numChunksY; y++) {
      chunksInArea.set(
        {
          x: topLeftChunk.x + x,
          y: topLeftChunk.y + y,
        },
        true
      );
    }
  }

  return chunksInArea;
}
