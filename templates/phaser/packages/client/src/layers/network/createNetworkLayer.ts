import { IWorld__factory } from "../../../../contracts/types/ethers-contracts/factories/IWorld__factory";
import { world } from "../../mud/world";
import { setup } from "../../mud/setup";
import { getNetworkConfig } from "../../mud/getNetworkConfig";

export type NetworkLayer = Awaited<ReturnType<typeof createNetworkLayer>>;

export const createNetworkLayer = async () => {
  const { singletonEntity, components, network, worldSend } = await setup();

  const config = await getNetworkConfig();

  // Give components a Human-readable ID
  Object.entries(components).forEach(([name, component]) => {
    component.id = name;
  });

  const signer = network.signer.get();
  if (!signer) throw new Error("No signer found");

  const worldContract = IWorld__factory.connect(config.worldAddress, signer);

  return {
    world,
    worldContract,
    worldSend,
    singletonEntity,
    network,
    components,
  };
};
