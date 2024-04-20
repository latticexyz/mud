import { Address } from "viem";

export type GetDripSignatureMessageParams = {
  address: Address;
  username: string;
  postContentPrefix: string;
};

export function getDripSignatureMessage({
  address,
  username,
  postContentPrefix,
}: GetDripSignatureMessageParams): string {
  return `MUD drip verification \n${postContentPrefix} \nAccount: ${address} \nUsername: ${username}`;
}
