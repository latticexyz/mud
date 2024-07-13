import ReactDOM from "react-dom";
import { useStore } from "zustand";
import { internalStore } from "./internalStore";
import { AccountButton } from "../AccountButton";

export function Buttons() {
  // TODO: do we need to assign IDs to these for `key`?
  const containers = useStore(internalStore, (state) => state.buttonContainers);
  return <>{containers.map((container) => ReactDOM.createPortal(<AccountButton />, container))}</>;
}
