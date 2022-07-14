import { runQuery, HasValue, Component, hasComponent, Type, Has } from "@latticexyz/recs";
import { WorldCoord } from "../types";
import { manhattan } from "./distance";
import Heap from "heap-js";
import { NetworkLayer } from "../layers/Network";
import { worldCoordEq } from "./coords";
import { Coord } from "@latticexyz/utils";
import { translate } from "./directions";

interface gridNode {
  x: number;
  y: number;
  f: number;
  g: number;
  h: number;
  cost: number;
  visited: boolean;
  closed: boolean;
  parent: gridNode | null;
}
interface bfsNode {
  x: number;
  y: number;
  f: number;
  cost: number;
  visited: boolean;
}

function getNeighbors<T extends Coord>(grid: T[][], node: T) {
  const neighbors: T[] = [];

  // Up
  if (grid[node.x] && grid[node.x][node.y + 1]) neighbors.push(grid[node.x][node.y + 1]);
  // Right
  if (grid[node.x + 1] && grid[node.x + 1][node.y]) neighbors.push(grid[node.x + 1][node.y]);
  // Down
  if (grid[node.x] && grid[node.x][node.y - 1]) neighbors.push(grid[node.x][node.y - 1]);
  // Left
  if (grid[node.x - 1] && grid[node.x - 1][node.y]) neighbors.push(grid[node.x - 1][node.y]);

  return neighbors;
}

/**
 * @param from Coordinate to start from (included in the path)
 * @param to Coordinate to go to (included in the path)
 * @param maxDistance The maximum distance that can be traveled in the path
 * @param network The network layer, used to get the required components
 * @param positionComponent Either the networked Position or LocalPosition component, better to use local if possible
 * @returns Finds shortest path between the from and to coordinates
 */
export function aStar(
  from: WorldCoord,
  to: WorldCoord,
  maxDistance: number,
  network: NetworkLayer,
  positionComponent: Component
): WorldCoord[] {
  if (manhattan(from, to) > maxDistance) return []; // early out if destination is further than stamina allows

  const {
    components: { Movable, Untraversable },
  } = network;

  const path: WorldCoord[] = [];
  const gridLength = maxDistance * 2 + 1;

  const grid = new Array<gridNode[]>(gridLength);
  for (let x = 0; x < gridLength; x++) {
    grid[x] = new Array<gridNode>(gridLength);
    for (let y = 0; y < gridLength; y++) {
      grid[x][y] = {
        x: x,
        y: y,
        f: 0,
        g: 0,
        h: 0,
        cost: 1, // TODO: change cost to reflect terrain
        visited: false,
        closed: false,
        parent: null,
      };
    }
  }

  const zero: WorldCoord = { x: from.x - maxDistance, y: from.y - maxDistance };
  const start = grid[maxDistance][maxDistance]; // center of the zeroed grid, maxDistance from ends
  const end = grid[to.x - zero.x][to.y - zero.y]; // same spot relative to start but on zeroed grid

  const customPriorityComparator = (a: gridNode, b: gridNode) => a.f - b.f;
  const openHeap = new Heap(customPriorityComparator);

  openHeap.push(start);

  while (openHeap.size() > 0) {
    const currentNode = openHeap.pop() as gridNode;
    if (!currentNode) return [];

    if (worldCoordEq(currentNode, end)) {
      let curr = currentNode;
      while (curr && curr.parent) {
        path.push({ x: curr.x + zero.x, y: curr.y + zero.y });
        curr = curr.parent;
      }
      return path.reverse();
    }

    currentNode.closed = true;

    const neighbors = getNeighbors(grid, currentNode);

    for (let i = 0; i < neighbors.length; i++) {
      const neighbor = neighbors[i];
      if (neighbor.closed) {
        continue;
      }

      const neighborRealCoord = { x: neighbor.x + zero.x, y: neighbor.y + zero.y };
      const entitiesAtPosition = runQuery([HasValue(positionComponent, neighborRealCoord)]);
      let entFound = false;
      for (const entity of entitiesAtPosition) {
        if (hasComponent(Untraversable, entity) || hasComponent(Movable, entity)) {
          entFound = true;
          break;
        }
      }
      if (entFound) continue;

      const gScore = currentNode.g + neighbor.cost;
      const beenVisited = neighbor.visited;

      if (gScore <= maxDistance && (!beenVisited || gScore < neighbor.g)) {
        neighbor.visited = true;
        neighbor.parent = currentNode;
        neighbor.h = neighbor.h || manhattan({ x: neighbor.x, y: neighbor.y }, { x: end.x, y: end.y });
        neighbor.g = gScore;
        neighbor.f = neighbor.g + neighbor.h;

        if (!beenVisited) {
          openHeap.push(neighbor);
        }
      }
    }
  }

  return [];
}

/**
 * @param from Coordinate to start from (included in the path)
 * @param to Coordinate to go to (included in the path)
 * @returns Finds a path between the from and to coordinates, used in some cases when aStar fails
 */
export function directionalPathfind(from: WorldCoord, to: WorldCoord): WorldCoord[] {
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

/**
 * @param from Coordinate to start from (included in the path)
 * @param network The network layer, used to get the required components
 * @param positionComponent Either the networked Position or LocalPosition component, better to use local if possible
 * @returns Finds all traversable paths up to maxDistance
 */
export function BFS(
  from: WorldCoord,
  maxDistance: number,
  network: NetworkLayer,
  positionComponent: Component<{ x: Type.Number; y: Type.Number }>
): WorldCoord[] {
  const {
    components: { Untraversable },
  } = network;

  const path: WorldCoord[] = [];
  const gridLength = maxDistance * 2 + 1;
  const grid: bfsNode[][] = [];

  for (let x = 0; x < gridLength; x++) {
    grid[x] = new Array<bfsNode>(gridLength);
    for (let y = 0; y < gridLength; y++) {
      grid[x][y] = {
        x: x,
        y: y,
        f: 0,
        cost: 1, // TODO: change cost to reflect terrain
        visited: false,
      };
    }
  }

  const zero: WorldCoord = translate(from, { x: -maxDistance, y: -maxDistance });
  const start = grid[maxDistance][maxDistance]; // center of the zeroed grid, maxDistance from ends

  const unvisitedCoords: bfsNode[] = [];

  unvisitedCoords.push(start);

  while (unvisitedCoords.length > 0) {
    const currentNode = unvisitedCoords.shift()!;
    const neighbors = getNeighbors(grid, currentNode);

    for (let i = 0; i < neighbors.length; i++) {
      const neighbor = neighbors[i];

      const neighborRealCoord = translate(neighbor, zero);
      const untraversableEntitiesAtPosition = runQuery([
        HasValue(positionComponent, neighborRealCoord),
        Has(Untraversable),
      ]);
      if (untraversableEntitiesAtPosition.size > 0) continue;

      const totalCost = currentNode.f + neighbor.cost;
      const beenVisited = neighbor.visited;

      if (totalCost <= maxDistance) {
        neighbor.f = totalCost;

        if (!beenVisited) {
          unvisitedCoords.push(neighbor);
          path.push({ x: neighborRealCoord.x, y: neighborRealCoord.y });
          neighbor.visited = true;
        }
      }
    }
  }

  return path;
}
