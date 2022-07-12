import { createNetwork, createContracts, createSystemExecutor } from "@latticexyz/network";
import { DEV_PRIVATE_KEY, WORLD_ADDRESS, RPC_URL, RPC_WS_URL } from "./constants.local";
import { World as WorldContract } from "ri-contracts/types/ethers-contracts/World";
import WorldAbi from "ri-contracts/abi/World.json";
import { computed } from "mobx";
import { SystemTypes } from "ri-contracts/types/SystemTypes";
import { SystemAbis } from "ri-contracts/types/SystemAbis.mjs";
import { createWorld, defineComponent, EntityID, setComponent, Type } from "@latticexyz/recs";
import { keccak256 } from "./utils";

const config: Parameters<typeof createNetwork>[0] = {
  clock: {
    period: 5000,
    initialTime: 0,
    syncInterval: 5000,
  },
  provider: {
    jsonRpcUrl: RPC_URL,
    wsRpcUrl: RPC_WS_URL,
    options: {
      batch: false,
    },
  },
  privateKey: DEV_PRIVATE_KEY,
  chainId: 31337,
};

export async function setupContracts() {
  const network = await createNetwork(config);

  const signerOrProvider = computed(() => network.signer.get() || network.providers.get().json);

  const { contracts } = await createContracts<{ World: WorldContract }>({
    config: { World: { address: WORLD_ADDRESS, abi: WorldAbi.abi } },
    signerOrProvider,
  });

  const world = createWorld();
  const SystemsComponent = defineComponent(world, { value: Type.String });

  console.log("Fetching systems...");
  for (const systemId of Object.keys(SystemAbis)) {
    const hashedSystemId = keccak256(systemId);
    const address = await contracts.get().World.getSystemAddress(hashedSystemId);
    console.log("Got address for", systemId, address);
    const entity = world.registerEntity({ id: address as EntityID });
    setComponent(SystemsComponent, entity, { value: hashedSystemId });
  }

  const systems = createSystemExecutor<SystemTypes>(world, network, SystemsComponent, SystemAbis, {
    devMode: true,
  });

  return { systems, provider: computed(() => network.providers.get().json), signer: network.signer, contracts };
}
