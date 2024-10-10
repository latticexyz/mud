import { Account, Address, Chain, Client, Transport } from "viem";
import { getAppSigner } from "./getAppSigner";
import { toCoinbaseSmartAccount } from "../smart-account/toCoinbaseSmartAccount";
import { createSmartAccountClient } from "permissionless";
import { callFrom } from "@latticexyz/world/internal";
// import { transactionQueue } from "@latticexyz/common/actions";

// TODO: lift out to somewhere else
const clientOpts = { pollingInterval: 1000 } as const;

export async function getAppAccountClient<chain extends Chain>({
  worldAddress,
  userAddress,
  client,
  bundlerTransport,
  paymasterAddress,
}: {
  worldAddress: Address;
  userAddress: Address;
  client: Client<Transport, chain>;
  bundlerTransport: Transport;
  paymasterAddress: Address;
}): Promise<Client<Transport, chain, Account>> {
  const appSigner = getAppSigner(userAddress);
  const account = await toCoinbaseSmartAccount({ client, owners: [appSigner] });

  const appAccountClient = createSmartAccountClient({
    bundlerTransport,
    client,
    account,
    ...clientOpts,
    // TODO: lift out to somewhere else
    paymaster: {
      getPaymasterData: async () => ({
        paymaster: paymasterAddress,
        paymasterData: "0x",
      }),
    },
    // TODO: lift out to somewhere else
    userOperation: {
      estimateFeesPerGas:
        // anvil hardcodes fee returned by `eth_maxPriorityFeePerGas`
        // so we have to override it here
        // https://github.com/foundry-rs/foundry/pull/8081#issuecomment-2402002485
        client.chain.id === 31337
          ? async () => ({
              maxFeePerGas: 100_000n,
              maxPriorityFeePerGas: 0n,
            })
          : undefined,
    },
  });

  return (
    appAccountClient
      // TODO: figure out how to do tx queue in a smart account
      // .extend(transactionQueue({ publicClient: client }))
      .extend(callFrom({ worldAddress, delegatorAddress: userAddress, publicClient: client }))
  );
}
