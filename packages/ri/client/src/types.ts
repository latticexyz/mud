import { boot } from "./boot";
import { Main } from "./Main";

export type EmberWindow = Awaited<ReturnType<typeof boot>>;

export type Game = { current: Awaited<ReturnType<typeof Main>> };
