import { useAccount, useBalance, useSwitchChain } from "wagmi";
import { Button, type Props as ButtonProps } from "../../ui/Button";
import { twMerge } from "tailwind-merge";
import { parseEther } from "viem";

export type Props = Omit<ButtonProps, "type"> & {
  amount?: bigint | undefined;
  chainId?: number | undefined;
};

const MAX_DEPOSIT_AMOUNT = "0.1";

export function SubmitButton({ amount, chainId, className, ...buttonProps }: Props) {
  const { chainId: userChainId, address: userAddress } = useAccount();
  const { data: userBalance } = useBalance({ address: userAddress });
  const shouldSwitchChain = chainId != null && chainId !== userChainId;
  const switchChain = useSwitchChain();

  if (shouldSwitchChain) {
    return (
      <Button
        type="button"
        className={twMerge("w-full", className)}
        pending={switchChain.isPending}
        onClick={() => switchChain.switchChain({ chainId })}
      >
        Switch chain
      </Button>
    );
  } else if (amount) {
    if (amount > parseEther(MAX_DEPOSIT_AMOUNT)) {
      return (
        <Button type="button" className={twMerge("w-full", className)} disabled>
          Max amount is {MAX_DEPOSIT_AMOUNT} ETH
        </Button>
      );
    } else if (amount > (userBalance?.value ?? 0n)) {
      return (
        <Button type="button" className={twMerge("w-full", className)} disabled>
          Insufficient balance
        </Button>
      );
    }
  }

  console.log("buttonProps", buttonProps);

  return <Button type="submit" className={twMerge("w-full", className)} {...buttonProps} />;
}
