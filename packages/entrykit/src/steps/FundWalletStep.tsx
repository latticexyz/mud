import { useAccount, useBalance } from "wagmi";
import { AccountModalSection } from "../AccountModalSection";
import { AccountModalNav } from "../AccoutModalNav";
import { useConfig } from "../EntryKitConfigProvider";
import { Balance } from "./deposit/Balance";
import { DialogTitle } from "@radix-ui/react-dialog";

export function FundWalletStep() {
  const { chainId } = useConfig();

  const wallet = useAccount();
  const balance = useBalance({ chainId, address: wallet.address });
  const allowance = 0n; // TODO

  const isFunded = balance.data?.value ?? (0n > 0n || allowance > 0n);

  return (
    <>
      <AccountModalNav />
      <AccountModalSection>
        <DialogTitle className="text-lg font-medium">Wallet balance</DialogTitle>
        <p>
          Every onchain interaction uses gas. Get a <a href="#TODO">Quarry Pass</a> or top up your balance with funds
          from any chain.
        </p>
        {/* TODO: improve this */}
        <p>
          {/* TODO: pending/error states */}
          Wallet balance: <Balance amount={balance.data?.value ?? 0n} />
          <br />
          Wallet allowance: <Balance amount={allowance} />
        </p>
        {!isFunded ? <p>Deposit funds to get started.</p> : null}
      </AccountModalSection>
    </>
  );
}
