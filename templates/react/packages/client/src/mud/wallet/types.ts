import { type Burner } from "./createBurner";

export type WalletManagerState = "unset" | "external-with-delegated-burner" | "standalone-burner";
export type SetBurnerProps = { setBurner: (burner: Burner) => () => void };
