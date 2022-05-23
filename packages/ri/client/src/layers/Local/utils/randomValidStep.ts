import { isNotEmpty } from "@mudkit/utils";
import { pickRandom } from "@mudkit/utils";
import { Directions } from "../../../constants";
import { WorldCoord } from "../../../types";
import { translate } from "../../../utils/directions";

/**
 * Get a random valid step from the given coordinate
 * @param coord Coordinate to start from
 * @param checks Checks to run against potential coordinates
 * @returns Valid step coordinate or undefined if none exists
 */
export function randomValidStep(coord: WorldCoord, checks: ((coord: WorldCoord) => boolean)[]): WorldCoord | undefined {
  const validDirections: WorldCoord[] = Object.values(Directions).filter((dir) => {
    for (const check of checks) {
      if (!check(translate(coord, dir))) return false;
    }
    return true;
  });
  if (!isNotEmpty(validDirections)) return undefined;
  return translate(coord, pickRandom(validDirections));
}
