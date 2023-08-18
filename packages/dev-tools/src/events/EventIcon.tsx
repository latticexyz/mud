import { assertExhaustive } from "@latticexyz/common/utils";
import { StoreConfig } from "@latticexyz/store";
import { StorageOperation } from "@latticexyz/store-sync";

type Props = {
  type: StorageOperation<StoreConfig>["type"];
};

export function EventIcon({ type }: Props) {
  switch (type) {
    case "SetRecord":
      return <span className="text-green-500 font-bold">=</span>;
    case "SetField":
      return <span className="text-cyan-500 font-bold">+</span>;
    case "DeleteRecord":
      return <span className="text-red-500 font-bold">-</span>;
    // case "EphemeralRecord":
    //   return <span className="text-violet-400 font-bold">~</span>;
    default:
      return assertExhaustive(type, `Unexpected storage operation type: ${type}`);
  }
}
