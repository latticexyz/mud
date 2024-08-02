"use client";

import { Coins, Eye, Send } from "lucide-react";
import { Abi, AbiFunction } from "viem";
import { useDeferredValue, useState } from "react";
import { Input } from "@/components/ui/input";
import { useHashState } from "@/hooks/useHash";
import { cn } from "@/lib/utils";
import { FunctionField } from "./FunctionField";

type Props = {
  data: {
    abi: Abi;
  };
};

export function Form({ data }: Props) {
  const [hash] = useHashState();
  const [filterValue, setFilterValue] = useState("");
  const deferredFilterValue = useDeferredValue(filterValue);
  const abiFunctions = data.abi.filter(
    (abi) => (abi as AbiFunction).type === "function",
  );
  const filteredFunctions = abiFunctions.filter((abi) => {
    return (abi as AbiFunction).name
      .toLowerCase()
      .includes(deferredFilterValue.toLowerCase());
  });

  return (
    <div className="flex">
      <div className="w-[350px]">
        <div className="sticky top-16 pr-4">
          <h4 className="py-4 text-xs font-semibold uppercase opacity-70">
            Jump to:
          </h4>

          <Input
            type="text"
            placeholder="Filter functions..."
            value={deferredFilterValue}
            onChange={(evt) => {
              setFilterValue(evt.target.value);
            }}
          />

          <ul
            className="mt-4 max-h-max space-y-2 overflow-y-auto pb-4"
            style={{
              maxHeight: "calc(100vh - 160px)",
            }}
          >
            {filteredFunctions.map((abi, idx) => {
              if ((abi as AbiFunction).type !== "function") {
                return null;
              }

              return (
                <li key={idx}>
                  <a
                    href={`#${(abi as AbiFunction).name}`}
                    className={cn(
                      "whitespace-nowrap text-sm hover:text-orange-500 hover:underline",
                      {
                        "text-orange-500": hash === (abi as AbiFunction).name,
                      },
                    )}
                  >
                    <span className="opacity-50">
                      {abi.stateMutability === "payable" && (
                        <Coins className="mr-2 inline-block h-4 w-4" />
                      )}
                      {(abi.stateMutability === "view" ||
                        abi.stateMutability === "pure") && (
                        <Eye className="mr-2 inline-block h-4 w-4" />
                      )}
                      {abi.stateMutability === "nonpayable" && (
                        <Send className="mr-2 inline-block h-4 w-4" />
                      )}
                    </span>

                    <span>{(abi as AbiFunction).name}</span>
                    {abi.inputs.length > 0 && (
                      <span className="opacity-50"> ({abi.inputs.length})</span>
                    )}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="border-l pl-4">
        {filteredFunctions.map((abi) => {
          return (
            <FunctionField key={JSON.stringify(abi)} abi={abi as AbiFunction} />
          );
        })}
      </div>
    </div>
  );
}
