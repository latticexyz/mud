import { createEntity, withValue, getComponentValueStrict } from "@latticexyz/recs";
import { LocalLayer } from "../../types";
import { createLocalLayer } from "../../createLocalLayer";
import { createHeadlessLayer, HeadlessLayer } from "../../../Headless";
import { createNetworkLayer, NetworkLayer } from "../../../Network";
import { Time } from "../../../../utils/time";
import { sleep } from "../../../../utils/sleep";
import { manhattan } from "../../../../utils/distance";

describe("Strolling System", () => {
  let network: NetworkLayer;
  let headless: HeadlessLayer;
  let local: LocalLayer;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let interval: any;

  beforeEach(async () => {
    // Let timers run fast forward
    Time.time.setTimestamp(0);
    Time.time.setPacemaker(
      (setTimestamp) =>
        (interval = setInterval(() => {
          setTimestamp(Time.time.timestamp + 100);
        }, 1))
    );

    network = await createNetworkLayer({ skipContracts: true });
    headless = await createHeadlessLayer(network);
    local = await createLocalLayer(headless);
  });

  afterEach(() => {
    clearInterval(interval);
    network.world.disposeAll();
    headless.world.disposeAll();
    local.world.disposeAll();
  });

  it("should set the LocalPosition component of entities with the Strolling component to a valid value once a second", async () => {
    const {
      world,
      components: { LocalPosition, Strolling },
    } = local;

    const entity = createEntity(world, [withValue(LocalPosition, { x: 1, y: 1 }), withValue(Strolling, {})]);
    let oldPosition = getComponentValueStrict(LocalPosition, entity);

    await sleep(1000);
    let newPosition = getComponentValueStrict(LocalPosition, entity);
    expect(manhattan(oldPosition, newPosition)).toBe(1);
    oldPosition = newPosition;

    await sleep(1000);
    newPosition = getComponentValueStrict(LocalPosition, entity);
    expect(manhattan(oldPosition, newPosition)).toBe(1);
    oldPosition = newPosition;

    await sleep(1000);
    newPosition = getComponentValueStrict(LocalPosition, entity);
    expect(manhattan(oldPosition, newPosition)).toBe(1);
    oldPosition = newPosition;

    await sleep(1000);
    newPosition = getComponentValueStrict(LocalPosition, entity);
    expect(manhattan(oldPosition, newPosition)).toBe(1);
    oldPosition = newPosition;
  });
});
