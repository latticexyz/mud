import { Hex } from "viem";
import { getDozerUrl } from "./getDozerUrl";

export type DozerResponse = {
  block_height: number;
  result: [Hex[][]];
};

export async function fetchDozer(
  chainName: string,
  body: {
    address: Hex;
    query: string;
  },
): Promise<DozerResponse> {
  const dozerUrl = getDozerUrl(chainName);
  const response = await fetch(dozerUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify([body]),
  });
  return response.json();
}
