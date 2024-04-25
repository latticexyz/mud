/* eslint-disable @typescript-eslint/no-explicit-any */
export function getObjectsInArea(groups: Phaser.GameObjects.Group[], area: Phaser.Geom.Rectangle) {
  const ids = [];
  for (const group of groups) {
    for (const object of group.getChildren() as any[]) {
      if (object.active && "x" in object && "y" in object && area.contains(object.x, object.y)) {
        console.log("got one", object);
        ids.push(object);
      }
    }
  }
  return ids.filter((x) => x !== undefined);
}
