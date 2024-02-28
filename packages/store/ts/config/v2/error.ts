import { Branded } from "./generics";

export type error<reason extends string = string> = Branded<`Error: ${reason}`, "Error">;
