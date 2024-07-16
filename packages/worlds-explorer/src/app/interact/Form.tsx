"use client";

import { Abi, AbiFunction } from "viem";
import { FunctionField } from "./FunctionField";

type Props = {
  data: {
    abi: Abi;
  };
};

export function Form({ data }: Props) {
  return (
    <>
      <h1 className="text-4xl font-bold py-4">Interact</h1>

      {data.abi.map((item, idx) => {
        return <FunctionField key={idx} data={item as AbiFunction} />;
      })}
    </>
  );
}
