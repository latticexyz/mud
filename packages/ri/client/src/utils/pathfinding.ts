import { WorldCoord } from "../types";

/**
 * @param from Coordinate to start from (included in the path)
 * @param to Coordinate to go to (included in the path)
 * @returns A path from start to destination coordinate
 */
export function aStar(from: WorldCoord, to: WorldCoord): WorldCoord[] {
  // TODO: Implement actual A* algorithm
  const path: WorldCoord[] = [];
  const directionX = from.x < to.x ? 1 : -1;
  const directionY = from.y < to.y ? 1 : -1;

  for (let x = from.x + directionX; directionX * x <= directionX * to.x; x = x + directionX) {
    path.push({ x, y: from.y });
  }

  for (let y = from.y + directionY; directionY * y <= directionY * to.y; y = y + directionY) {
    path.push({ x: to.x, y });
  }

  return path;
}
