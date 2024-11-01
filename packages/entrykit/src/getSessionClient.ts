import { Address, Chain, Client, Transport } from "viem";
import { smartAccountActions } from "permissionless";
import { callFrom } from "@latticexyz/world/internal";
import { createBundlerClient } from "./createBundlerClient";
import { observer } from "@latticexyz/explorer/observer";
import { SessionClient } from "./common";
import { SmartAccount } from "viem/account-abstraction";
import { getBundlerTransport } from "./getBundlerTransport";

export async function getSessionClient<chain extends Chain>({
  client,
  userAddress,
  sessionAccount,
  worldAddress,
  paymasterAddress,
}: {
  client: Client<Transport, chain>;
  userAddress: Address;
  sessionAccount: SmartAccount;
  worldAddress: Address;
  paymasterAddress: Address;
}): Promise<SessionClient<chain>> {
  const bundlerTransport = getBundlerTransport(client.chain);

  const sessionClient = createBundlerClient({
    paymasterAddress,
    transport: bundlerTransport,
    client,
    account: sessionAccount,
  })
    .extend(smartAccountActions())
    .extend(callFrom({ worldAddress, delegatorAddress: userAddress, publicClient: client }))
    .extend(observer())
    .extend(() => ({ userAddress }));

  return sessionClient;
}
