import { transactionQueue } from "@latticexyz/common/actions";
import { rhodolite } from "@latticexyz/common/chains";
import { claimGasPass, getAllowance, hasPassIssuer, wiresaw } from "@latticexyz/wiresaw/internal";
import { smartAccountActions } from "permissionless";
import { toSimpleSmartAccount } from "permissionless/accounts";
import {
  Account,
  Chain,
  ChainContract,
  Client,
  ClientConfig,
  LocalAccount,
  Transport,
  createClient,
  http,
  zeroAddress,
  parseEther,
} from "viem";
import { getChainId, getTransactionReceipt, setBalance } from "viem/actions";
import { anvil } from "viem/chains";
import { createBundlerClient } from "viem/account-abstraction";
import { debug } from "./debug";
import { getAction } from "viem/utils";

const knownChains = [rhodolite, anvil] as const;

export async function getDeployClient(opts: {
  rpcUrl: string;
  rpcBatch?: boolean;
  account: LocalAccount;
}): Promise<Client<Transport, Chain | undefined, Account>> {
  const chainId = await getChainId(createClient({ transport: http(opts.rpcUrl) }));
  const chain: Chain | undefined = knownChains.find((c) => c.id === chainId);

  const transport = wiresaw(
    http(opts.rpcUrl, {
      batch: opts.rpcBatch ? { batchSize: 100, wait: 1000 } : undefined,
    }),
  );

  const clientOptions = {
    chain,
    transport,
    pollingInterval: chainId === 31337 ? 10 : 500,
  } as const satisfies ClientConfig;

  const bundlerHttpUrl = chain?.rpcUrls.bundler?.http[0];
  // It would be nice to use viem's `getChainContractAddress` here, but it throws
  const paymasterContract = chain?.contracts?.quarryPaymaster as ChainContract | undefined;
  const paymasterAddress = paymasterContract?.address;

  if (bundlerHttpUrl && paymasterAddress) {
    const client = createClient(clientOptions);
    const account = await toSimpleSmartAccount({ client, owner: opts.account });
    const bundlerClient = createBundlerClient({
      chain,
      transport: wiresaw(http(bundlerHttpUrl)),
      account,
      paymaster: {
        getPaymasterData: async () => ({
          paymaster: paymasterAddress,
          paymasterData: "0x",
        }),
      },
    }).extend(smartAccountActions());

    // using bundler client for public actions may fail for other chains
    // TODO: add publicActions bound to client (had deep TS errors) or use separate read/write clients in deployer

    if (hasPassIssuer(chain)) {
      const allowance = await getAllowance({ client, paymasterAddress, userAddress: account.address });
      if (allowance < parseEther("0.01")) {
        debug("claimimg gas pass for deployer smart account");
        await claimGasPass({ chain: rhodolite, userAddress: account.address });

        // send empty tx to create the smart account, otherwise the first tx may fail due to bad gas estimation
        debug("creating deployer smart account");
        const hash = await bundlerClient.sendTransaction({ to: zeroAddress, data: "0x" });
        debug("tx:", hash);
        const receipt = await getAction(bundlerClient, getTransactionReceipt, "getTransactionReceipt")({ hash });
        debug("receipt:", receipt.status);
      }
    }

    return bundlerClient;
  }

  const client = createClient({
    ...clientOptions,
    account: opts.account,
  }).extend(transactionQueue());

  if (chainId == 31337) {
    debug("Setting anvil balance");
    await setBalance(
      client.extend(() => ({ mode: "anvil" })),
      {
        address: client.account.address,
        value: parseEther("100"),
      },
    );
  }

  return client;
}
