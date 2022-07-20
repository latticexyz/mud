import { PhaserLayer } from "../../types";
import { pixelToWorldCoord } from "../../utils";
import { map } from "rxjs";
import {
  EntityIndex,
  getComponentValue,
  getComponentValueStrict,
  Has,
  hasComponent,
  HasValue,
  Not,
  runQuery,
} from "@latticexyz/recs";
import { WorldCoord } from "../../../../../types";
import { getPlayerEntity, isOwnedByCaller } from "@latticexyz/std-client";

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
        },
        api: {
          buildAt,
          dropInventory,
          gatherResource,
          transferInventory,
          escapePortal,
          dev: { spawnGold },
        },
        utils: { getItems },
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

  const getInventory = (entity: EntityIndex) => {
    const capacity = getComponentValue(Inventory, entity)?.value;
    if (capacity == null) return;

    const items = getItems(entity);
    const isFull = () => items.length >= capacity;

    return {
      capacity,
      items,
      isFull,
    };
  };

  const getSelectedEntity = () => [...runQuery([Has(Selected)])][0];
  const getHighlightedEntity = () => {
    const hoverHighlight = getComponentValueStrict(HoverHighlight, singletonEntity);
    const highlightedEntity = [
      ...runQuery([HasValue(LocalPosition, { x: hoverHighlight.x, y: hoverHighlight.y }), Not(TerrainType)]),
    ][0];

    return highlightedEntity;
  };
  const getHoverPosition = () => {
    const hoverHighlight = getComponentValue(HoverHighlight, singletonEntity);
    if (!hoverHighlight) return;
    if (!hoverHighlight.x || !hoverHighlight.y) return;

    return {
      x: hoverHighlight.x,
      y: hoverHighlight.y,
    };
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
    if (highlightedItems.length === 0) return false;

    const selectedInventory = getInventory(selectedEntity);
    if (!selectedInventory || selectedInventory.isFull()) return false;

    transferInventory(world.entities[highlightedEntity], world.entities[selectedEntity]);
    return true;
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
    if (selectedItems.length === 0) return false;

    const highlightedInventory = getInventory(highlightedEntity);
    if (!highlightedInventory || highlightedInventory.isFull()) return false;

    transferInventory(world.entities[selectedEntity], world.entities[highlightedEntity]);
    return true;
  };

  const attemptAttack = function (selectedEntity: EntityIndex, highlightedEntity: EntityIndex) {
    const selectedEntityOwner = getComponentValue(OwnedBy, selectedEntity);
    const highlightedEntityOwner = getComponentValue(OwnedBy, highlightedEntity);

    if (!selectedEntityOwner) return false;
    if (selectedEntityOwner.value === highlightedEntityOwner?.value) return false;

    const health = getComponentValue(Health, highlightedEntity);
    if (!health) return false;

    attackEntity(selectedEntity, highlightedEntity);
    return true;
  };

  const attemptEscapePortal = function (selectedEntity: EntityIndex, highlightedEntity: EntityIndex) {
    const escapePortalValue = getComponentValue(EscapePortal, highlightedEntity);
    if (!escapePortalValue) return false;

    escapePortal(world.entities[selectedEntity], world.entities[highlightedEntity]);
    return true;
  };

  const onRightClick = function (clickedPosition: WorldCoord) {
    const playerEntity = getPlayerEntity(connectedAddress.get(), world, Player);
    if (!playerEntity) return;
    if (hasComponent(Death, playerEntity)) return;

    const selectedEntity = getSelectedEntity();
    if (selectedEntity == null) return;

    const highlightedEntity = getHighlightedEntity();
    if (highlightedEntity == null) return;

    if (attemptEscapePortal(selectedEntity, highlightedEntity)) return;
    if (attemptGatherResource(selectedEntity, highlightedEntity)) return;
    if (attemptTakeInventory(selectedEntity, highlightedEntity, playerEntity)) return;
    if (attemptGiveInventory(selectedEntity, highlightedEntity, playerEntity)) return;
    if (attemptAttack(selectedEntity, highlightedEntity)) return;

    moveEntity(selectedEntity, clickedPosition);
  };

  input.onKeyPress(
    (keys) => keys.has("B"),
    () => {
      const buildPosition = getHoverPosition();
      if (!buildPosition) return;

      const selectedEntity = getSelectedEntity();
      if (!selectedEntity) return;

      const factory = getComponentValue(Factory, selectedEntity);
      if (!factory) return;
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

      const highlightedEntity = getHighlightedEntity();
      if (!highlightedEntity) return;

      attackEntity(selectedEntity, highlightedEntity);
    }
  );

  input.onKeyPress(
    (keys) => keys.has("G"),
    () => {
      const position = getHoverPosition();
      if (!position) return;

      spawnGold(position);
    }
  );

  input.onKeyPress(
    (keys) => keys.has("D"),
    () => {
      const selectedEntity = getSelectedEntity();
      if (!selectedEntity) return;

      const hoverPosition = getHoverPosition();
      if (!hoverPosition) return;

      const hasInventory = getComponentValue(Inventory, selectedEntity);
      if (!hasInventory) return;

      dropInventory(world.entities[selectedEntity], hoverPosition);
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
