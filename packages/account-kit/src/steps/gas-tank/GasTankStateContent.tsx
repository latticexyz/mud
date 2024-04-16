import { GasTankIcon } from "../../icons/GasTankIcon";
import { useGasTankBalance } from "../../useGasTankBalance";

export function GasTankStateContent() {
  const gasTankBalance = useGasTankBalance();
  const estimateActions = BigInt(15000); // TODO: estimate gas tank actions

  return (
    <div className="flex flex-col gap-2 bg-neutral-200 p-5">
      <GasTankIcon />

      {!gasTankBalance || gasTankBalance === BigInt(0) ? (
        <p>Gas tank is empty</p>
      ) : (
        <>
          <p>Gas tank balance: {gasTankBalance.toString()}</p>
          <p>Estimated actions: ~{estimateActions.toString()}</p>
        </>
      )}
    </div>
  );
}
