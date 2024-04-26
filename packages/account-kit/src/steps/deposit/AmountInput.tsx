import { formatEther, parseEther } from "viem";
import { Input } from "../../ui/Input";
import { twMerge } from "tailwind-merge";

export type Props = {
  initialAmount: bigint | undefined;
  onChange: (value: bigint | undefined) => void;
};

export const AmountInput = ({ initialAmount, onChange }: Props) => {
  return (
    <Input asChild className="w-full cursor-text flex items-center">
      <label>
        <input
          className={twMerge(
            "peer flex-grow outline-none bg-transparent",
            "placeholder:text-neutral-400",
            "dark:placeholder:text-neutral-500",
          )}
          placeholder="0.005"
          required
          autoFocus
          defaultValue={initialAmount == null ? "" : formatEther(initialAmount)}
          onChange={(event) => {
            const input = event.currentTarget;
            if (input.value.trim() === "") {
              input.setCustomValidity("");
              onChange(undefined);
              return;
            }

            const value = input.value.trim().replace(/\.$/, ".0");
            if (!/^\d*(\.\d+)?$/.test(value)) {
              return input.setCustomValidity("Invalid amount.");
            }

            input.setCustomValidity("");
            onChange(parseEther(value));
          }}
        />
        <span
          className={twMerge(
            "flex-shrink-0",
            "peer-placeholder-shown:text-neutral-400",
            "dark:peer-placeholder-shown:text-neutral-500",
          )}
        >
          Ξ
        </span>
      </label>
    </Input>
  );
};
