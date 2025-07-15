import { Mode, RpcSchema } from "porto";
import { popupUrl } from "../rp/common";
import { popup } from "./popup";

export function mode(): Mode.Mode {
  return Mode.dialog({
    host: popupUrl,
    renderer: popup(),
  });
}
