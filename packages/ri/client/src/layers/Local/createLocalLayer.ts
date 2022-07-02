import {
  createEntity,
  setComponent,
  EntityIndex,
  getComponentValue,
  defineComponent,
  Type,
  namespaceWorld,
} from "@latticexyz/recs";
import { HeadlessLayer } from "../Headless";
import {
  defineStrollingComponent,
  defineLocalPositionComponent,
  defineLocalEntityTypeComponent,
  definePathComponent,
  defineMoveSpeedComponent,
  defineDestinationComponent,
  defineSelectionComponent,
  defineSelectedComponent,
  defineSelectableComponent,
  defineRockWallComponent,
} from "./components";
import {
  createDestinationSystem,
  createPathSystem,
  createSyncSystem,
  createPositionSystem,
  createSelectionSystem,
} from "./systems";
import { DEFAULT_MOVE_SPEED } from "./constants";
import { Area } from "@latticexyz/utils";
import { createPotentialPathSystem } from "./systems/PotentialPathSystem";

/**
 * The Local layer is the thrid layer in the client architecture and extends the Headless layer.
 * Its purpose is to add components and systems for all client-only functionality, eg. strolling imps.
 */
export async function createLocalLayer(headless: HeadlessLayer) {
  const world = namespaceWorld(headless.parentLayers.network.world, "local");

  // Components
  const LocalPosition = defineLocalPositionComponent(world);
  const LocalEntityType = defineLocalEntityTypeComponent(world);
  const Strolling = defineStrollingComponent(world);
  const Path = definePathComponent(world);
  const Destination = defineDestinationComponent(world);
  const MoveSpeed = defineMoveSpeedComponent(world);
  const Selection = defineSelectionComponent(world);
  const Selected = defineSelectedComponent(world);
  const Selectable = defineSelectableComponent(world);
  const RockWall = defineRockWallComponent(world);
  const PotentialPath = defineComponent(world, { x: Type.NumberArray, y: Type.NumberArray }, { id: "PotentialPath" });

  const components = {
    LocalPosition,
    LocalEntityType,
    Strolling,
    Path,
    MoveSpeed,
    Destination,
    Selection,
    Selected,
    Selectable,
    RockWall,
    PotentialPath,
  };

  // Constants
  const constants = { DEFAULT_MOVE_SPEED };

  // Singleton entity
  const singletonEntity = createEntity(world);
  setComponent(Selection, singletonEntity, { x: 0, y: 0, width: 0, height: 0 });

  // API
  function selectArea(area: Area | undefined) {
    setComponent(Selection, singletonEntity, area ?? { x: 0, y: 0, width: 0, height: 0 });
  }

  function resetSelection() {
    setComponent(Selection, singletonEntity, { x: 0, y: 0, width: 0, height: 0 });
  }

  function selectEntity(entity: EntityIndex) {
    if (getComponentValue(Selectable, entity)) setComponent(Selected, entity, { value: true });
  }

  // Layer
  const layer = {
    world,
    components,
    parentLayers: { ...headless.parentLayers, headless },
    constants,
    api: { selectArea, selectEntity, resetSelection },
    singletonEntity,
  };

  // Systems
  createSelectionSystem(layer);
  createSyncSystem(layer);
  createPositionSystem(layer);
  createDestinationSystem(layer);
  createPathSystem(layer);
  createPotentialPathSystem(layer);

  return layer;
}
