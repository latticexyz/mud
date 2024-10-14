import { useStore } from "zustand";
import { useContext } from "react";
import { WorldStoreContext } from "./WorldStoreProvider";

export const useWorldStore = () => {
  const worldStoreContext = useContext(WorldStoreContext);

  if (!worldStoreContext) {
    throw new Error(`useWorldStore must be used within WorldStoreProvider`);
  }

  return useStore(worldStoreContext);
};
