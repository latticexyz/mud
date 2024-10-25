import { Metadata } from "next";
import { InteractForm } from "./InteractForm";

export const metadata: Metadata = {
  title: "Interact",
};

export default async function InteractPage() {
  return <InteractForm />;
}
