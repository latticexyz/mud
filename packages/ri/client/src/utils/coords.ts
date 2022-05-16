import { WorldCoord } from "../types";

export function worldCoordEq(a?: WorldCoord, b?: WorldCoord): boolean {
  if (!a || !b) return false;
  return a.x === b.x && a.y === b.y;
}
