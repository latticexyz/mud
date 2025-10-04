import { Address, Chain, Client, Transport } from "viem";
import { readContract } from "viem/actions";
import { getAction } from "viem/utils";
import { paymasterAbi } from "./common";
import { getPaymaster } from "../getPaymaster";

export type GetAllowanceParams = {
  client: Client<Transport, Chain>;
  userAddress: Address;
};

export async function getAllowance({ client, userAddress }: GetAllowanceParams): Promise<null | bigint> {
  const paymaster = getPaymaster(client.chain, undefined);
  if (paymaster?.type !== "quarry") return null;

  return await getAction(
    client,
    readContract,
    "readContract",
  )({
    address: paymaster.address,
    abi: paymasterAbi,
    functionName: "getAllowance",
    args: [userAddress],
  });
}
