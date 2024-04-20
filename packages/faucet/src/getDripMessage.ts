import { Address } from "viem";

export type GetDripMessageParams = {
  address: Address;
  username: string;
  signMessagePrefix: string;
};

export function getDripMessage({ address, username, signMessagePrefix }: GetDripMessageParams): string {
  return `MUD drip verification \n${signMessagePrefix} \nAccount: ${address} \nUsername: ${username}`;
}
