import { Mode } from "porto";
import { popupUrl } from "../common";
import { popup } from "./popup";

export function mode(): Mode.Mode {
  return Mode.dialog({
    host: popupUrl,
    renderer: popup(),
  });
}
