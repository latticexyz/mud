import { Chain, Client, Hex, Transport } from "viem";
import { ToJwtSmartAccountReturnType, toJwtSmartAccount } from "./toJwtSmartAccount";
import { getSigner } from "./getSigner";

export async function getAccount(
  client: Client<Transport, Chain>,
  jwtProof: any,
): Promise<ToJwtSmartAccountReturnType> {
  const signer = getSigner();
  return await toJwtSmartAccount({ client, jwtProof, signer });
}
