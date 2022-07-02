import { useContext } from "react";
import { StoreContext } from "../Store";

export function useStore() {
  return useContext(StoreContext);
}
