import { Address, Client } from "viem";
import { readContract } from "viem/actions";
import { getDelegation } from "./onboarding/getDelegation";

/**
 * @internal
 */
export async function internal_validateSigner({
  client,
  worldAddress,
  userAddress,
  sessionAddress,
  signerAddress,
}: {
  client: Client;
  worldAddress: Address;
  userAddress: Address;
  sessionAddress: Address;
  signerAddress: Address;
}) {
  const ownerAddress = await readContract(client, {
    address: sessionAddress,
    abi: simpleAccountAbi,
    functionName: "owner",
  });

  if (ownerAddress.toLowerCase() !== signerAddress.toLowerCase()) {
    throw new Error(`Session account owner (${ownerAddress}) does not match message signer (${signerAddress}).`);
  }

  const hasDelegation = await getDelegation({
    client,
    worldAddress,
    sessionAddress,
    userAddress,
    blockTag: "latest",
  });

  if (!hasDelegation) {
    throw new Error(`Session account (${sessionAddress}) does not have delegation for user account (${userAddress}).`);
  }
}

// TODO: import ABI once we can get strongly typed JSON or expose `getOwner` or similar method on smart account
const simpleAccountAbi = [
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;
