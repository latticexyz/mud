export type AmountProps = {
  amount: number | undefined;
  setAmount: (amount: number) => void;
};

export const AmountInput = ({ amount, setAmount }: AmountProps) => {
  return (
    <input
      className="w-full px-[16px] border border-neutral-300 font-medium text-[18px] dark:bg-neutral-900 dark:border-neutral-700"
      type="number"
      value={!amount && amount !== 0 ? "" : amount}
      onChange={(evt) => {
        const { value } = evt.target;
        setAmount(value ? parseFloat(value) : undefined);
      }}
      placeholder="0.005"
      step={1e-4}
      min={0}
      required
    />
  );
};
