import { WorldCoord } from "../types";

/**
 * @param a Coordinate A
 * @param b Coordinate B
 * @returns Manhattan distance from A to B (https://xlinux.nist.gov/dads/HTML/manhattanDistance.html)
 */
export function manhattan(a: WorldCoord, b: WorldCoord) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}
