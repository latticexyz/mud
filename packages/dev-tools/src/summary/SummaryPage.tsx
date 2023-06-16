import { NetworkSummary } from "./NetworkSummary";
import { AccountSummary } from "./AccountSummary";
import { EventsSummary } from "./EventsSummary";
import { ActionsSummary } from "./ActionsSummary";
import { TablesSummary } from "./TablesSummary";
import packageJson from "../../package.json";

const isLinked = Object.entries(packageJson.dependencies).some(
  ([name, version]) => name.startsWith("@latticexyz/") && version.startsWith("link:")
);

export function SummaryPage() {
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
        <div className="space-y-2">
          <h1 className="font-bold text-white/40 uppercase text-xs">Tables</h1>
          <TablesSummary />
        </div>
      </div>
      <div className="p-2 text-right font-mono text-xs leading-none text-white/20">
        MUD {isLinked ? <>v{packageJson.version}</> : <>linked</>}
      </div>
    </div>
  );
}
