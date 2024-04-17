export type AmountProps = {
  amount: string | undefined;
  setAmount: (amount: string) => void;
};

export const AmountInput = ({ amount, setAmount }: AmountProps) => {
  return (
    <input
      className="w-full px-[16px] border border-neutral-300"
      type="number"
      value={amount}
      onChange={(evt) => setAmount(evt.target.value)}
      placeholder="0.01"
      step={1e-18}
    />
  );
};
