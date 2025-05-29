import { CoinsIcon, EyeIcon, SendIcon } from "lucide-react";
import { toFunctionHash } from "viem";
import { AbiFunction } from "viem";
import { cn } from "../../../../../../../utils";
import { ScrollIntoViewLink } from "../../../../../components/ScrollIntoViewLink";
import { useHashState } from "../../../../../hooks/useHashState";

type FunctionNavItemProps = {
  abi: AbiFunction;
};

export function FunctionSidebarItem({ abi }: FunctionNavItemProps) {
  const [functionHash] = useHashState();
  return (
    <li>
      <ScrollIntoViewLink
        elementId={toFunctionHash(abi)}
        className={cn(
          "whitespace-nowrap text-sm hover:text-orange-500 hover:underline",
          functionHash === toFunctionHash(abi) ? "text-orange-500" : null,
        )}
      >
        <span className="opacity-50">
          {abi.stateMutability === "payable" && <CoinsIcon className="mr-2 inline-block h-4 w-4" />}
          {(abi.stateMutability === "view" || abi.stateMutability === "pure") && (
            <EyeIcon className="mr-2 inline-block h-4 w-4" />
          )}
          {abi.stateMutability === "nonpayable" && <SendIcon className="mr-2 inline-block h-4 w-4" />}
        </span>
        <span>{abi.name}</span>
        {abi.inputs.length > 0 && <span className="opacity-50"> ({abi.inputs.length})</span>}
      </ScrollIntoViewLink>
    </li>
  );
}
