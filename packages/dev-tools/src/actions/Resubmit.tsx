import { useState } from "react";
import { SimulateContractReturnType } from "viem";
import { useDevToolsContext } from "../DevToolsContext";

interface ResubmitProps {
  requestData: SimulateContractReturnType["request"];
}

export function Resubmit({ requestData }: ResubmitProps) {
  const { worldWrite } = useDevToolsContext();

  const [args, setArgs] = useState<readonly unknown[] | undefined>(
    requestData.args
  );

  const handleChange = (e: {
    target: { dataset: { index: number }; value: string };
  }) => {
    const index = e.target.dataset.index;

    if (args) {
      setArgs((prevArgs) => [
        ...prevArgs!.slice(0, index),
        e.target.value,
        ...prevArgs!.slice(index + 1),
      ]);
    }
  };

  const handleSubmit = async () => {
    if (requestData.functionName) {
      await worldWrite[requestData.functionName](args);
    } else {
      await worldWrite[requestData.functionName](args);
    }
  };

  const handleRestore = () => {
    setArgs(requestData.args);
  };

  const argsTypes = (requestData.abi as any[]).find(
    (item) =>
      item.name == requestData.functionName &&
      item.inputs?.length == args?.length
  )?.inputs;

  console.log(argsTypes, "argsTypes");

  return (
    <div className="py-2 space-y-1">
      {argsTypes && (
        <>
          <div className="font-bold text-white/40 uppercase text-xs">Args</div>
          <table className="w-full table-fixed">
            <thead className="bg-slate-800 text-amber-200/80 text-left">
              <tr>
                {argsTypes.map((type: { name: any; type: any }) => (
                  <th className="font-semibold uppercase text-xs w-3/12">{`${type.name} (${type.type})`}</th>
                ))}
              </tr>
            </thead>
            <tbody className="font-mono text-xs">
              <tr>
                {argsTypes?.map((_: any, index: number) => {
                  return (
                    <td
                      key={index}
                      className="whitespace-nowrap overflow-hidden text-ellipsis"
                    >
                      <input
                        type="string"
                        value={args?.[index] as string | number}
                        onChange={handleChange as () => void}
                        data-index={index}
                        key={index}
                        className="bg-slate-800 rounded-md border-0 px-1 py-1 text-slate-300 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-gray-400 sm:text-sm sm:leading-6"
                      />
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </>
      )}
      <button
        type="button"
        onClick={handleSubmit}
        className="inline-block px-1 py-1 text-sm font-medium leading-none text-white bg-gray-700 rounded hover:bg-slate-500"
      >
        Resubmit
      </button>
      <button
        type="button"
        onClick={handleSubmit}
        className="ml-[50px] inline-block px-1 py-1 text-sm font-medium leading-none text-white bg-gray-700 rounded hover:bg-slate-500"
      >
        Recover
      </button>
    </div>
  );
}
