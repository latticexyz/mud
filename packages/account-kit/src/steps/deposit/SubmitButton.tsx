import { useAccount, useSwitchChain } from "wagmi";
import { Button, type Props as ButtonProps } from "../../ui/Button";
import { twMerge } from "tailwind-merge";

export type Props = Omit<ButtonProps, "type"> & {
  sourceChainId: number;
};

export function SubmitButton({ sourceChainId, className, ...buttonProps }: Props) {
  const { chainId: userChainId } = useAccount();
  const shouldSwitchChain = userChainId !== sourceChainId;
  const switchChain = useSwitchChain();

  if (shouldSwitchChain) {
    return (
      <Button
        type="button"
        className={twMerge("w-full", className)}
        pending={switchChain.isPending}
        onClick={() => switchChain.switchChain({ chainId: sourceChainId })}
      >
        Switch chain
      </Button>
    );
  }

  return <Button type="submit" className={twMerge("w-full", className)} {...buttonProps} />;
}
