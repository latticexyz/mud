import { bench } from "@ark/attest";
import { setup } from "./mud/setup";

bench("bench type", async () => {
  const mud = await setup();
  console.log(mud);
}).types([1, "instantiations"]);
