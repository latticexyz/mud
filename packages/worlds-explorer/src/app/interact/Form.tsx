"use client";

import { Abi, AbiFunction } from "viem";
import { FunctionField } from "./FunctionField";
import { useHashState } from "@/hooks/useHash";
import { cn } from "@/lib/utils";

type Props = {
  data: {
    abi: Abi;
  };
};

export function Form({ data }: Props) {
  const [hash] = useHashState();

  return (
    <div className="flex">
      <div className="w-[300px]">
        <div className="sticky top-0">
          <h4 className="font-semibold py-4 uppercase opacity-70 text-xs">Jump to:</h4>
          <ul className="space-y-2">
            {data.abi.map((abi, idx) => {
              return (
                <li key={idx}>
                  <a
                    href={`#${(abi as AbiFunction).name}`}
                    className={cn("text-sm hover:underline hover:text-orange-500", {
                      "text-orange-500": hash === (abi as AbiFunction).name,
                    })}
                  >
                    {(abi as AbiFunction).name}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="border-l pl-4">
        {data.abi.map((abi, idx) => {
          return <FunctionField key={idx} abi={abi as AbiFunction} />;
        })}
      </div>
    </div>
  );
}
