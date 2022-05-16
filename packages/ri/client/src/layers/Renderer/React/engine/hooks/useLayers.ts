import { useContext } from "react";
import { LayerContext } from "../context";

export function useLayers() {
  return useContext(LayerContext);
}
