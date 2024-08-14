import { headers } from "next/headers";
import { getWorldAddress } from "../utils/server/getWorldAddress";
import { Form } from "./Form";

async function getABI() {
  const headersList = headers();
  const protocol = headersList.get("x-forwarded-proto");
  const host = headersList.get("host");
  const worldAddress = getWorldAddress();

  const res = await fetch(`${protocol}://${host}/api/world?address=${worldAddress}`);
  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }

  return res.json();
}

export default async function Interact() {
  const data = await getABI();
  return <Form data={data} />;
}
