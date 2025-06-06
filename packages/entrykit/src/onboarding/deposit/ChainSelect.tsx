import { useEffect, useMemo } from "react";
import { Chain } from "viem";
import { useSwitchChain } from "wagmi";
import { twMerge } from "tailwind-merge";
import * as Select from "@radix-ui/react-select";
import { RelayChain } from "@reservoir0x/relay-sdk";
import { useFrame } from "../../ui/FrameProvider";
import { useTheme } from "../../useTheme";
import { ChevronUpIcon } from "../../icons/ChevronUpIcon";
import { ChevronDownIcon } from "../../icons/ChevronDownIcon";
import { Input } from "../../ui/Input";
import { ChainIcon } from "./ChainIcon";
import { useRelay } from "./useRelay";
import { useShowQueryError } from "../../errors/useShowQueryError";
import { useChainBalances } from "./useChainBalances";
import { Balance } from "../../ui/Balance";
import { PendingIcon } from "../../icons/PendingIcon";

export type ChainWithRelay = Chain & {
  relayChain?: RelayChain & {
    icon?: Record<string, string>;
  };
};

export type Props = {
  value: number;
  onChange: (value: number) => void;
};

export function ChainSelect({ value, onChange }: Props) {
  const theme = useTheme();
  const { frame } = useFrame();
  const { chains, switchChain } = useSwitchChain();
  const relay = useRelay();
  const relayChains = relay.data?.chains;

  const sourceChains = useMemo(() => {
    return chains
      .map((sourceChain) => {
        const relayChain = relayChains?.find((c) => c.id === sourceChain.id);
        return {
          ...sourceChain,
          relayChain,
        } satisfies ChainWithRelay;
      })
      .filter((c) => c.relayChain);
  }, [chains, relayChains]);

  const selectedChain = sourceChains.find((c) => c.id === value)!;
  const { data: chainsBalances, isLoading } = useShowQueryError(useChainBalances({ chains: sourceChains }));

  const chainsWithBalance = useMemo(() => {
    if (!chainsBalances) return [];
    return chainsBalances.filter(({ balance }) => balance.value > 0n).map(({ chain }) => chain);
  }, [chainsBalances]);

  useEffect(() => {
    if (
      chainsWithBalance.length > 0 &&
      (!selectedChain || !chainsWithBalance.find((c) => c.id === selectedChain?.id))
    ) {
      const defaultChain = chainsWithBalance[0];
      onChange(defaultChain.id);
      switchChain({ chainId: defaultChain.id });
    }
  }, [value, selectedChain, chainsWithBalance, onChange, switchChain]);

  return (
    <Select.Root
      value={value.toString()}
      onValueChange={(value) => {
        if (value) {
          const chain = chainsWithBalance.find((chain) => chain.id.toString() === value);
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
          <Select.Content
            position="popper"
            className="w-[352px] max-h-[230px] overflow-y-auto mt-1 animate-in fade-in slide-in-from-top-2"
          >
            <Select.Viewport>
              <Select.Group
                className={twMerge(
                  "flex flex-col border divide-y",
                  "bg-neutral-800 text-neutral-300 border-neutral-700 divide-neutral-700",
                )}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center p-4">
                    <PendingIcon className="h-6 w-6 animate-spin text-gray-400" />
                  </div>
                ) : (
                  [...(chainsWithBalance.length > 0 ? chainsWithBalance : sourceChains)].map((chain) => {
                    const balance = chainsBalances?.find((cb) => cb.chain.id === chain.id)?.balance;
                    return (
                      <Select.Item
                        key={chain.id}
                        value={chain.id.toString()}
                        className={twMerge(
                          "group flex p-2.5 gap-2.5 items-center cursor-pointer outline-none",
                          "text-white focus:bg-neutral-700 data-[state=checked]:bg-neutral-900",
                        )}
                      >
                        <ChainIcon id={chain.id} name={chain.name} url={chain.relayChain?.icon?.[theme]} />
                        <span className="flex-grow flex-shrink-0">{chain.name}</span>
                        <span className="flex-shrink-0 font-mono text-sm text-neutral-400">
                          <Balance wei={balance?.value ?? 0n} />
                        </span>
                      </Select.Item>
                    );
                  })
                )}
              </Select.Group>
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      ) : null}
    </Select.Root>
  );
}
