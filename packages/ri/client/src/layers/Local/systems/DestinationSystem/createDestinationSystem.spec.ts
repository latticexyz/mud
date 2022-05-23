import { createEntity, withValue, getComponentValue, setComponent } from "@latticexyz/recs";
import { LocalLayer } from "../../types";
import { createLocalLayer } from "../../createLocalLayer";
import { createHeadlessLayer, HeadlessLayer } from "../../../Headless";
import { createNetworkLayer, NetworkLayer } from "../../../Network";

describe("Destination System", () => {
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

  it("should compute a path to the coordinate given in the Destination component and set it in the Path component", () => {
    const {
      world,
      components: { Destination, Path, LocalPosition },
    } = local;

    const entity = createEntity(world, [withValue(LocalPosition, { x: 1, y: 1 })]);

    expect(getComponentValue(LocalPosition, entity)).toEqual({ x: 1, y: 1 });
    expect(getComponentValue(Destination, entity)).toBeUndefined();
    expect(getComponentValue(Path, entity)).toBeUndefined();

    setComponent(Destination, entity, { x: 1, y: 3 });
    expect(getComponentValue(Destination, entity)).toBeUndefined(); // The system removes the destination component when setting the path
    expect(getComponentValue(Path, entity)).toEqual({ x: [1, 1], y: [2, 3] });
  });
});
