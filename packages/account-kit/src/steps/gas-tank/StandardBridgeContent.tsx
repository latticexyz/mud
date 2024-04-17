import { useState } from "react";
import { Button } from "../../ui/Button";
import { useDepositQuery } from "./hooks/useDepositQuery";
import { useStandardBridgeSubmit } from "./hooks/useStandardBridgeSubmit";

type StandardBridgeContentProps = {
  amount: string;
};

export function StandardBridgeContent({ amount }: StandardBridgeContentProps) {
  const [tx] = useState<string | null>(null); // TODO: remove this
  const { writeContractAsync } = useDepositQuery();
  const standardBridgeDeposit = useStandardBridgeSubmit(amount, writeContractAsync);

  const handleSubmit = async () => {
    await standardBridgeDeposit();
  };

  return (
    <>
      <div className="mt-[15px] w-full">
        <Button onClick={handleSubmit}>Bridge to Redstone gas tank</Button>
      </div>

      {tx && (
        <div className="mt-[15px]">
          <a href={tx} target="_blank" rel="noopener noreferrer" className="underline">
            View transaction
          </a>
        </div>
      )}
    </>
  );
}
