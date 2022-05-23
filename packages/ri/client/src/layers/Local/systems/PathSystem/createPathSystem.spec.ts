import { createEntity, withValue, getComponentValue, setComponent } from "@latticexyz/recs";
import { LocalLayer } from "../../types";
import { createLocalLayer } from "../../createLocalLayer";
import { createHeadlessLayer, HeadlessLayer } from "../../../Headless";
import { createNetworkLayer, NetworkLayer } from "../../../Network";
import { Time } from "../../../../utils/time";
import { FAST_MOVE_SPEED } from "../../constants";
import { sleep } from "../../../../utils/sleep";

describe("Path System", () => {
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

  it("should set entities LocalPosition according to the path defined in their Path component", async () => {
    const {
      world,
      components: { Path, LocalPosition },
    } = local;

    const entity = createEntity(world, [withValue(LocalPosition, { x: 1, y: 1 })]);
    expect(getComponentValue(LocalPosition, entity)).toEqual({ x: 1, y: 1 });
    expect(getComponentValue(Path, entity)).toBeUndefined();

    setComponent(Path, entity, { x: [1, 1, 2, 3], y: [2, 3, 3, 3] });
    expect(getComponentValue(LocalPosition, entity)).toEqual({ x: 1, y: 1 });
    expect(getComponentValue(Path, entity)).toEqual({ x: [1, 1, 2, 3], y: [2, 3, 3, 3] });

    await sleep(FAST_MOVE_SPEED);
    expect(getComponentValue(LocalPosition, entity)).toEqual({ x: 1, y: 2 });
    expect(getComponentValue(Path, entity)).toEqual({ x: [1, 1, 2, 3], y: [2, 3, 3, 3] });

    await sleep(FAST_MOVE_SPEED);
    expect(getComponentValue(LocalPosition, entity)).toEqual({ x: 1, y: 3 });
    expect(getComponentValue(Path, entity)).toEqual({ x: [1, 1, 2, 3], y: [2, 3, 3, 3] });

    await sleep(FAST_MOVE_SPEED);
    expect(getComponentValue(LocalPosition, entity)).toEqual({ x: 2, y: 3 });
    expect(getComponentValue(Path, entity)).toEqual({ x: [1, 1, 2, 3], y: [2, 3, 3, 3] });

    await sleep(FAST_MOVE_SPEED);
    expect(getComponentValue(LocalPosition, entity)).toEqual({ x: 3, y: 3 });
    expect(getComponentValue(Path, entity)).toBeUndefined();
  });
});
