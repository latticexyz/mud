import { useAccount } from "wagmi";
import { useDepositQuery } from "./hooks/useDepositQuery";
import { Button } from "../../ui/Button";
import { useDirectDepositSubmit } from "./hooks/useDirectDepositSubmit";

type DirectDepositContentProps = {
  amount: string | undefined;
};

export function DirectDepositContent({ amount }: DirectDepositContentProps) {
  const userAccount = useAccount();
  const userAccountAddress = userAccount.address;
  const { writeContractAsync, isPending, error } = useDepositQuery();
  const directDeposit = useDirectDepositSubmit(amount, writeContractAsync);

  const handleSubmit = async () => {
    await directDeposit();
  };

  return (
    <>
      {error ? <div>{String(error)}</div> : null}

      <Button className="w-full" pending={!userAccountAddress || isPending} onClick={handleSubmit}>
        Deposit
      </Button>
    </>
  );
}
