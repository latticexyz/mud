import { transactionQueue } from "@latticexyz/common/actions";
import { rhodolite } from "@latticexyz/common/chains";
import { getBundlerTransport, toCoinbaseSmartAccount, createBundlerClient } from "@latticexyz/quarry/internal";
import { smartAccountActions } from "permissionless";
import { Account, Chain, ChainContract, Client, LocalAccount, Transport, createClient, http, zeroAddress } from "viem";
import { getChainId } from "viem/actions";
import { anvil } from "viem/chains";
import { fundAccount } from "./fundAccount";

const knownChains = [
  rhodolite,
  {
    ...anvil,
    contracts: {
      ...anvil.contracts,
      // quarryPaymaster: {
      //   address:
      // }
    },
  },
];

export async function getDeployClient(opts: {
  rpcUrl: string;
  rpcBatch?: boolean;
  account: LocalAccount;
}): Promise<Client<Transport, Chain | undefined, Account>> {
  const transport = http(opts.rpcUrl, {
    batch: opts.rpcBatch
      ? {
          batchSize: 100,
          wait: 1000,
        }
      : undefined,
  });

  const chainId = await getChainId(createClient({ transport }));
  const chain = knownChains.find((c) => c.id === chainId);

  const paymasterContract = chain?.contracts?.quarryPaymaster as ChainContract | undefined;
  const paymasterAddress = paymasterContract?.address;

  if (chain && paymasterAddress) {
    const client = createClient({ chain, transport });
    const account = await toCoinbaseSmartAccount({ client, owners: [opts.account] });
    const bundlerClient = createBundlerClient({
      chain,
      transport: getBundlerTransport(chain),
      account,
      paymasterAddress,
    }).extend(smartAccountActions());

    // doing public actions may fail for other chains
    // TODO: add publicActions bound to client (had deep TS errors)

    await fundAccount({ client: bundlerClient });
    // send empty tx to create the smart account, otherwise the first tx will fail due to bad gas estimation
    const tx = await bundlerClient.sendTransaction({ to: zeroAddress, data: "0x" });
    console.log("created smart account at tx", tx);
    // TODO: wait for tx receipt?

    return bundlerClient;
  }

  const client = createClient({
    chain,
    transport,
    account: opts.account,
  }).extend(transactionQueue());
  await fundAccount({ client });
  return client;
}
