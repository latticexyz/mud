import { Metadata } from "next";
import { InteractForm } from "./InteractForm";

export const metadata: Metadata = {
  title: "Interact",
};

export default async function InteractPage() {
  return (
    <div className="flex h-[calc(100vh-70px)] flex-col">
      <InteractForm />
    </div>
  );
}
