import { useEffect } from "react";
import { AccountButton, useAccountModal } from "../src/exports";

export function App() {
  const { openAccountModal } = useAccountModal();

  useEffect(() => {
    openAccountModal();
  }, [openAccountModal]);

  return (
    <>
      <AccountButton />
    </>
  );
}
