import { Hex, verifyMessage } from "viem";
import { GetDripSignatureMessageParams, getDripSignatureMessage } from "./getDripSignatureMessage";

export type VerifyDripMessageParams = GetDripSignatureMessageParams & {
  signature: Hex;
};

export function verifyDripMessage({
  address,
  username,
  signature,
  postContentPrefix,
}: VerifyDripMessageParams): Promise<boolean> {
  return verifyMessage({
    address,
    message: getDripSignatureMessage({ address, username, postContentPrefix }),
    signature,
  });
}
