import { assertExhaustive } from "@latticexyz/common/utils";
import { StorageAdapterLog } from "@latticexyz/store-sync";

type Props = {
  type: StorageAdapterLog["eventName"];
};

export function EventIcon({ type }: Props) {
  switch (type) {
    case "Store_SetRecord":
      return <span className="text-green-500 font-bold">=</span>;
    case "Store_SpliceStaticData":
    case "Store_SpliceDynamicData":
      return <span className="text-cyan-500 font-bold">+</span>;
    case "Store_DeleteRecord":
      return <span className="text-red-500 font-bold">-</span>;
    default:
      return assertExhaustive(type, `Unexpected event type: ${type}`);
  }
}
