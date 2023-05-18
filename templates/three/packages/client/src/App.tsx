import { useEntityQuery } from "@latticexyz/react";
import { useMUD } from "./MUDContext";
import { Has } from "@latticexyz/recs";

export const App = () => {
  const {
    components: { Position },
    systemCalls: { move },
  } = useMUD();

  const positions = useEntityQuery([Has(Position)]);

  return (
    <>
      <div>
        Number of positions: <span>{positions?.length ?? "??"}</span>
      </div>
      <button
        type="button"
        onClick={async (event) => {
          event.preventDefault();
          await move(0, 0, 1);
        }}
      >
        Move
      </button>
    </>
  );
};
