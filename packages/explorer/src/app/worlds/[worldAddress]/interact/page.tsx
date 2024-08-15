import { headers } from "next/headers";
import { Hex } from "viem";
import { Form } from "./Form";

async function getABI(worldAddress: Hex) {
  const headersList = headers();
  const protocol = headersList.get("x-forwarded-proto");
  const host = headersList.get("host");

  const res = await fetch(`${protocol}://${host}/api/world?address=${worldAddress}`);
  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }

  return res.json();
}

export default async function Interact({ params }: { params: { worldAddress: Hex } }) {
  const { worldAddress } = params;
  const data = await getABI(worldAddress);
  return <Form data={data} />;
}
