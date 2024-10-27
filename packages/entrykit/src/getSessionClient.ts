import { Address, Chain, Client, Transport } from "viem";
import { getSessionSigner } from "./getSessionSigner";
import { toCoinbaseSmartAccount } from "./smart-account/toCoinbaseSmartAccount";
import { smartAccountActions } from "permissionless";
import { callFrom } from "@latticexyz/world/internal";
import { createBundlerClient } from "./createBundlerClient";
import { observer } from "@latticexyz/explorer/observer";
import { SessionClient } from "./common";

export async function getSessionClient<chain extends Chain>({
  worldAddress,
  userAddress,
  client,
  bundlerTransport,
  paymasterAddress,
  explorerUrl,
}: {
  worldAddress: Address;
  userAddress: Address;
  client: Client<Transport, chain>;
  bundlerTransport: Transport;
  paymasterAddress: Address;
  explorerUrl?: string;
}): Promise<SessionClient<chain>> {
  const sessionSigner = getSessionSigner(userAddress);
  const account = await toCoinbaseSmartAccount({ client, owners: [sessionSigner] });

  const sessionClient = createBundlerClient({
    paymasterAddress,
    transport: bundlerTransport,
    client,
    account,
  })
    .extend(smartAccountActions())
    .extend(callFrom({ worldAddress, delegatorAddress: userAddress, publicClient: client }))
    .extend((client) => (explorerUrl ? observer({ explorerUrl })(client) : {}))
    .extend(() => ({ userAddress }));

  return sessionClient;
}
