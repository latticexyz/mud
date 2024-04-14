import { Account, Address, Chain, Hex, Transport, WalletClient, toHex } from "viem";
import { signTypedData } from "viem/actions";
import { callWithSignatureTypes } from "@latticexyz/world/internal";

// TODO: move this to world package or similar

export type SignCallOptions = {
  userAccountClient: WalletClient<Transport, Chain, Account>;
  chainId: number;
  worldAddress: Address;
  systemId: Hex;
  callData: Hex;
  nonce: bigint;
};

export async function signCall({
  userAccountClient,
  chainId,
  worldAddress,
  systemId,
  callData,
  nonce,
}: SignCallOptions) {
  return await signTypedData(userAccountClient, {
    account: userAccountClient.account,
    domain: {
      verifyingContract: worldAddress,
      salt: toHex(chainId, { size: 32 }),
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
