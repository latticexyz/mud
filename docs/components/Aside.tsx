import { ReactNode } from "react";

type Props = {
  emoji?: string;
  children: ReactNode;
};

export function Aside({ emoji, children }: Props) {
  return (
    <aside
      style={{ padding: "1em", border: "2px dashed rgba(128, 128, 128, .3)", borderRadius: "1em", margin: "1em 0" }}
    >
      {emoji ? (
        <div style={{ display: "grid", gridTemplateColumns: "max-content 1fr", gap: "0.75em" }}>
          <div style={{ fontSize: "1.5em", marginLeft: "-.25em" }}>{emoji}</div>
          <div>{children}</div>
        </div>
      ) : (
        <>{children}</>
      )}
    </aside>
  );
}
