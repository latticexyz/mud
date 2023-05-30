import { getComponentValue } from "@latticexyz/recs";
import { useEffect } from "react";
import { useMUD } from "./MUDContext";

export const useKeyboardMovement = () => {
  const {
    components: { Position },
    network: {
      worldSend,
      network: { signer },
      playerEntity,
    },
  } = useMUD();

  useEffect(() => {
    const moveTo = async (x: number, y: number, z: number) => {
      const s = signer.get();
      if (!s) throw new Error("No signer");

      const txResult = await worldSend("move", [x, y, z]);
      await txResult.wait();
    };

    const moveBy = async (deltaX: number, deltaY: number, deltaZ: number) => {
      if (playerEntity) {
        const playerPosition = getComponentValue(Position, playerEntity);

        if (playerPosition) {
          await moveTo(playerPosition.x + deltaX, playerPosition.y + deltaY, playerPosition.z + deltaZ);
        } else {
          await moveTo(deltaX, deltaY, deltaZ);
        }
      }
    };

    const listener = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") {
        moveBy(1, 0, 0);
      }
      if (e.key === "ArrowDown") {
        moveBy(-1, 0, 0);
      }
      if (e.key === "ArrowLeft") {
        moveBy(0, 0, -1);
      }
      if (e.key === "ArrowRight") {
        moveBy(0, 0, 1);
      }
      if (e.key === " ") {
        moveBy(0, 1, 0);
      }
      if (e.ctrlKey) {
        moveBy(0, -1, 0);
      }
    };

    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [Position, playerEntity, signer, worldSend]);
};
