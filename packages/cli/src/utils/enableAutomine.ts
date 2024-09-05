import { debug } from "../debug";

type MiningMode =
  | {
      type: "automine";
    }
  | {
      type: "interval";
      blockTime: number;
    };

export type EnableAutomineResult = { reset: () => Promise<void> };

export async function enableAutomine(rpcUrl: string): Promise<EnableAutomineResult> {
  try {
    debug("Enabling automine");
    const prevMiningMode = await getMiningMode(rpcUrl);
    await setMiningMode(rpcUrl, { type: "automine" });
    return {
      reset: () => {
        debug("Disabling automine");
        return setMiningMode(rpcUrl, prevMiningMode);
      },
    };
  } catch (e) {
    debug("Skipping automine");
    return { reset: async () => void 0 };
  }
}

async function getMiningMode(rpcUrl: string): Promise<MiningMode> {
  const { result: isAutomine } = await fetch(rpcUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "anvil_getAutomine",
      params: [],
      id: 1,
    }),
  }).then((res) => res.json());

  if (isAutomine) {
    return { type: "automine" };
  }

  const blockTime = await getBlockTime(rpcUrl);
  return { type: "interval", blockTime };
}

async function setMiningMode(rpcUrl: string, miningMode: MiningMode): Promise<void> {
  const payload =
    miningMode.type === "automine"
      ? {
          jsonrpc: "2.0",
          method: "evm_setAutomine",
          params: [true],
          id: 1,
        }
      : {
          jsonrpc: "2.0",
          method: "evm_setIntervalMining",
          params: [miningMode.blockTime],
          id: 1,
        };

  await fetch(rpcUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

async function getBlockTime(rpc: string): Promise<number> {
  async function getBlock(blockNumber: number | string) {
    const response = await fetch(rpc, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_getBlockByNumber",
        params: [blockNumber, false],
        id: 1,
      }),
    });
    const data = await response.json();
    return data.result;
  }

  // Get the latest block
  const latestBlock = await getBlock("latest");
  const latestBlockNumber = parseInt(latestBlock.number, 16);
  const latestBlockTimestamp = parseInt(latestBlock.timestamp, 16);

  // Get the previous block
  const previousBlock = await getBlock(latestBlockNumber - 1);
  const previousBlockTimestamp = parseInt(previousBlock.timestamp, 16);

  // Calculate the block time
  const blockTime = latestBlockTimestamp - previousBlockTimestamp;

  return blockTime;
}
