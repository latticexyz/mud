// TODO: move to external exports once we're ready

export type { EntryKitConfigInput } from "../config/input";
export type { EntryKitConfig } from "../config/output";
export { defineConfig } from "../config/defineConfig";

export type { ConnectedClient, SessionClient } from "../common";
export { EntryKitProvider } from "../EntryKitProvider";
export { useEntryKitConfig } from "../EntryKitConfigProvider";
export { AccountButton } from "../AccountButton";
export { useAccountModal } from "../useAccountModal";
export { useSessionClientReady as useSessionClient } from "../useSessionClientReady";
export { createWagmiConfig, type CreateWagmiConfigOptions } from "../createWagmiConfig";

// And some additional internal things
export * from "../passkey/passkeyWallet";
export * from "../passkey/passkeyConnector";
export * from "../getConnectors";
export * from "../getWallets";
