import { assertExhaustive } from "@latticexyz/common/utils";
import { StoreEventsAbiItem } from "@latticexyz/store";

type Props = {
  eventName: StoreEventsAbiItem["name"];
};

export function EventIcon({ eventName }: Props) {
  switch (eventName) {
    case "StoreSetRecord":
      return <span className="text-green-500 font-bold">=</span>;
    case "StoreSetField":
      return <span className="text-cyan-500 font-bold">+</span>;
    case "StoreDeleteRecord":
      return <span className="text-red-500 font-bold">-</span>;
    case "StoreEphemeralRecord":
      return <span className="text-violet-400 font-bold">~</span>;
    default:
      return assertExhaustive(eventName, `Unexpected event name: ${eventName}`);
  }
}
