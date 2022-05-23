import { Direction, Directions } from "../constants";
import { WorldCoord } from "../types";
import { random } from "@mudkit/utils";

/**
 * @param coord Initial coordinate
 * @param translation Relative translation of the initial coordinate
 * @returns New coordinate after translating
 */
export function translate(coord: WorldCoord, translation: WorldCoord): WorldCoord {
  return { x: coord.x + translation.x, y: coord.y + translation.y };
}

/**
 * @param coord Initial coordinate
 * @param direction Direction to move to
 * @returns New coordiante after moving in the specified direction
 */
export function translateDirection(coord: WorldCoord, direction: Direction): WorldCoord {
  return translate(coord, Directions[direction]);
}

/**
 * @returns Random direction (Top, Right, Bottom or Left)
 */
export function randomDirection(): Direction {
  return random(3, 0);
}

export function getSurroundingCoords(coord: WorldCoord, distance = 1): WorldCoord[] {
  const surroundingCoords: WorldCoord[] = [];

  for (let x = -1 * distance; x <= distance; x++) {
    for (let y = -1 * distance; y <= distance; y++) {
      if (!(x === 0 && y === 0)) surroundingCoords.push(translate(coord, { x, y }));
    }
  }

  return surroundingCoords;
}
