import { Hex, verifyMessage } from "viem";
import { GetDripMessageParams, getDripMessage } from "./getDripMessage";

export type VerifyDripMessageParams = GetDripMessageParams & {
  signature: Hex;
};

export function verifyDripMessage({ address, username, signature }: VerifyDripMessageParams): Promise<boolean> {
  return verifyMessage({ address, message: getDripMessage({ address, username }), signature });
}
