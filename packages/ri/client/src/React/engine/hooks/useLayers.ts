import { useContext } from "react";
import { LayerContext } from "../context";

export function useGame() {
  return useContext(LayerContext);
}
