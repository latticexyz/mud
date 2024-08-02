import { bench } from "@ark/attest";
import { setup } from "./mud/setup";

bench("bench type", () => {
  setup();
}).types([584636, "instantiations"]);
