import { Metadata } from "next";
import { Form } from "./Form";

export const metadata: Metadata = {
  title: "Interact",
};

export default async function InteractPage() {
  return <Form />;
}
