"use client";

import { Abi, AbiFunction } from "viem";
import { FunctionField } from "./FunctionField";
import { useHashState } from "@/hooks/useHash";
import { cn } from "@/lib/utils";
import { Coins, Eye, Send } from "lucide-react";

type Props = {
  data: {
    abi: Abi;
  };
};

export function Form({ data }: Props) {
  const [hash] = useHashState();
  const abiFunctions = data.abi.filter((abi) => (abi as AbiFunction).type === "function");

  return (
    <div className="flex">
      <div className="w-[350px]">
        <div className="sticky top-16">
          <h4 className="font-semibold py-4 uppercase opacity-70 text-xs">Jump to:</h4>
          <ul
            className="space-y-2 max-h-max overflow-y-auto pb-4"
            style={{
              maxHeight: "calc(100vh - 115px)",
            }}
          >
            {abiFunctions.map((abi, idx) => {
              if ((abi as AbiFunction).type !== "function") {
                return null;
              }

              return (
                <li key={idx}>
                  <a
                    href={`#${(abi as AbiFunction).name}`}
                    className={cn("text-sm hover:underline hover:text-orange-500 whitespace-nowrap", {
                      "text-orange-500": hash === (abi as AbiFunction).name,
                    })}
                  >
                    <span className="opacity-50">
                      {abi.stateMutability === "payable" && <Coins className="mr-2 inline-block h-4 w-4" />}
                      {(abi.stateMutability === "view" || abi.stateMutability === "pure") && (
                        <Eye className="mr-2 inline-block h-4 w-4" />
                      )}
                      {abi.stateMutability === "nonpayable" && <Send className="mr-2 inline-block h-4 w-4" />}
                    </span>

                    <span>{(abi as AbiFunction).name}</span>
                    {abi.inputs.length > 0 && <span className="opacity-50"> ({abi.inputs.length})</span>}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="border-l pl-4">
        {abiFunctions.map((abi, idx) => {
          return <FunctionField key={idx} abi={abi as AbiFunction} />;
        })}
      </div>
    </div>
  );
}
