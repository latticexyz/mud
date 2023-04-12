import { SetupContractConfig } from "@latticexyz/std-client";
import { Wallet } from "ethers";
const params = new URLSearchParams(window.location.search);

export const config: SetupContractConfig = {
  clock: {
    period: 1000,
    initialTime: 0,
    syncInterval: 5000,
  },
  provider: {
    jsonRpcUrl: params.get("rpc") ?? "http://localhost:8545",
    wsRpcUrl: params.get("wsRpc") ?? "ws://localhost:8545",
    chainId: Number(params.get("chainId")) || 31337,
  },
  privateKey: Wallet.createRandom().privateKey,
  chainId: Number(params.get("chainId")) || 31337,
  snapshotServiceUrl: params.get("snapshot") ?? undefined,
  initialBlockNumber: Number(params.get("initialBlockNumber")) || 0,
  worldAddress: params.get("worldAddress")!,
  devMode: params.get("dev") === "true",
};
