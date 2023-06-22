import { BehaviorSubject } from "rxjs";
import { DatabaseClient } from "../types";
import { StoreConfig } from "@latticexyz/store";

export const storeCacheClient$ = new BehaviorSubject<DatabaseClient<StoreConfig> | null>(null);
