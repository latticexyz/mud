import { useEffect } from "react";
import { useNetwork } from "../../NetworkContext";
import { createBurner } from "../createBurner";
import { type SetBurnerProps } from "../types";

// Sets a burner without using an external wallet. No user interaction is involved.
export function StandaloneBurner({ setBurner }: SetBurnerProps) {
  const network = useNetwork();

  useEffect(() => setBurner(createBurner(network)), [setBurner, network]);

  return null;
}
