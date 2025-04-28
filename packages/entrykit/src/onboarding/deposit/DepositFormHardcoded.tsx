import { useState } from "react";
import { Button } from "../../ui/Button";
import { ArrowLeftIcon } from "../../icons/ArrowLeftIcon";
import { useSetBalance } from "../useSetBalance";
import { useShowMutationError } from "../../errors/useShowMutationError";

export function DepositFormHardcoded({ onClose, sessionAddress }: { onClose: () => void; sessionAddress: string }) {
  const [amount, setAmount] = useState<string>("0.01");
  const setBalance = useShowMutationError(useSetBalance());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;

    setBalance.mutate({
      address: sessionAddress as `0x${string}`,
      value: BigInt(parseFloat(amount) * 1e18), // Convert ETH to wei
    });
    onClose();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="tertiary" onClick={onClose} className="p-2">
          <ArrowLeftIcon className="w-4 h-4" />
        </Button>
        <h2 className="text-lg font-medium">Deposit Funds</h2>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6 flex-grow">
        <div className="flex flex-col gap-2">
          <label htmlFor="amount" className="text-sm">
            Amount to deposit (in ETH)
          </label>
          <input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="bg-gray-700 text-white px-3 py-2 rounded"
            placeholder="Enter amount in ETH"
            step="0.01"
            min="0"
          />
        </div>
        <div className="flex flex-col gap-2">
          <div className="text-sm text-gray-400">Estimated fee: 0.001 ETH</div>
          <div className="text-sm text-gray-400">Estimated time: 2-5 minutes</div>
        </div>
        <div className="flex gap-2 mt-auto">
          <Button type="submit" variant="primary" className="flex-1">
            Deposit
          </Button>
        </div>
      </form>
    </div>
  );
}
