import { Page } from "@playwright/test";
import { callWorld } from "./callWorld";

export async function push(page: Page, num: number) {
  await callWorld(page, "push", [num]);
}

export async function pushRange(page: Page, start: number, end: number) {
  await callWorld(page, "pushRange", [start, end]);
}

export async function pop(page: Page) {
  await callWorld(page, "pop");
}
