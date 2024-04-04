import { createPublicClient, fallback, webSocket, http, createWalletClient, Hex, ClientConfig } from "viem";
import { encodeEntity, syncToRecs } from "@latticexyz/store-sync/recs";
import { getNetworkConfig } from "./getNetworkConfig";
import { world } from "./world";
import IWorldAbi from "contracts/out/IWorld.sol/IWorld.abi.json";
import { ContractWrite, createBurnerAccount, getContract, resourceToHex, transportObserver } from "@latticexyz/common";
import { Subject, share } from "rxjs";
import mudConfig from "contracts/mud.config";
import { createClient as createFaucetClient } from "@latticexyz/faucet";

export type SetupNetworkResult = Awaited<ReturnType<typeof setupNetwork>>;

export async function setupNetwork() {
  const networkConfig = await getNetworkConfig();

  const clientOptions = {
    chain: networkConfig.chain,
    transport: transportObserver(fallback([webSocket(), http()])),
    pollingInterval: 1000,
  } as const satisfies ClientConfig;

  const publicClient = createPublicClient(clientOptions);

  const burnerAccount = createBurnerAccount(networkConfig.privateKey as Hex);
  const burnerWalletClient = createWalletClient({
    ...clientOptions,
    account: burnerAccount,
  });

  const write$ = new Subject<ContractWrite>();
  const worldContract = getContract({
    address: networkConfig.worldAddress as Hex,
    abi: IWorldAbi,
    client: { public: publicClient, wallet: burnerWalletClient },
    onWrite: (write) => write$.next(write),
  });

  const { components, latestBlock$, storedBlockLogs$, waitForTransaction } = await syncToRecs({
    world,
    config: mudConfig,
    tables: {
      KeysWithValue: {
        namespace: "keywval",
        name: "Inventory",
        tableId: resourceToHex({ type: "table", namespace: "keywval", name: "Inventory" }),
        keySchema: {
          valueHash: { type: "bytes32" },
        },
        valueSchema: {
          keysWithValue: { type: "bytes32[]" },
        },
      },
    },
    address: networkConfig.worldAddress as Hex,
    publicClient,
    startBlock: BigInt(networkConfig.initialBlockNumber),
  } as const);

  try {
    console.log("creating faucet client");
    const faucet = createFaucetClient({ url: "http://localhost:3002/trpc" });

    const drip = async () => {
      console.log("dripping");
      const tx = await faucet.drip.mutate({ address: burnerAccount.address });
      console.log("got drip", tx);
    };

    drip();
    setInterval(drip, 20_000);
  } catch (e) {
    console.error(e);
  }

  return {
    world,
    components,
    playerEntity: encodeEntity({ address: "address" }, { address: burnerWalletClient.account.address }),
    publicClient,
    walletClient: burnerWalletClient,
    latestBlock$,
    storedBlockLogs$,
    waitForTransaction,
    worldContract,
    write$: write$.asObservable().pipe(share()),
  };
}
