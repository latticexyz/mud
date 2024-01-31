import { world } from "../../mud/world";
import { setup } from "../../mud/setup";

export type NetworkLayer = Awaited<ReturnType<typeof createNetworkLayer>>;

export const createNetworkLayer = async () => {
  const { components, systemCalls, network } = await setup();

  return {
    world,
    components,
    systemCalls,
    network,
  };
};
