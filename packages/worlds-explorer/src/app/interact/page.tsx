import { headers } from "next/headers";
import { Form } from "./Form";

async function getABI() {
  const headersList = headers();
  const protocol = headersList.get("x-forwarded-proto");
  const host = headersList.get("host");

  const res = await fetch(`${protocol}://${host}/api/world?address=${process.env.NEXT_PUBLIC_WORLD_ADDRESS}`);
  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }

  return res.json();
}

export default async function Interact() {
  const data = await getABI();
  return (
    <>
      {/* <h1 className="text-2xl font-bold py-4">Interact</h1> */}
      <Form data={data} />
    </>
  );
}
