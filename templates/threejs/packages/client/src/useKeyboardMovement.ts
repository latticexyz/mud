import { useEffect } from "react";
import { useMUD } from "./MUDContext";

export const useKeyboardMovement = () => {
  const {
    systemCalls: { moveBy },
  } = useMUD();

  useEffect(() => {
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
  }, [moveBy]);
};
