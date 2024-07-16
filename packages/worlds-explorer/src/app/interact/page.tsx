import { headers } from "next/headers";
import { Form } from "./Form";

async function getABI() {
  const headersList = headers();
  const protocol = headersList.get("x-forwarded-proto");
  const host = headersList.get("host");

  const res = await fetch(`${protocol}://${host}/api/world`);
  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }

  return res.json();
}

export default async function Interact() {
  const data = await getABI();
  return (
    <div className="container">
      <Form data={data} />
    </div>
  );
}
