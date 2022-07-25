import { createEntity, withValue, getComponentValue, setComponent } from "@latticexyz/recs";
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
    network = await createNetworkLayer();
    headless = await createHeadlessLayer(network);
    local = await createLocalLayer(headless);
  });

  afterEach(() => {
    network.world.dispose();
  });
});
