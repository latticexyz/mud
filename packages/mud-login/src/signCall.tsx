import { Account, Address, Chain, Hex, Transport, WalletClient } from "viem";
import { signTypedData } from "viem/actions";
import { callWithSignatureTypes } from "@latticexyz/world/internal";

export type SignCallOptions = {
  userAccountClient: WalletClient<Transport, Chain, Account>;
  worldAddress: Address;
  systemId: Hex;
  callData: Hex;
  nonce: bigint;
};

export async function signCall({ userAccountClient, worldAddress, systemId, callData, nonce }: SignCallOptions) {
  return await signTypedData(userAccountClient, {
    account: userAccountClient.account,
    domain: {
      chainId: userAccountClient.chain.id,
      verifyingContract: worldAddress,
    },
    types: callWithSignatureTypes,
    primaryType: "Call",
    message: {
      signer: userAccountClient.account.address,
      systemId,
      callData,
      nonce,
    },
  });
}
