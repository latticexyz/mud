import { Outlet, useNavigate, useParams } from "react-router-dom";
import { NavButton } from "../NavButton";
import { useTables } from "./useTables";
import { useEffect, useRef } from "react";
import { twMerge } from "tailwind-merge";

export function StoreDataPage() {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const tables = useTables();
  const { table: tableParam } = useParams();

  // TODO: lift up selected component so we can remember previous selection between tab nav
  const { tableId: selectedTableId, component: selectedComponent } =
    tables.find(({ component }) => component === tableParam) ?? {};
  const navigate = useNavigate();

  useEffect(() => {
    if (tables.length && !selectedComponent) {
      navigate(tables[0].component);
    }
  }, [tables, selectedComponent]);

  useEffect(() => {
    const listener = (event: MouseEvent) => {
      if (!detailsRef.current) return;
      if (event.target instanceof Node && detailsRef.current.contains(event.target)) return;
      detailsRef.current.open = false;
    };
    window.addEventListener("click", listener);
    return () => window.removeEventListener("click", listener);
  });

  return (
    <div className="p-6 space-y-4">
      {!tables.length ? (
        <>Waiting for tables…</>
      ) : (
        <div className="space-y-2">
          <h1 className="font-bold text-white/40 uppercase text-xs">Table</h1>

          <details ref={detailsRef} className="pointer-events-none select-none">
            <summary className="group pointer-events-auto cursor-pointer inline-flex">
              <span className="inline-flex gap-2 px-3 py-2 items-center border-2 border-white/10 rounded group-hover:border-blue-700 group-hover:bg-blue-700 group-hover:text-white">
                {selectedTableId ? (
                  <span className="font-mono">
                    {selectedTableId.namespace}:{selectedTableId.name}
                  </span>
                ) : (
                  <span>Pick a table…</span>
                )}
                <span className="text-white/40 text-xs">▼</span>
              </span>
            </summary>
            <div className="relative">
              <div className="pointer-events-auto absolute top-1 left-0 z-20 bg-slate-700 rounded shadow-lg flex flex-col py-1.5 font-mono text-xs leading-none">
                {tables.map(({ component, tableId }) => (
                  <NavButton
                    className={twMerge(
                      "px-2 py-1.5 text-left hover:bg-blue-700 hover:text-white",
                      component === selectedComponent ? "bg-slate-600" : null
                    )}
                    key={component}
                    to={component}
                    onClick={() => {
                      if (detailsRef.current) {
                        detailsRef.current.open = false;
                      }
                    }}
                  >
                    {tableId.namespace}:{tableId.name}
                  </NavButton>
                ))}
              </div>
            </div>
          </details>
        </div>
      )}
      <Outlet />
    </div>
  );
}
