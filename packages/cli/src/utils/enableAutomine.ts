import { getAutomine, getBlock, setAutomine, setIntervalMining } from "viem/actions";
import { debug } from "../debug";
import { Client } from "viem";
import { getAction } from "viem/utils";

type MiningMode =
  | {
      type: "automine";
    }
  | {
      type: "interval";
      blockTime: number;
    };

export type EnableAutomineResult = undefined | { reset: () => Promise<void> };

export async function enableAutomine(client: Client): Promise<EnableAutomineResult> {
  const miningMode = await getMiningMode(client).catch(() => undefined);
  // doesn't support automine or is already in automine
  if (!miningMode || miningMode.type === "automine") return;

  debug("Enabling automine");
  await setMiningMode(client, { type: "automine" });
  return {
    reset: () => {
      debug("Disabling automine");
      return setMiningMode(client, miningMode);
    },
  };
}

async function getMiningMode(client: Client): Promise<MiningMode> {
  const localClient = { mode: "anvil", ...client }; // set default mode to "anvil", potential error is caught by enableAutomine
  const isAutomine = await getAction(localClient, getAutomine, "getAutomine")({});
  if (isAutomine) {
    return { type: "automine" };
  }

  const blockTime = await getBlockTime(client);
  return { type: "interval", blockTime };
}

async function setMiningMode(client: Client, miningMode: MiningMode): Promise<void> {
  if (miningMode.type === "automine") {
    await getAction(client, setAutomine, "setAutomine")(true);
  } else {
    await getAction(client, setIntervalMining, "setIntervalMining")({ interval: miningMode.blockTime });
  }
}

async function getBlockTime(client: Client): Promise<number> {
  const latestBlock = await getAction(client, getBlock, "getBlock")({ blockTag: "latest" });
  const previousBlock = await getAction(client, getBlock, "getBlock")({ blockNumber: latestBlock.number - 1n });
  const blockTime = latestBlock.timestamp - previousBlock.timestamp;
  return Number(blockTime);
}
