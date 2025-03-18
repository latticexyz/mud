import { RecoverMessageAddressParameters, recoverMessageAddress } from "viem";
import { SessionClient } from "./common";
import { readContract } from "viem/actions";
import { getDelegation } from "./onboarding/getDelegation";

/**
 * @internal
 */
export async function internal_validateSignature({
  sessionClient,
  message,
  signature,
}: {
  sessionClient: SessionClient;
} & RecoverMessageAddressParameters) {
  const [isDeployed, signerAddress] = await Promise.all([
    sessionClient.account.isDeployed(),
    sessionClient.account.getAddress(),
    recoverMessageAddress({ message, signature }),
  ]);

  if (!isDeployed) {
    throw new Error("Session account not deployed. Have you executed a transaction yet?");
  }

  const ownerAddress = await readContract(sessionClient.account.client, {
    address: sessionClient.account.address,
    abi: simpleAccountAbi,
    functionName: "owner",
  });

  if (ownerAddress.toLowerCase() !== signerAddress.toLowerCase()) {
    throw new Error(`Session account owner (${ownerAddress}) does not match message signer (${signerAddress}).`);
  }

  const hasDelegation = await getDelegation({
    client: sessionClient.account.client,
    worldAddress: sessionClient.worldAddress,
    sessionAddress: sessionClient.account.address,
    userAddress: sessionClient.userAddress,
  });

  if (!hasDelegation) {
    throw new Error(
      `Session account (${sessionClient.account.address}) does not have delegation for user account (${sessionClient.userAddress}).`,
    );
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
