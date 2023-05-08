import { Abi } from "abitype";
import { BehaviorSubject } from "rxjs";

export const worldAbiObservable = new BehaviorSubject<Abi | null>(null);
