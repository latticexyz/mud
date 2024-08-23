import { headers } from "next/headers";
import { Hex } from "viem";
import { Form } from "./Form";

export async function getAbi(worldAddress: Hex) {
  const headersList = headers();
  const protocol = headersList.get("x-forwarded-proto");
  const host = headersList.get("host");

  const res = await fetch(`${protocol}://${host}/api/world?${new URLSearchParams({ address: worldAddress })}`);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error);
  }

  return data;
}

export default async function InteractPage({ params }: { params: { worldAddress: Hex } }) {
  const { worldAddress } = params;
  const data = await getAbi(worldAddress);
  return <Form abi={data.abi} />;
}
