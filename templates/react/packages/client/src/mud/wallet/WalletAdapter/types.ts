import { type Burner } from "../burner";

export type Status = "unselected" | "external" | "burner";
export type SetBurnerProps = { setBurner: (burner: Burner) => () => void };
