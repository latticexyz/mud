import { createNetwork, createContracts, createTxQueue } from "@latticexyz/network";
import { DEV_PRIVATE_KEY, DIAMOND_ADDRESS, RPC_URL, RPC_WS_URL } from "./constants.local";
import { World as WorldContract } from "ri-contracts/types/ethers-contracts/World";
import { CombinedFacets } from "ri-contracts/types/ethers-contracts/CombinedFacets";
import WorldAbi from "ri-contracts/abi/World.json";
import CombinedFacetsAbi from "ri-contracts/abi/CombinedFacets.json";
import { computed } from "mobx";

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

  const { contracts } = await createContracts<{ Game: CombinedFacets; World: WorldContract }>({
    config: { Game: { abi: CombinedFacetsAbi.abi, address: DIAMOND_ADDRESS } },
    asyncConfig: async (c) => ({ World: { abi: WorldAbi.abi, address: await c.Game.world() } }),
    signerOrProvider,
  });

  const { txQueue } = createTxQueue(contracts, network);

  return { txQueue, provider: computed(() => network.providers.get().json), signer: network.signer };
}
