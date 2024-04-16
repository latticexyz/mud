import { ReactNode, Ref, forwardRef } from "react";
import { formatEther, parseEther } from "viem";
import { twMerge } from "tailwind-merge";
import { AccountModalSection } from "../../AccountModalSection";
import { useAccount, useConfig as useWagmiConfig, useWriteContract } from "wagmi";
import GasTankAbi from "@latticexyz/gas-tank/out/IWorld.sol/IWorld.abi.json";
import * as Select from "@radix-ui/react-select";
import { useConfig } from "../../AccountKitProvider";
import { getGasTankBalanceQueryKey } from "../../useGasTankBalance";
import { waitForTransactionReceipt } from "wagmi/actions";
import { useQueryClient } from "@tanstack/react-query";
import { useOnboardingSteps } from "../../useOnboardingSteps";
import { Button } from "../../ui/Button";
import { Shadow } from "../../ui/Shadow";

type SelectItemProps = {
  value: string;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
};

type AmountProps = {
  amount: bigint;
  setAmount: (amount: bigint) => void;
};

const AmountInput = ({ amount, setAmount }: AmountProps) => {
  return (
    <input
      className="w-full px-[16px] border border-neutral-300"
      type="number"
      value={formatEther(amount)}
      onChange={(evt) => setAmount(parseEther(evt.target.value))}
      step={0.000000000000000001}
    />
  );
};

const SelectItem = forwardRef<HTMLDivElement, SelectItemProps>(function SelectItem(
  { children, className, ...props },
  forwardedRef,
) {
  return (
    <Select.Item
      className={twMerge(
        "text-[13px] leading-none text-violet11 rounded-[3px] flex items-center",
        "h-[25px] pr-[35px] pl-[25px] relative select-none data-[disabled]:text-mauve8",
        "data-[disabled]:pointer-events-none data-[highlighted]:outline-none",
        "data-[highlighted]:bg-violet9 data-[highlighted]:text-violet1",
        className,
      )}
      ref={forwardedRef as Ref<HTMLDivElement>}
      {...props}
    >
      <Select.ItemText>{children}</Select.ItemText>
      <Select.ItemIndicator className="absolute left-0 w-[25px] inline-flex items-center justify-center">
        {/* <CheckIcon /> */}
        CheckIcon
      </Select.ItemIndicator>
    </Select.Item>
  );
});

function ChainSelect() {
  return (
    <Select.Root defaultValue="17069">
      <Select.Trigger
        className={twMerge(
          "inline-flex items-center justify-center h-[50px] w-[70px]",
          "text-[13px] leading-none gap-[5px]",
          "bg-white",
          "border border-neutral-300",
          "outline-none",
        )}
        aria-label="Food"
      >
        <Shadow>
          <Select.Value placeholder="Chain" />
          <Select.Icon>{/* <ChevronDownIcon /> */}</Select.Icon>
        </Shadow>
      </Select.Trigger>

      <Select.Portal>
        <Shadow>
          <Select.Content className="overflow-hidden bg-white rounded-md shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)]">
            <Select.ScrollUpButton className="flex items-center justify-center h-[25px] bg-white text-violet11 cursor-default">
              {/* <ChevronUpIcon /> */}
              Up
            </Select.ScrollUpButton>
            <Select.Viewport className="p-[5px]">
              <Select.Group>
                <Select.Label className="px-[25px] text-xs leading-[25px]">Select chain:</Select.Label>
                <SelectItem value="17069">Redstone</SelectItem>
                <SelectItem value="1">Ethereum</SelectItem>
                <SelectItem value="7777777">Zora</SelectItem>
              </Select.Group>
            </Select.Viewport>
            <Select.ScrollDownButton className="flex items-center justify-center h-[25px] bg-white text-violet11 cursor-default">
              {/* <ChevronDownIcon /> */}
              Down
            </Select.ScrollDownButton>
          </Select.Content>
        </Shadow>
      </Select.Portal>
    </Select.Root>
  );
}

type DirectDepositContentProps = {
  amount: bigint | null;
  setAmount: (amount: bigint) => void;
};

export function DirectDepositContent({ amount = BigInt(0), setAmount }: DirectDepositContentProps) {
  const queryClient = useQueryClient();
  const wagmiConfig = useWagmiConfig();
  const { chain, gasTankAddress } = useConfig();
  const { resetStep } = useOnboardingSteps();
  const userAccount = useAccount();
  const userAccountAddress = userAccount.address;
  const { writeContractAsync, isPending, error } = useWriteContract({
    mutation: {
      onSuccess: async (hash) => {
        const receipt = await waitForTransactionReceipt(wagmiConfig, { hash });
        if (receipt.status === "success") {
          queryClient.invalidateQueries({
            queryKey: getGasTankBalanceQueryKey({ chainId: chain.id, gasTankAddress, userAccountAddress }),
          });
          resetStep();
        }
      },
    },
  });

  const handleDeposit = async () => {
    if (!userAccountAddress) return;

    await writeContractAsync({
      chainId: chain.id,
      address: gasTankAddress,
      abi: GasTankAbi,
      functionName: "depositTo",
      args: [userAccountAddress],
      value: parseEther(amount.toString()),
    });
  };

  return (
    <AccountModalSection>
      <div className="flex flex-col gap-2">
        {error ? <div>{String(error)}</div> : null}

        <div className="flex gap-[12px]">
          <ChainSelect />
          <AmountInput amount={amount} setAmount={setAmount} />
        </div>

        <div>
          <ul>
            <li className="flex justify-between py-[8px] border-b border-black border-opacity-10">
              <span className="opacity-50">Available to deposit</span>
              <span className="font-medium">
                {parseEther(amount.toString()).toString()} ETH <span className="text-neutral-800">($3,605.21)</span>
              </span>
            </li>
            <li className="flex justify-between py-[8px] border-b border-black border-opacity-10">
              <span className="opacity-50">Estimated fee</span>
              <span className="font-medium">
                0.025 ETH <span className="text-neutral-800">($3.40)</span>
              </span>
            </li>
            <li className="flex justify-between py-[8px]">
              <span className="opacity-50">Transfer time</span>
              <span className="font-medium">~5 seconds</span>
            </li>
          </ul>
        </div>

        <Button className="w-full" pending={!userAccountAddress || isPending} onClick={handleDeposit}>
          Deposit
        </Button>
      </div>
    </AccountModalSection>
  );
}
