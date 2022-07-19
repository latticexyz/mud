import { PhaserLayer } from "../../types";
import { pixelToWorldCoord } from "../../utils";
import { map } from "rxjs";
import {
  EntityID,
  EntityIndex,
  getComponentValue,
  getComponentValueStrict,
  Has,
  hasComponent,
  HasValue,
  Not,
  ProxyExpand,
  runQuery,
} from "@latticexyz/recs";
import { WorldCoord } from "../../../../../types";
import { manhattan } from "../../../../../utils/distance";
import { getPlayerEntity, isOwnedByCaller } from "@latticexyz/std-client";
import { attackEntity } from "../../../../Headless/api";
import { highlightCoord } from "../../api";
import { findLastKey, has } from "lodash";

export function createInputSystem(layer: PhaserLayer) {
  const {
    scenes: {
      Main: { input, maps },
    },
    components: { HoverHighlight },
    api: { highlightCoord },
    parentLayers: {
      network: {
        world,
        components: {
          Factory,
          TerrainType,
          OwnedBy,
          Inventory,
          Health,
          ResourceGenerator,
          EscapePortal,
          Player,
          Death,
          ItemType,
        },
        api: {
          buildAt,
          dropInventory,
          gatherResource,
          transferInventory,
          escapePortal,
          dev: { spawnGold },
          util: { getItems },
        },
        network: { connectedAddress },
      },
      headless: {
        api: { moveEntity, attackEntity },
      },
      local: {
        singletonEntity,
        components: { Selected, LocalPosition },
      },
    },
  } = layer;

  const getSelectedEntity = () => [...runQuery([Has(Selected)])][0];

  const attemptMove = function (selectedEntity: EntityIndex, targetPosition: WorldCoord) {
    moveEntity(selectedEntity, targetPosition);
  };

  const attemptGatherResource = function (selectedEntity: EntityIndex, highlightedEntity: EntityIndex) {
    const inventory = getComponentValue(Inventory, selectedEntity);

    if (inventory == null) return false;

    const resourceGenerator = getComponentValue(ResourceGenerator, highlightedEntity);
    if (!resourceGenerator) return false;

    gatherResource(world.entities[highlightedEntity], world.entities[selectedEntity]);

    return true;
  };

  const attemptTakeInventory = function (
    selectedEntity: EntityIndex,
    highlightedEntity: EntityIndex,
    player: EntityIndex
  ) {
    if (!isOwnedByCaller(OwnedBy, selectedEntity, player, world.entityToIndex)) return false;
    if (hasComponent(OwnedBy, highlightedEntity)) return false;

    const highlightedItems = getItems(highlightedEntity);
    if (highlightedItems.length > 0) {
      const selectedItems = getItems(selectedEntity);
      const selectedCapacity = getComponentValue(Inventory, selectedEntity);
      if (selectedCapacity && selectedCapacity.value > selectedItems.length) {
        const selectedEntityPos = getComponentValue(LocalPosition, selectedEntity);
        const highlightedEntityPos = getComponentValue(LocalPosition, highlightedEntity);
        if (selectedEntityPos && highlightedEntityPos && manhattan(selectedEntityPos, highlightedEntityPos) <= 1) {
          transferInventory(world.entities[highlightedEntity], world.entities[selectedEntity]);
          return true;
        }
      }
    }
    return false;
  };

  const attemptGiveInventory = function (
    selectedEntity: EntityIndex,
    highlightedEntity: EntityIndex,
    player: EntityIndex
  ) {
    if (
      !isOwnedByCaller(OwnedBy, selectedEntity, player, world.entityToIndex) ||
      !isOwnedByCaller(OwnedBy, highlightedEntity, player, world.entityToIndex)
    )
      return false;

    const selectedItems = getItems(selectedEntity);
    if (selectedItems.length > 0) {
      const highlightedItems = getItems(highlightedEntity);
      const highlightedCapacity = getComponentValue(Inventory, highlightedEntity);
      if (highlightedCapacity && highlightedCapacity.value > highlightedItems.length) {
        const highlightedEntityPos = getComponentValue(LocalPosition, highlightedEntity);
        const selectedEntityPos = getComponentValue(LocalPosition, selectedEntity);
        if (highlightedEntityPos && selectedEntityPos && manhattan(highlightedEntityPos, selectedEntityPos) <= 1) {
          transferInventory(world.entities[selectedEntity], world.entities[highlightedEntity]);
          return true;
        }
      }
    }
    return false;
  };

  const attemptAttack = function (selectedEntity: EntityIndex, highlightedEntity: EntityIndex) {
    const selectedEntityOwner = getComponentValue(OwnedBy, selectedEntity);
    const highlightedEntityOwner = getComponentValue(OwnedBy, highlightedEntity);

    if (!selectedEntityOwner) return false;
    if (selectedEntityOwner.value === highlightedEntityOwner?.value) return false;

    const healthEntity = getComponentValue(Health, highlightedEntity);
    if (healthEntity) {
      attackEntity(selectedEntity, highlightedEntity);
      return true;
    }
    return false;
  };

  const attemptEscapePortal = function (selectedEntity: EntityIndex, highlightedEntity: EntityIndex) {
    const escapePortalValue = getComponentValue(EscapePortal, highlightedEntity);
    if (escapePortalValue) {
      escapePortal(world.entities[selectedEntity], world.entities[highlightedEntity]);
      return true;
    }
    return false;
  };

  const onRightClick = function (targetPosition: WorldCoord) {
    const playerEntity = world.entityToIndex.get(connectedAddress.get() as EntityID);

    if (!playerEntity) return;

    if (!hasComponent(Player, playerEntity) || hasComponent(Death, playerEntity)) return;

    const selectedEntity = getSelectedEntity();
    if (selectedEntity) {
      const hoverHighlight = getComponentValueStrict(HoverHighlight, singletonEntity);
      const highlightedEntity = [
        ...runQuery([HasValue(LocalPosition, { x: hoverHighlight.x, y: hoverHighlight.y }), Not(TerrainType)]),
      ][0];

      if (highlightedEntity) {
        if (attemptEscapePortal(selectedEntity, highlightedEntity)) return;
        if (attemptGatherResource(selectedEntity, highlightedEntity)) return;
        if (attemptTakeInventory(selectedEntity, highlightedEntity, playerEntity)) return;
        if (attemptGiveInventory(selectedEntity, highlightedEntity, playerEntity)) return;
        if (attemptAttack(selectedEntity, highlightedEntity)) return;
      }

      attemptMove(selectedEntity, targetPosition);
    }
  };

  input.onKeyPress(
    (keys) => keys.has("B"),
    () => {
      const hoverHighlight = getComponentValueStrict(HoverHighlight, singletonEntity);
      if (hoverHighlight.x == null || hoverHighlight.y == null) return;

      const buildPosition = { x: hoverHighlight.x, y: hoverHighlight.y };

      const selectedEntity = getSelectedEntity();
      if (!selectedEntity) return;

      const factory = getComponentValueStrict(Factory, selectedEntity);
      const prototypeId = factory.prototypeIds[0];
      if (!prototypeId) return;

      buildAt(world.entities[selectedEntity], prototypeId, buildPosition);
    }
  );

  input.onKeyPress(
    (keys) => keys.has("A"),
    () => {
      const selectedEntity = getSelectedEntity();
      if (!selectedEntity) return;

      const hoverHighlight = getComponentValueStrict(HoverHighlight, singletonEntity);
      const highlightedEntity = [
        ...runQuery([HasValue(LocalPosition, { x: hoverHighlight.x, y: hoverHighlight.y }), Not(TerrainType)]),
      ][0];
      if (!highlightedEntity) return;

      attackEntity(selectedEntity, highlightedEntity);
    }
  );

  input.onKeyPress(
    (keys) => keys.has("G"),
    () => {
      const hoverHighlight = getComponentValueStrict(HoverHighlight, singletonEntity);
      if (hoverHighlight.x && hoverHighlight.y) spawnGold({ x: hoverHighlight.x, y: hoverHighlight.y });
      else console.log("hoverHightlight not valid position");
    }
  );

  input.onKeyPress(
    (keys) => keys.has("D"),
    () => {
      const selectedEntity = getSelectedEntity();
      if (!selectedEntity) return;

      const hoverHighlight = getComponentValueStrict(HoverHighlight, singletonEntity);

      const hasInventory = getComponentValue(Inventory, selectedEntity);
      if (hasInventory && hoverHighlight.x != undefined && hoverHighlight.y != undefined) {
        dropInventory(world.entities[selectedEntity], { x: hoverHighlight.x, y: hoverHighlight.y });
      } else console.log("hoverHightlight not valid position");
    }
  );
  input.pointermove$
    .pipe(
      map((pointer) => ({ x: pointer.worldX, y: pointer.worldY })), // Map pointer to pointer pixel cood
      map((pixel) => pixelToWorldCoord(maps.Main, pixel)) // Map pixel coord to tile coord
    )
    .subscribe((coord) => {
      highlightCoord(coord);
    });

  input.rightClick$
    .pipe(
      map((pointer) => ({ x: pointer.worldX, y: pointer.worldY })),
      map((pixel) => pixelToWorldCoord(maps.Main, pixel))
    )
    .subscribe((coord) => {
      onRightClick(coord);
    });
}
