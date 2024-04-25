import { NetworkSummary } from "./NetworkSummary";
import { AccountSummary } from "./AccountSummary";
import { EventsSummary } from "./EventsSummary";
import { ActionsSummary } from "./ActionsSummary";
import { TablesSummary } from "./TablesSummary";
import { ComponentsSummary } from "./ComponentsSummary";
import packageJson from "../../package.json";
import { useDevToolsContext } from "../DevToolsContext";

const isLinked = Object.entries(packageJson.dependencies).some(
  ([name, version]) => name.startsWith("@latticexyz/") && version.startsWith("link:")
);

export function SummaryPage() {
  const { recsWorld, useStore } = useDevToolsContext();
  return (
    <div className="h-full flex flex-col">
      <div className="flex-grow p-6 space-y-8 relative">
        <div className="space-y-2">
          <h1 className="font-bold text-white/40 uppercase text-xs">Network</h1>
          <NetworkSummary />
        </div>
        <div className="space-y-2">
          <h1 className="font-bold text-white/40 uppercase text-xs">Account</h1>
          <AccountSummary />
        </div>
        <div className="space-y-2">
          <h1 className="font-bold text-white/40 uppercase text-xs">Recent actions</h1>
          <ActionsSummary />
        </div>
        <div className="space-y-1">
          <h1 className="font-bold text-white/40 uppercase text-xs">Recent store events</h1>
          <EventsSummary />
        </div>
        {useStore ? (
          <div className="space-y-2">
            <h1 className="font-bold text-white/40 uppercase text-xs">Tables</h1>
            <TablesSummary />
          </div>
        ) : null}
        {recsWorld ? (
          <div className="space-y-2">
            <h1 className="font-bold text-white/40 uppercase text-xs">Components</h1>
            <ComponentsSummary world={recsWorld} />
          </div>
        ) : null}
      </div>
      <div className="p-2 text-right font-mono text-xs leading-none text-white/20">
        MUD {isLinked ? <>v{packageJson.version}</> : <>linked</>}
      </div>
    </div>
  );
}
