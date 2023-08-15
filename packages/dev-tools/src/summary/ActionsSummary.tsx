import { NavButton } from "../NavButton";
import { useDevToolsContext } from "../DevToolsContext";
import { WriteSummary } from "../actions/WriteSummary";

export function ActionsSummary() {
  const { writes } = useDevToolsContext();

  return (
    <>
      {writes.length ? (
        <>
          <div className="space-y-1">
            {writes.slice(-5).map((write) => (
              <WriteSummary key={write.id} write={write} />
            ))}
          </div>
          <NavButton to="/actions" className="block w-full bg-white/5 hover:bg-blue-700 hover:text-white">
            See more
          </NavButton>
        </>
      ) : (
        <div>Waiting for transactions…</div>
      )}
    </>
  );
}
