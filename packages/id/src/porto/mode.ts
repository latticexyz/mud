import { Mode } from "porto";
import { popupUrl } from "../common";
import { popup } from "./popup";

export function mode({ host = popupUrl }: { host?: string } = {}): Mode.Mode {
  return Mode.dialog({ host, renderer: popup() });
}
