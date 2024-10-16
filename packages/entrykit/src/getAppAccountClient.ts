import { Account, Address, Chain, Client, Transport } from "viem";
import { getAppSigner } from "./getAppSigner";
import { toCoinbaseSmartAccount } from "./smart-account/toCoinbaseSmartAccount";
import { smartAccountActions } from "permissionless";
import { callFrom } from "@latticexyz/world/internal";
import { createBundlerClient } from "./createBundlerClient";

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

  const appAccountClient = createBundlerClient({
    paymasterAddress,
    transport: bundlerTransport,
    client,
    account,
  });

  return appAccountClient
    .extend(smartAccountActions())
    .extend(callFrom({ worldAddress, delegatorAddress: userAddress, publicClient: client }));
}
