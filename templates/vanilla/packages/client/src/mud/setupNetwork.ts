/* Definitions required to connect to a blockchain */

/*
 * The MUD client code is built on top of viem
 * (https://viem.sh/docs/getting-started.html).
 * This line imports the functions we need from it.
 */
import { createPublicClient, fallback, webSocket, http, createWalletClient, Hex, parseEther, ClientConfig } from "viem";
import { createFaucetService } from "@latticexyz/services/faucet";
import { encodeEntity, syncToRecs } from "@latticexyz/store-sync/recs";

/* Get the network configuration. */
import { getNetworkConfig } from "./getNetworkConfig";
import { world } from "./world";
import IWorldAbi from "contracts/abi/IWorld.sol/IWorld.abi.json";
import { createBurnerAccount, createContract, transportObserver, ContractWrite } from "@latticexyz/common";

/*
 * Use the RxJS library (https://rxjs.dev/) to create
 * event handlers.
 */
import { Subject, share } from "rxjs";

/*
 * Import packages/contracts/mud.config.ts with the World
 * information. See
 * https://mud.dev/tutorials/walkthrough/minimal-onchain#mudconfigts
 */
import mudConfig from "contracts/mud.config";

/*
 * The type definition for the return type of setup.
 * The result is an Awaited
 * (https://www.typescriptlang.org/docs/handbook/utility-types.html#awaitedtype),
 * which means it may not be immediately available.
 *
 * The Awaited result is of type ReturnType<typeof setup>,
 * which means that TypeScript will see the type that the
 * setup function returns and use that.
 */
export type SetupNetworkResult = Awaited<ReturnType<typeof setupNetwork>>;

export async function setupNetwork() {
  const networkConfig = await getNetworkConfig();

  /*
   * Create a Viem public (read only) client
   * (https://viem.sh/docs/clients/public.html)
   */
  const clientOptions = {
    chain: networkConfig.chain,
    transport: transportObserver(fallback([webSocket(), http()])),
    pollingInterval: 1000,
  } as const satisfies ClientConfig;

  const publicClient = createPublicClient(clientOptions);

  /*
   * Create A temporary wallet and a Viem client for it
   * (see https://viem.sh/docs/clients/wallet.html).
   */
  const burnerAccount = createBurnerAccount(networkConfig.privateKey as Hex);
  const burnerWalletClient = createWalletClient({
    ...clientOptions,
    account: burnerAccount,
  });

  /*
   * An RxJS Subject (https://rxjs.dev/guide/subject) is
   * a way to multicast events into multiple listeners.
   */
  const write$ = new Subject<ContractWrite>();

  /* Create an object for communicating with the deployed World. */
  const worldContract = createContract({
    address: networkConfig.worldAddress as Hex,
    abi: IWorldAbi,
    publicClient,
    walletClient: burnerWalletClient,
    onWrite: (write) => write$.next(write),
  });

  /* Download the World state to have a local copy */
  const { components, latestBlock$, blockStorageOperations$, waitForTransaction } = await syncToRecs({
    world,
    config: mudConfig,
    address: networkConfig.worldAddress as Hex,
    publicClient,
    startBlock: BigInt(networkConfig.initialBlockNumber),
  });

  /*
   * If there is a faucet, request (test) ETH if you have
   * less than 1 ETH. Repeat every 20 seconds to ensure you don't
   * run out.
   */
  if (networkConfig.faucetServiceUrl) {
    const address = burnerAccount.address;
    console.info("[Dev Faucet]: Player address -> ", address);

    const faucet = createFaucetService(networkConfig.faucetServiceUrl);

    const requestDrip = async () => {
      const balance = await publicClient.getBalance({ address });
      console.info(`[Dev Faucet]: Player balance -> ${balance}`);
      const lowBalance = balance < parseEther("1");
      if (lowBalance) {
        console.info("[Dev Faucet]: Balance is low, dripping funds to player");
        // Double drip
        await faucet.dripDev({ address });
        await faucet.dripDev({ address });
      }
    };

    requestDrip();
    // Request a drip every 20 seconds
    setInterval(requestDrip, 20000);
  }

  return {
    world,
    components,
    playerEntity: encodeEntity({ address: "address" }, { address: burnerWalletClient.account.address }),
    publicClient,
    walletClient: burnerWalletClient,
    latestBlock$,
    blockStorageOperations$,
    waitForTransaction,
    worldContract,
    write$: write$.asObservable().pipe(share()),
  };
}
