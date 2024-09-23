import { type ReactNode } from "react";
import { AccountModal } from "./AccountModal";
import { Config } from "./config";
import { EntryConfigProvider } from "./EntryConfigProvider";

// We separate the config provider and wrap it here to always include the modal.
// We could do this in EntryConfigProvider directly, but it mucks with hot
// reloading in development and this approach lets us work around it more easily.

export type Props = {
  config: Config;
  children?: ReactNode;
};

export function EntryProvider({ config, children }: Props) {
  return (
    <EntryConfigProvider config={config}>
      {children}
      <AccountModal />
    </EntryConfigProvider>
  );
}
