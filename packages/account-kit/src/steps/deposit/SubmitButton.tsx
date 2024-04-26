import { useAccount, useSwitchChain } from "wagmi";
import { Button, type Props as ButtonProps } from "../../ui/Button";
import { twMerge } from "tailwind-merge";

export type Props = Omit<ButtonProps, "type"> & {
  chainId?: number | undefined;
};

export function SubmitButton({ chainId, className, ...buttonProps }: Props) {
  const { chainId: userChainId } = useAccount();
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
  }

  return <Button type="submit" className={twMerge("w-full", className)} {...buttonProps} />;
}
