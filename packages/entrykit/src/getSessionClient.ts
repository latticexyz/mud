import { Address, Chain, Client, Transport } from "viem";
import { smartAccountActions } from "permissionless";
import { callFrom } from "@latticexyz/world/internal";
import { createBundlerClient } from "./createBundlerClient";
import { observer } from "@latticexyz/explorer/observer";
import { SessionClient } from "./common";
import { SmartAccount } from "viem/account-abstraction";

export async function getSessionClient<chain extends Chain>({
  sessionAccount,
  worldAddress,
  userAddress,
  client,
  bundlerTransport,
  paymasterAddress,
  explorerUrl,
}: {
  sessionAccount: SmartAccount;
  worldAddress: Address;
  userAddress: Address;
  client: Client<Transport, chain>;
  bundlerTransport: Transport;
  paymasterAddress: Address;
  explorerUrl?: string;
}): Promise<SessionClient<chain>> {
  const sessionClient = createBundlerClient({
    paymasterAddress,
    transport: bundlerTransport,
    client,
    account: sessionAccount,
  })
    .extend(smartAccountActions())
    .extend(callFrom({ worldAddress, delegatorAddress: userAddress, publicClient: client }))
    .extend((client) => (explorerUrl ? observer({ explorerUrl })(client) : {}))
    .extend(() => ({ userAddress }));

  return sessionClient;
}
