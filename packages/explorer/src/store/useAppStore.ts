import { useStore } from "zustand";
import { useContext } from "react";
import { AppStoreContext } from "./AppStoreProvider";

export const useAppStore = () => {
  const appStoreContext = useContext(AppStoreContext);

  if (!appStoreContext) {
    throw new Error(`useAppStore must be used within AppStoreProvider`);
  }

  return useStore(appStoreContext);
};
