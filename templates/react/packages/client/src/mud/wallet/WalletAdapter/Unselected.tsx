import { type Status } from "./types";

export function Unselected(props: { setStatus: (status: Status) => void }) {
  return (
    <div>
      <button onClick={() => props.setStatus("external")}>Use external wallet (with burner delegation)</button>
      {import.meta.env.DEV && <button onClick={() => props.setStatus("burner")}>Use burner wallet</button>}
    </div>
  );
}
