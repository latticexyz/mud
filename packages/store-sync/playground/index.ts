import { redstone } from "@latticexyz/common/chains";
import { createStoreSync } from "../src";

const result = await createStoreSync({
  internal_clientOptions: {
    chain: redstone,
    validateBlockRange: true,
  },
  address: "0x253eb85B3C953bFE3827CC14a151262482E7189C",
  startBlock: 18756337n,
  enableHydrationChunking: false,
  storageAdapter: async (block) => {
    console.log("storageAdapter", block);
  },
});

// Start sync
result.storedBlockLogs$.subscribe();
