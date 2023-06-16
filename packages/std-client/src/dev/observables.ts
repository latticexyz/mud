import { Abi } from "abitype";
import { BehaviorSubject } from "rxjs";

export const worldAbi$ = new BehaviorSubject<Abi | null>(null);
