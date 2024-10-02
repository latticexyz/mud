import { coinbaseSmartWalletFactory } from "./common";
import CoinbaseSmartWalletFactory from "./abi/CoinbaseSmartWalletFactory";
import { Address, Client, getAddress } from "viem";
import { P256Credential } from "webauthn-p256";
import { cache } from "./cache";
import { readContract } from "viem/actions";

const salt = 0n;

export async function getCredentialAddress(client: Client, credentialId: P256Credential["id"]): Promise<Address> {
  const { publicKeys, addresses } = cache.getState();

  if (addresses[credentialId]) return addresses[credentialId];

  const publicKey = publicKeys[credentialId];
  if (!publicKey) {
    throw new Error("Could not find a public key associated with that credential ID.");
  }

  const address = await readContract(client, {
    address: coinbaseSmartWalletFactory,
    abi: CoinbaseSmartWalletFactory,
    functionName: "getAddress",
    args: [[publicKey], salt],
  });
  cache.setState((state) => ({
    addresses: { ...state.addresses, [credentialId]: address },
  }));

  return getAddress(address);
}
