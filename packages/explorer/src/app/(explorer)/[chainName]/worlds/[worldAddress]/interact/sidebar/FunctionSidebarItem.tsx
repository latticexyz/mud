import { CoinsIcon, EyeIcon, SendIcon } from "lucide-react";
import { AbiFunction } from "viem";
import { ScrollIntoViewLink } from "../../../../../components/ScrollIntoViewLink";
import { getFunctionElementId } from "../../../../../utils/getFunctionElementId";

type FunctionNavItemProps = {
  abi: AbiFunction;
  systemId: string | undefined;
};

export function FunctionSidebarItem({ abi, systemId }: FunctionNavItemProps) {
  return (
    <li>
      <ScrollIntoViewLink
        elementId={getFunctionElementId(abi, systemId)}
        className="whitespace-nowrap text-sm hover:text-orange-500 hover:underline"
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
