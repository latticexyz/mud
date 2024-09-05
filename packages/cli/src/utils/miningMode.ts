import { getBlockTime } from "./getBlockTime";

export type MiningMode =
  | {
      type: "automine";
    }
  | {
      type: "interval";
      blockTime: number;
    };

export function setMiningMode(rpcUrl: string, miningMode: MiningMode) {
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

  return fetch(rpcUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export async function getMiningMode(rpcUrl: string): Promise<MiningMode> {
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
