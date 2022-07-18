import { boot } from "./boot";
import { Main } from "./Main";

export type EmberWindow = Awaited<ReturnType<typeof boot>>;

export type Main = Awaited<ReturnType<typeof Main>>;

export type Game = { main: Main };
