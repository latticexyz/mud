import { mode, popupUrl, porto as portoConnector } from "@latticexyz/id/internal";

export function porto() {
  return portoConnector({
    mode: mode({
      host: import.meta.env.PROD ? popupUrl : popupUrl.replace("https://id.place/", "https://id.smartpass.dev/"),
    }),
  });
}
