/*
 * The MUD client code is built on top of viem
 * (https://viem.sh/docs/getting-started.html).
 * This line imports the functions we need from it.
 */
import {
  createPublicClient,
  fallback,
  webSocket,
  http,
  Hex,
  parseEther,
  ClientConfig,
  getContract,
  PublicClient,
} from "viem";
import { ENTRYPOINT_ADDRESS_V07, createSmartAccountClient } from "permissionless";
import { signerToSimpleSmartAccount } from "permissionless/accounts";
import { createPimlicoBundlerClient } from "permissionless/clients/pimlico";
import { createFaucetService } from "@latticexyz/services/faucet";
import { syncToZustand } from "@latticexyz/store-sync/zustand";
import { getNetworkConfig } from "./getNetworkConfig";
import IWorldAbi from "contracts/out/IWorld.sol/IWorld.abi.json";
import { createBurnerAccount, transportObserver, ContractWrite } from "@latticexyz/common";
import { transactionQueue, writeObserver } from "@latticexyz/common/actions";
import { Subject, share } from "rxjs";
import { MOCK_PAYMASTER_ADDRESS } from "../../../account-abstraction/src/constants";

/*
 * Import our MUD config, which includes strong types for
 * our tables and other config options. We use this to generate
 * things like RECS components and get back strong types for them.
 *
 * See https://mud.dev/templates/typescript/contracts#mudconfigts
 * for the source of this information.
 */
import mudConfig from "contracts/mud.config";

export type SetupNetworkResult = Awaited<ReturnType<typeof setupNetwork>>;

const waitForEntryPointDeployment = async (client: PublicClient) => {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const code = client.getBytecode({ address: ENTRYPOINT_ADDRESS_V07 });

    if (code !== undefined) {
      break;
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
};

export async function setupNetwork() {
  const networkConfig = await getNetworkConfig();

  /*
   * Create a viem public (read only) client
   * (https://viem.sh/docs/clients/public.html)
   */
  const clientOptions = {
    chain: networkConfig.chain,
    transport: transportObserver(fallback([webSocket(), http()])),
    pollingInterval: 1000,
  } as const satisfies ClientConfig;

  const publicClient = createPublicClient(clientOptions);

  await waitForEntryPointDeployment(publicClient);

  /*
   * Create an observable for contract writes that we can
   * pass into MUD dev tools for transaction observability.
   */
  const write$ = new Subject<ContractWrite>();

  /*
   * Create a temporary wallet and a viem client for it
   * (see https://viem.sh/docs/clients/wallet.html).
   */
  const burnerAccount = createBurnerAccount(networkConfig.privateKey as Hex);

  const pimlicoBundlerClient = createPimlicoBundlerClient({
    chain: clientOptions.chain,
    transport: http("http://127.0.0.1:4337"),
    entryPoint: ENTRYPOINT_ADDRESS_V07,
  });

  const burnerSmartAccount = await signerToSimpleSmartAccount(publicClient, {
    entryPoint: ENTRYPOINT_ADDRESS_V07,
    factoryAddress: "0x91E60e0613810449d098b0b5Ec8b51A0FE8c8985",
    signer: burnerAccount,
  });

  const burnerSmartAccountClient = createSmartAccountClient({
    chain: clientOptions.chain,
    bundlerTransport: http("http://127.0.0.1:4337"),
    middleware: {
      sponsorUserOperation: async ({ userOperation }) => {
        const gasEstimates = await pimlicoBundlerClient.estimateUserOperationGas({
          userOperation: {
            ...userOperation,
            paymaster: MOCK_PAYMASTER_ADDRESS,
            paymasterData: "0x",
          },
        });

        return {
          paymasterData: "0x",
          paymaster: MOCK_PAYMASTER_ADDRESS,
          ...gasEstimates,
        };
      },
      gasPrice: async () => (await pimlicoBundlerClient.getUserOperationGasPrice()).fast,
    },
    entryPoint: ENTRYPOINT_ADDRESS_V07,
    account: burnerSmartAccount,
  })
    .extend(transactionQueue(publicClient))
    .extend(writeObserver({ onWrite: (write) => write$.next(write) }));

  /*
   * Create an object for communicating with the deployed World.
   */
  const worldContract = getContract({
    address: networkConfig.worldAddress as Hex,
    abi: IWorldAbi,
    client: { public: publicClient, wallet: burnerSmartAccountClient },
  });

  /*
   * Sync on-chain state into RECS and keeps our client in sync.
   * Uses the MUD indexer if available, otherwise falls back
   * to the viem publicClient to make RPC calls to fetch MUD
   * events from the chain.
   */
  const { tables, useStore, latestBlock$, storedBlockLogs$, waitForTransaction } = await syncToZustand({
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
    tables,
    useStore,
    publicClient,
    walletClient: burnerSmartAccountClient,
    latestBlock$,
    storedBlockLogs$,
    waitForTransaction,
    worldContract,
    write$: write$.asObservable().pipe(share()),
  };
}
