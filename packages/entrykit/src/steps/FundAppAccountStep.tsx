import { useBalance } from "wagmi";
import { AccountModalSection } from "../AccountModalSection";
import { AccountModalNav } from "../AccoutModalNav";
import { useConfig } from "../EntryKitConfigProvider";
import { useAppAccount } from "../useAppAccount";
import { DialogTitle } from "@radix-ui/react-dialog";

export function FundAppAccountStep() {
  const { chainId } = useConfig();

  const { data: appAccount } = useAppAccount();
  const balance = useBalance({ chainId, address: appAccount?.address });
  const allowance = 0n; // TODO

  const isFunded = balance.data?.value ?? (0n > 0n || allowance > 0n);

  return (
    <>
      <AccountModalNav />
      <AccountModalSection>
        <DialogTitle className="text-lg font-medium">Set up account</DialogTitle>
        <p>Allow your app account to spend gas on behalf of your primary wallet.</p>
        {/* TODO: improve this */}
        {!isFunded ? <p>Deposit funds to get started.</p> : null}
      </AccountModalSection>
    </>
  );
}
