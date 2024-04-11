import { type WalletManagerState } from "../types";

type Props = {
  setState: (status: WalletManagerState) => void;
};

// Allows a user to select either external-with-delegated-burner or standalone-burner.
// standalone-burner is only available in development mode.
export function Unset({ setState }: Props) {
  return (
    <div>
      {import.meta.env.DEV && <button onClick={() => setState("standalone-burner")}>Use burner account</button>}
      <button onClick={() => setState("external-with-delegated-burner")}>
        Use external wallet with delegated burner account
      </button>
    </div>
  );
}
