import { Account, Address, Chain, Client, LocalAccount, RpcSchema, Transport } from "viem";
import { smartAccountActions } from "permissionless";
import { callFrom } from "@latticexyz/world/internal";
import { createBundlerClient } from "./createBundlerClient";
import { SessionClient } from "./common";
import { SmartAccount } from "viem/account-abstraction";
import { getBundlerTransport } from "./getBundlerTransport";

export async function getSessionClient({
  userAddress,
  sessionAccount,
  sessionSigner,
  worldAddress,
}: {
  userAddress: Address;
  sessionAccount: SmartAccount;
  sessionSigner: LocalAccount;
  worldAddress: Address;
}): Promise<SessionClient> {
  const client = sessionAccount.client;
  if (!clientHasChain(client)) {
    throw new Error("Session account client had no associated chain.");
  }

  const bundlerClient = createBundlerClient({
    transport: getBundlerTransport(client.chain),
    client,
    account: sessionAccount,
  });

  const sessionClient = bundlerClient
    .extend(smartAccountActions)
    .extend(
      callFrom({
        worldAddress,
        delegatorAddress: userAddress,
        publicClient: client,
      } as never),
    )
    // TODO: add observer once we conditionally fetch receipts while bridge is open
    .extend(() => ({ userAddress, worldAddress, internal_signer: sessionSigner }));

  return sessionClient;
}

function clientHasChain<
  transport extends Transport = Transport,
  chain extends Chain | undefined = Chain | undefined,
  account extends Account | undefined = Account | undefined,
  rpcSchema extends RpcSchema | undefined = undefined,
>(
  client: Client<transport, chain, account, rpcSchema>,
): client is Client<transport, Exclude<chain, undefined>, account, rpcSchema> {
  return client.chain != null;
}
