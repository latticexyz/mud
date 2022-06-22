import { createEntity, withValue, getComponentValue } from "@latticexyz/recs";
import { LocalLayer } from "../../types";
import { createLocalLayer } from "../../createLocalLayer";
import { createHeadlessLayer, HeadlessLayer } from "../../../Headless";
import { createNetworkLayer, NetworkLayer } from "../../../Network";
import { EntityTypes } from "../../../Network/types";

describe("Sync System", () => {
  let network: NetworkLayer;
  let headless: HeadlessLayer;
  let local: LocalLayer;

  beforeEach(async () => {
    network = await createNetworkLayer();
    headless = await createHeadlessLayer(network);
    local = await createLocalLayer(headless);
  });

  afterEach(() => {
    network.world.dispose();
  });

  it("should add the Strolling component to entities with EntityType value Creature", () => {
    const {
      components: { Strolling },
    } = local;

    const {
      world,
      components: { EntityType },
    } = network;

    const entity = createEntity(world, [withValue(EntityType, { value: EntityTypes.Creature })]);
    expect(getComponentValue(Strolling, entity)).toBeDefined();
  });

  it("should add the LocalPosition component to entities with Position and EntityType value Creature", () => {
    const {
      components: { LocalPosition },
    } = local;

    const {
      world,
      components: { EntityType, Position },
    } = network;

    const entity = createEntity(world, [
      withValue(Position, { x: 1, y: 2 }),
      withValue(EntityType, { value: EntityTypes.Creature }),
    ]);
    expect(getComponentValue(LocalPosition, entity)).toEqual({ x: 1, y: 2 });
  });

  it("should add the MoveSpeed component to entities with EntityType value Creature", () => {
    const {
      components: { MoveSpeed },
    } = local;

    const {
      world,
      components: { EntityType },
    } = network;

    const entity = createEntity(world, [withValue(EntityType, { value: EntityTypes.Creature })]);
    expect(getComponentValue(MoveSpeed, entity)).toBeDefined();
  });
});
