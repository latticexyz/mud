import { Address } from "viem";

export type GetDripMessageParams = {
  address: Address;
  username: string;
};

export function getDripMessage({ address, username }: GetDripMessageParams): string {
  return `MUD drip verification \nAccount: ${address} \nUsername: ${username}`;
}
