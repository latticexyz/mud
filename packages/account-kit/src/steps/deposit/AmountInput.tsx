import { formatEther, parseEther } from "viem";
import { Input } from "../../ui/Input";

export type Props = {
  initialAmount: bigint | undefined;
  onChange: (value: bigint | undefined) => void;
};

export const AmountInput = ({ initialAmount, onChange }: Props) => {
  // TODO: add eth icon to the right of the text
  return (
    <Input
      className="w-full"
      placeholder="0.005"
      required
      defaultValue={initialAmount == null ? "" : formatEther(initialAmount)}
      onChange={(event) => {
        const input = event.currentTarget;
        const value = input.value.trim().replace(/\.$/, ".0");
        if (!/^\d*(\.\d+)?$/.test(value)) {
          return input.setCustomValidity("Invalid amount.");
        }
        input.setCustomValidity("");
        onChange(parseEther(value));
      }}
    />
  );
};
