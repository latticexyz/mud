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
          takeItem,
          escapePortal,
          dev: { spawnGold },
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
    const inventoryResults = [...runQuery([ProxyExpand(OwnedBy, 1), Has(Inventory)], new Set([selectedEntity]))];
    const gathererInventory = inventoryResults[0];
    if (gathererInventory == null) return false;

    const resourceGenerator = getComponentValue(ResourceGenerator, highlightedEntity);
    if (!resourceGenerator) return false;

    gatherResource(world.entities[highlightedEntity], world.entities[selectedEntity]);

    return true;
  };

  const attemptTakeItem = function (selectedEntity: EntityIndex, highlightedEntity: EntityIndex) {
    const itemInventoryEntity = getComponentValue(Inventory, highlightedEntity);
    if (itemInventoryEntity != null) {
      // if the entity is an inventory
      const itemEntity = [...runQuery([HasValue(OwnedBy, { value: world.entities[highlightedEntity] })])][0];

      if (itemEntity) {
        // if the inventory has items
        const takerInventoryEntity = [
          ...runQuery([Has(Inventory), HasValue(OwnedBy, { value: world.entities[selectedEntity] })]),
        ][0];
        if (takerInventoryEntity) {
          // if our unit has an inventory
          const takerInventoryItems = [
            ...runQuery([HasValue(OwnedBy, { value: world.entities[takerInventoryEntity] })]),
          ];
          const takerInventoryCapacity = getComponentValue(Inventory, takerInventoryEntity)?.value;
          if (takerInventoryCapacity && takerInventoryCapacity > takerInventoryItems.length) {
            // if we have enough capacity
            const selectedEntityPos = getComponentValue(LocalPosition, selectedEntity);
            const itemInventoryPos = getComponentValue(LocalPosition, highlightedEntity);
            if (selectedEntityPos && itemInventoryPos && manhattan(selectedEntityPos, itemInventoryPos) <= 1) {
              takeItem(world.entities[takerInventoryEntity], world.entities[itemEntity]);
              return true;
            }
          }
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

    if (playerEntity != null && hasComponent(Player, playerEntity) && hasComponent(Death, playerEntity)) {
      return;
    }

    const selectedEntity = getSelectedEntity();
    if (selectedEntity) {
      const hoverHighlight = getComponentValueStrict(HoverHighlight, singletonEntity);
      const highlightedEntity = [
        ...runQuery([HasValue(LocalPosition, { x: hoverHighlight.x, y: hoverHighlight.y }), Not(TerrainType)]),
      ][0];

      if (highlightedEntity) {
        if (attemptEscapePortal(selectedEntity, highlightedEntity)) return;
        if (attemptGatherResource(selectedEntity, highlightedEntity)) return;
        if (attemptTakeItem(selectedEntity, highlightedEntity)) return;
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

      const inventoryEntity = [
        ...runQuery([Has(Inventory), HasValue(OwnedBy, { value: world.entities[selectedEntity] })]),
      ][0];

      if (hoverHighlight.x != undefined && hoverHighlight.y != undefined && inventoryEntity != null) {
        dropInventory(world.entities[inventoryEntity], { x: hoverHighlight.x, y: hoverHighlight.y });
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
