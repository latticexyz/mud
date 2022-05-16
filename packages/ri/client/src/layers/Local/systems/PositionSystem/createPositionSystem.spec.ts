import { createEntity, withValue, getComponentValue, setComponent } from "@mud/recs";
import { LocalLayer } from "../../types";
import { createLocalLayer } from "../../createLocalLayer";
import { createHeadlessLayer, HeadlessLayer } from "../../../Headless";
import { createNetworkLayer, NetworkLayer } from "../../../Network";
import { reaction } from "mobx";

describe("Position System", () => {
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

  it.only("should add the Destination component to entities if their network layer Position component changed", () => {
    const {
      world,
      components: { Position },
    } = network;
    const {
      components: { Destination },
    } = local;

    const entity = createEntity(world, [withValue(Position, { x: 1, y: 1 })]);

    let changed = 0;
    reaction(
      () => getComponentValue(Destination, entity),
      () => changed++
    );

    expect(changed).toBe(0);
    setComponent(Position, entity, { x: 1, y: 8 });

    // Destination should be added after the Position value changed and then be replaced with a Path component by the DestinationSystem
    expect(changed).toBe(2);
  });
});
