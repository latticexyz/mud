import { useEffect } from "react";
import { Direction } from "../common";

const keys = new Map<KeyboardEvent["key"], Direction>([
  ["ArrowUp", "North"],
  ["ArrowRight", "East"],
  ["ArrowDown", "South"],
  ["ArrowLeft", "West"],
]);

export const useKeyboardMovement = (move: undefined | ((direction: Direction) => void)) => {
  useEffect(() => {
    if (!move) return;

    const listener = (event: KeyboardEvent) => {
      const direction = keys.get(event.key);
      if (direction == null) return;

      event.preventDefault();
      move(direction);
    };

    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [move]);
};
