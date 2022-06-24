import { defineEnterSystem, getComponentValue, Has } from "@latticexyz/recs";
import { getPlayerEntity } from "@latticexyz/std-client";
import { PhaserLayer } from "../../types";

export function createPlayerSpawnSystem(layer: PhaserLayer) {
  const {
    world,
    parentLayers: {
      network: {
        personaId,
        components: { OwnedBy, Persona, Position },
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
    if (!personaId) return;

    const playerEntity = getPlayerEntity(Persona, personaId);
    const ownedBy = getComponentValue(OwnedBy, entity)?.value;

    if (ownedBy === world.entities[playerEntity]) {
      const position = getComponentValue(Position, entity);
      if (!position) return;

      camera.centerCameraOnCoord(position, tileWidth, tileHeight);
      alreadyZoomed = true;
    }
  });
}
