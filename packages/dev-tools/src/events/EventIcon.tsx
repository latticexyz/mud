import { StoreEvent } from "../useStore";
import { exhaustiveCheck } from "../exhaustiveCheck";

type Props = {
  eventName: StoreEvent["event"];
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
      return exhaustiveCheck(eventName, `Unexpected event name: ${eventName}`);
  }
}
