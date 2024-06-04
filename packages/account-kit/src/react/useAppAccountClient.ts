import { useStore } from "zustand";
import { useAccountKitInstance } from "./AccountKitProvider";
import { ExternalState } from "../global/createExternalStore";

export function useAppAccountClient(): ExternalState["appAccountClient"] {
  const accountKit = useAccountKitInstance();
  const appAccountClient = useStore(accountKit.store, (state) => state.appAccountClient);
  return appAccountClient;
}
