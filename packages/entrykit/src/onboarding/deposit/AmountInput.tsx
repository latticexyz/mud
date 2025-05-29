import { formatEther, parseEther } from "viem";
import { Input } from "../../ui/Input";
import { twMerge } from "tailwind-merge";
import { forwardRef } from "react";
import { EthIcon } from "../../icons/EthIcon";

export type Props = {
  initialAmount: bigint | undefined;
  onChange: (value: bigint | undefined) => void;
};

export const AmountInput = forwardRef<HTMLInputElement, Props>(function AmountInput(
  { initialAmount, onChange },
  forwardedRef,
) {
  return (
    <Input asChild className="w-full cursor-text flex items-center">
      <label>
        <input
          ref={forwardedRef}
          className={twMerge("peer flex-grow outline-none bg-transparent", "placeholder:text-neutral-500")}
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
        <span className={twMerge("flex-shrink-0 text-2xl", "peer-placeholder-shown:text-neutral-500")}>
          <EthIcon />
        </span>
      </label>
    </Input>
  );
});
