import { useEffect } from "react";
import { useNetwork } from "../../NetworkContext";
import { createBurner } from "../burner";
import { type SetBurnerProps } from "./types";

export function Burner(props: SetBurnerProps) {
  const network = useNetwork();

  useEffect(() => props.setBurner(createBurner(network)), [network]);

  return null;
}
