import { bench } from "@ark/attest";
import { setup } from "./mud/setup";

bench("bench type", () => {
  setup();
}).types([1188939, "instantiations"]);
