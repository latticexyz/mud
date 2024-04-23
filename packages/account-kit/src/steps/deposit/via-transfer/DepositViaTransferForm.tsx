import { useState } from "react";
import { DepositForm } from "../DepositForm";

export function DepositViaTransferForm() {
  const [amount, setAmount] = useState<bigint | undefined>();

  return (
    <DepositForm
      amount={amount}
      setAmount={setAmount}
      onSubmit={async () => {
        console.log("submitting");
      }}
    />
  );
}
