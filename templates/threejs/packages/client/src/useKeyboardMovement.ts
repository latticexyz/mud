import { useEffect } from "react";
import { useMUD } from "./MUDContext";

export const useKeyboardMovement = () => {
  const {
    systemCalls: { moveBy },
  } = useMUD();

  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (e.key === "w") {
        moveBy(1, 0, 0);
      }
      if (e.key === "s") {
        moveBy(-1, 0, 0);
      }
      if (e.key === "a") {
        moveBy(0, 0, -1);
      }
      if (e.key === "d") {
        moveBy(0, 0, 1);
      }
      if (e.key === "t") {
        moveBy(0, 1, 0);
      }
      if (e.key === "g") {
        moveBy(0, -1, 0);
      }
    };

    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [moveBy]);
};
