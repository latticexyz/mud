import { createEntity, withValue, getComponentValue, setComponent, defineQuery, Has } from "@latticexyz/recs";
import { LocalLayer } from "../../types";
import { createLocalLayer } from "../../createLocalLayer";
import { createHeadlessLayer, HeadlessLayer } from "../../../Headless";
import { createNetworkLayer, NetworkLayer } from "../../../Network";

describe("Selection system", () => {
  let network: NetworkLayer;
  let headless: HeadlessLayer;
  let local: LocalLayer;

  beforeEach(async () => {
    network = await createNetworkLayer({ skipContracts: true });
    headless = await createHeadlessLayer(network);
    local = await createLocalLayer(headless);
  });

  afterEach(() => {
    network.world.disposeAll();
    headless.world.disposeAll();
    local.world.disposeAll();
  });

  it("should select all selectable entities with position in the region", () => {
    const {
      components: { LocalPosition, Selectable, Selected, Selection },
      singletonEntity,
    } = local;
    const {
      components: { Position },
    } = network;

    const entity1 = createEntity(local.world, [withValue(LocalPosition, { x: 1, y: 2 }), withValue(Selectable, {})]); // Selectable
    const entity2 = createEntity(local.world, [withValue(LocalPosition, { x: 5, y: 4 }), withValue(Selectable, {})]); // Selectable
    const entity3 = createEntity(local.world, [withValue(LocalPosition, { x: 10, y: 20 }), withValue(Selectable, {})]); // Selectable but outside area
    const entity4 = createEntity(local.world, [withValue(LocalPosition, { x: 2, y: 2 })]); // Not Selectable
    const entity5 = createEntity(network.world, [withValue(Position, { x: 3, y: 3 }), withValue(Selectable, {})]); // Selectable
    const entity6 = createEntity(network.world, [withValue(Position, { x: 4, y: 2 })]); // Not Selectable
    const entity7 = createEntity(network.world, [withValue(Selectable, {})]); // Selectable but no position
    const entity8 = createEntity(local.world, [withValue(Selectable, {})]); // Selectable but no position

    setComponent(Selection, singletonEntity, { x: 0, y: 0, width: 6, height: 6 });
    const selectedEntities = defineQuery([Has(Selected)]).get();
    expect(selectedEntities).toEqual(new Set([entity1, entity2, entity5]));
    expect(getComponentValue(Selected, entity3)).toBeUndefined();
    expect(getComponentValue(Selected, entity4)).toBeUndefined();
    expect(getComponentValue(Selected, entity6)).toBeUndefined();
    expect(getComponentValue(Selected, entity7)).toBeUndefined();
    expect(getComponentValue(Selected, entity8)).toBeUndefined();
  });

  it("should unselect entities", () => {
    const {
      components: { LocalPosition, Selectable, Selected, Selection },
      singletonEntity,
    } = local;
    const {
      components: { Position },
    } = network;

    const entity1 = createEntity(local.world, [withValue(LocalPosition, { x: 1, y: 2 }), withValue(Selectable, {})]); // Selectable
    const entity2 = createEntity(local.world, [withValue(LocalPosition, { x: 5, y: 4 }), withValue(Selectable, {})]); // Selectable
    const entity3 = createEntity(local.world, [withValue(LocalPosition, { x: 10, y: 20 }), withValue(Selectable, {})]); // Selectable but outside area
    const entity4 = createEntity(local.world, [withValue(LocalPosition, { x: 2, y: 2 })]); // Not Selectable
    const entity5 = createEntity(network.world, [withValue(Position, { x: 3, y: 3 }), withValue(Selectable, {})]); // Selectable
    const entity6 = createEntity(network.world, [withValue(Position, { x: 4, y: 2 })]); // Not Selectable
    const entity7 = createEntity(network.world, [withValue(Selectable, {})]); // Selectable but no position
    const entity8 = createEntity(local.world, [withValue(Selectable, {})]); // Selectable but no position

    setComponent(Selection, singletonEntity, { x: 0, y: 0, width: 6, height: 6 });
    const selectedEntitiesQuery = defineQuery([Has(Selected)]);
    expect(selectedEntitiesQuery.get()).toEqual(new Set([entity1, entity2, entity5]));
    expect(getComponentValue(Selected, entity3)).toBeUndefined();
    expect(getComponentValue(Selected, entity4)).toBeUndefined();
    expect(getComponentValue(Selected, entity6)).toBeUndefined();
    expect(getComponentValue(Selected, entity7)).toBeUndefined();
    expect(getComponentValue(Selected, entity8)).toBeUndefined();

    setComponent(Selection, singletonEntity, { x: 0, y: 0, width: 0, height: 0 });
    expect(selectedEntitiesQuery.get()).toEqual(new Set([]));
    expect(getComponentValue(Selected, entity1)).toBeUndefined();
    expect(getComponentValue(Selected, entity2)).toBeUndefined();
    expect(getComponentValue(Selected, entity3)).toBeUndefined();
    expect(getComponentValue(Selected, entity4)).toBeUndefined();
    expect(getComponentValue(Selected, entity5)).toBeUndefined();
    expect(getComponentValue(Selected, entity6)).toBeUndefined();
    expect(getComponentValue(Selected, entity7)).toBeUndefined();
    expect(getComponentValue(Selected, entity8)).toBeUndefined();
  });
});
