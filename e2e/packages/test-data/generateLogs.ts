import { execa } from "execa";
import {
  ClientConfig,
  GetContractReturnType,
  Hex,
  PublicClient,
  RpcLog,
  WalletClient,
  createPublicClient,
  createWalletClient,
  encodeEventTopics,
  http,
  isHex,
  numberToHex,
  getContract,
  Transport,
  Chain,
} from "viem";
import { mudFoundry } from "@latticexyz/common/chains";
import { storeEventsAbi } from "@latticexyz/store";
import { Account, privateKeyToAccount } from "viem/accounts";
import IWorldAbi from "../contracts/out/IWorld.sol/IWorld.abi.json";

type WorldAbi = typeof IWorldAbi;

type WorldContract = GetContractReturnType<
  WorldAbi,
  PublicClient<Transport, Chain>,
  WalletClient<Transport, Chain, Account>
>;

export async function generateLogs(
  rpc: string,
  transactionHook: (worldContract: WorldContract) => Promise<Hex>,
): Promise<RpcLog[]> {
  console.log("deploying world");
  const { stdout, stderr } = await execa("pnpm", ["mud", "deploy", "--rpc", rpc, "--saveDeployment", "false"], {
    cwd: "../contracts",
    stdio: "pipe",
    env: {
      DEBUG: "mud:store-sync:createStoreSync",
    },
  });
  if (stderr) console.error(stderr);
  if (stdout) console.log(stdout);

  const [, worldAddress] = stdout.match(/worldAddress: '(0x[0-9a-f]+)'/i) ?? [];
  if (!isHex(worldAddress)) {
    throw new Error("world address not found in output, did the deploy fail?");
  }
  console.log("got world address", worldAddress);

  const clientOptions = {
    chain: mudFoundry,
    transport: http(rpc),
    pollingInterval: 1000,
  } as const satisfies ClientConfig;

  const publicClient = createPublicClient(clientOptions);

  // anvil default private key
  const account = privateKeyToAccount("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80");
  const walletClient = createWalletClient({
    ...clientOptions,
    account,
  });

  // use viem Contract instance to avoid nonce management
  const worldContract = getContract({
    address: worldAddress,
    abi: IWorldAbi,
    client: { public: publicClient, wallet: walletClient },
  });

  const lastTx = await transactionHook(worldContract);

  console.log("waiting for tx");
  const receipt = await publicClient.waitForTransactionReceipt({ hash: lastTx });

  console.log("fetching logs", receipt.blockNumber);
  const logs = await publicClient.request({
    method: "eth_getLogs",
    params: [
      {
        address: worldAddress,
        topics: [
          storeEventsAbi.flatMap((event) =>
            encodeEventTopics({
              abi: [event],
              eventName: event.name,
            }),
          ),
        ],
        fromBlock: numberToHex(0n),
        toBlock: numberToHex(receipt.blockNumber),
      },
    ],
  });

  return logs;
}
