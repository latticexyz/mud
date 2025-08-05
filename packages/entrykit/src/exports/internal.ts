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
export { getDefaultConnectors, type GetDefaultConnectorsOptions } from "../getDefaultConnectors";
export { withFeeCache } from "../utils/withFeeCache";

// And some additional internal things
export * from "../validateSigner";
export * from "../useFunds";
export { createBundlerClient } from "../createBundlerClient";
export { getBundlerTransport } from "../getBundlerTransport";
export { defineCall } from "../utils/defineCall";
