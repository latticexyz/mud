import { Flex, Container } from "@radix-ui/themes";
import { Form } from "./Form";

import { headers } from "next/headers";

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
    <Container>
      <Flex direction="column" gap="2">
        <Form data={data} />
      </Flex>
    </Container>
  );
}
