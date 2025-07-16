import { Metadata } from "next";
import { Separator } from "../../../../../../components/ui/Separator";
import { AbiExplorer } from "./AbiExplorer";
import { DecodeForm } from "./DecodeForm";

export const metadata: Metadata = {
  title: "ABI Explorer",
};

export default async function UtilsPage() {
  return (
    <div className="flex h-[calc(100vh-70px)] flex-col space-y-8">
      <DecodeForm />
      <Separator />
      <AbiExplorer />
    </div>
  );
}
