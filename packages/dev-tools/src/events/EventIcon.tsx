import { assertExhaustive } from "@latticexyz/common/utils";
import { StorageAdapterLog } from "@latticexyz/store-sync";

type Props = {
  type: StorageAdapterLog["eventName"];
};

export function EventIcon({ type }: Props) {
  switch (type) {
    case "StoreSetRecord":
      return <span className="text-green-500 font-bold">=</span>;
    case "StoreSpliceRecord":
      return <span className="text-cyan-500 font-bold">+</span>;
    case "StoreDeleteRecord":
      return <span className="text-red-500 font-bold">-</span>;
    case "StoreEphemeralRecord":
      return <span className="text-violet-400 font-bold">~</span>;
    default:
      return assertExhaustive(type, `Unexpected event type: ${type}`);
  }
}
