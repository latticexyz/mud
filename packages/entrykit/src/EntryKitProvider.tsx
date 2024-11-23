import { type ReactNode } from "react";
import { AccountModal } from "./AccountModal";
import { EntryKitConfig } from "./config/output";
import { EntryKitConfigProvider } from "./EntryKitConfigProvider";

// We separate the config provider and wrap it here to always include the modal.
// We could do this in EntryKitConfigProvider directly, but it mucks with hot
// reloading in development and this approach lets us work around it more easily.

export type Props = {
  config: EntryKitConfig;
  children?: ReactNode;
};

export function EntryKitProvider({ config, children }: Props) {
  return (
    <EntryKitConfigProvider config={config}>
      {children}
      <AccountModal />
    </EntryKitConfigProvider>
  );
}
