import { useMemo } from "react";
import { twMerge } from "tailwind-merge";
import * as Select from "@radix-ui/react-select";
import { useFrame } from "../../ui/FrameProvider";
import { useAccount, useChains } from "wagmi";
import { useTheme } from "../../useTheme";
import { ChevronUpIcon } from "../../icons/ChevronUpIcon";
import { ChevronDownIcon } from "../../icons/ChevronDownIcon";
import { Input } from "../../ui/Input";
import { ChainBalance } from "./ChainBalance";
import { ChainIcon } from "./ChainIcon";
import { useRelay } from "./useRelay";

export type Props = {
  value: number;
  onChange: (value: number) => void;
};

export function ChainSelect({ value, onChange }: Props) {
  const theme = useTheme();
  const { frame } = useFrame();
  const userAccount = useAccount();

  const chains = useChains();
  const relay = useRelay();
  const relayChains = relay.data?.chains;

  const sourceChains = useMemo(() => {
    return chains
      .map((sourceChain) => {
        const relayChain = relayChains?.find((c) => c.id === sourceChain.id);
        return {
          ...sourceChain,
          relayChain,
        };
      })
      .filter((c) => c.relayChain);
  }, [chains, relayChains]);

  const selectedChain = sourceChains.find((c) => c.id === value)!;

  return (
    <Select.Root
      value={value.toString()}
      onValueChange={(value) => {
        // TODO: figure out why onValueChange triggers twice, once with value and once without
        if (value) {
          const chain = sourceChains.find((chain) => chain.id.toString() === value);
          if (!chain) throw new Error(`Unknown chain selected: ${value}`);
          onChange(chain.id);
        }
      }}
    >
      <Input asChild>
        <Select.Trigger className="group inline-flex items-center justify-center">
          <Select.Value asChild>
            <ChainIcon
              id={selectedChain?.id}
              name={selectedChain?.name}
              // TODO: define our own set of icons for each chain
              url={selectedChain?.relayChain?.icon?.[theme]}
              className="w-8"
            />
          </Select.Value>
          <Select.Icon asChild>
            <>
              <ChevronDownIcon className="text-sm -mr-1 group-aria-expanded:hidden" />
              <ChevronUpIcon className="text-sm -mr-1 hidden group-aria-expanded:inline" />
            </>
          </Select.Icon>
        </Select.Trigger>
      </Input>

      {frame.contentDocument ? (
        <Select.Portal container={frame.contentDocument.body}>
          {/* TODO: hardcoded width */}
          <Select.Content position="popper" className="w-[352px] mt-1 animate-in fade-in slide-in-from-top-2">
            <Select.Viewport>
              <Select.Group
                className={twMerge(
                  "flex flex-col border divide-y",
                  "bg-neutral-100 text-neutral-700 border-neutral-300 divide-neutral-300",
                  "dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700 dark:divide-neutral-700",
                )}
              >
                {sourceChains.map((chain) => (
                  // TODO: figure out why up/down arrow jump to top/bottom rather than cycling through items
                  <Select.Item
                    key={chain.id}
                    value={chain.id.toString()}
                    className={twMerge(
                      "group flex p-2.5 gap-2.5 items-center cursor-pointer outline-none",
                      // TODO: different style for checked/active state
                      "text-black focus:bg-white data-[state=checked]:bg-neutral-200",
                      "dark:text-white dark:focus:bg-neutral-700 dark:data-[state=checked]:bg-neutral-900",
                    )}
                  >
                    <ChainIcon id={chain.id} name={chain.name} url={chain.relayChain?.icon?.[theme]} />
                    <span className="flex-grow flex-shrink-0">{chain.name}</span>
                    <span className="flex-shrink-0 font-mono text-sm text-neutral-500 dark:text-neutral-400">
                      <ChainBalance chainId={chain.id} address={userAccount.address} />
                    </span>
                  </Select.Item>
                ))}
              </Select.Group>
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      ) : null}
    </Select.Root>
  );
}
