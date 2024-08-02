import { bench } from "@ark/attest";
import { setup } from "./mud/setup";

bench("bench type", () => {
  setup();
}).types([280386, "instantiations"]);
