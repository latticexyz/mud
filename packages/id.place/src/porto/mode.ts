import { Dialog, Mode } from "porto";
import { popupUrl } from "../common";

export function mode({ host = popupUrl }: { host?: string } = {}): Mode.Mode {
  return Mode.dialog({
    host,
    renderer: Dialog.popup({
      size: { width: 400, height: 400 },
    }),
  });
}
