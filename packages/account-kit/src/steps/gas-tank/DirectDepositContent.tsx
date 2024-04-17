import { useAccount, useWriteContract } from "wagmi";
import { Hex } from "viem";
import { Button } from "../../ui/Button";
import { useDirectDepositSubmit } from "./hooks/useDirectDepositSubmit";
import { useEffect } from "react";

type DirectDepositContentProps = {
  amount: string | undefined;
  setTxHash: (hash: Hex) => void;
};

export function DirectDepositContent({ amount, setTxHash }: DirectDepositContentProps) {
  const userAccount = useAccount();
  const userAccountAddress = userAccount.address;
  const { data: hash, writeContractAsync, isPending, error } = useWriteContract();
  const directDeposit = useDirectDepositSubmit(amount, writeContractAsync);

  const handleSubmit = async () => {
    await directDeposit();
  };

  useEffect(() => {
    if (hash) {
      setTxHash(hash);
    }
  }, [hash, setTxHash]);

  return (
    <>
      {error ? <div>{String(error)}</div> : null}

      <Button className="w-full" pending={!userAccountAddress || isPending} onClick={handleSubmit}>
        {isPending && "Confirm in wallet"}
        {/* {isConfirming && "Awaiting network"}
        {!isPending && !isConfirming && "Deposit"} */}
      </Button>
    </>
  );
}
