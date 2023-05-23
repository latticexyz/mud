import { NetworkSummary } from "./NetworkSummary";
import { AccountSummary } from "./AccountSummary";
import { EventsSummary } from "./EventsSummary";
import { ActionsSummary } from "./ActionsSummary";
import { TablesSummary } from "./TablesSummary";

export function SummaryPage() {
  return (
    <>
      <div className="p-6 space-y-8">
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
    </>
  );
}
