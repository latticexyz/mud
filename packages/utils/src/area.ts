import { Area, Coord } from "./types";

export function areaContains(area: Area, coord: Coord) {
  return coord.x >= area.x && coord.y >= area.y && coord.x < area.x + area.width && coord.y < area.y + area.height;
}

export function coordsOf(area: Area) {
  const coords: Coord[] = [];
  for (let dx = 0; dx < area.width; dx++) {
    for (let dy = 0; dy < area.height; dy++) {
      coords.push({ x: area.x + dx, y: area.y + dy });
    }
  }
  return coords;
}
