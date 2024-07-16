import { Flex, Container } from "@radix-ui/themes";
import { Form } from "./Form";

async function getABI() {
  const res = await fetch("http://localhost:1333/api/world");
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
