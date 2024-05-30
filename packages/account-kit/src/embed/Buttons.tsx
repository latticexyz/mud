import ReactDOM from "react-dom";
import { useStore } from "zustand";
import { AccountButton } from "../AccountButton";
import { InternalStore } from "./createInternalStore";

export type Props = {
  internalStore: InternalStore;
};

export function Buttons({ internalStore }: Props) {
  // TODO: do we need to assign IDs to these for `key`?
  const containers = useStore(internalStore, (state) => state.buttonContainers);
  return <>{containers.map((container) => ReactDOM.createPortal(<AccountButton />, container))}</>;
}
