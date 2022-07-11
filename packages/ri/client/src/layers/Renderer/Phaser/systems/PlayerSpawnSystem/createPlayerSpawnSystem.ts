import { defineEnterSystem, getComponentValue, Has } from "@latticexyz/recs";
import { PhaserLayer } from "../../types";

export function createPlayerSpawnSystem(layer: PhaserLayer) {
  const {
    world,
    parentLayers: {
      network: {
        components: { OwnedBy, Position },
        network: { connectedAddress },
      },
    },
    scenes: {
      Main: {
        camera,
        maps: {
          Main: { tileWidth, tileHeight },
        },
      },
    },
  } = layer;

  let alreadyZoomed = false;

  defineEnterSystem(world, [Has(OwnedBy), Has(Position)], ({ entity }) => {
    if (alreadyZoomed) return;

    const ownedBy = getComponentValue(OwnedBy, entity)?.value;

    if (ownedBy === connectedAddress.get()) {
      const position = getComponentValue(Position, entity);
      if (!position) return;

      camera.centerCameraOnCoord(position, tileWidth, tileHeight);
      alreadyZoomed = true;
    }
  });
}
