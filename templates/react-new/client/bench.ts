import { bench } from "@ark/attest";
import { DozerSyncFilter, selectFrom } from "@latticexyz/store-sync/dozer";
import mudConfig from "../mud.config";
import { createStore } from "@latticexyz/stash/internal";
import { sync } from "./sync";

bench("sync", async () => {
  const dozerUrl = "https://redstone2.dozer.skystrife.xyz/q";
  const storeAddress = "0x9d05cc196c87104a7196fcca41280729b505dbbf";
  const yesterday = Date.now() / 1000 - 24 * 60 * 60;
  const filters: DozerSyncFilter[] = [
    selectFrom({
      table: mudConfig.tables.MatchSky,
      where: `"createdAt" > ${yesterday}`,
    }),
  ];
  const store = createStore(mudConfig);

  await sync({ dozerUrl, storeAddress, filters, store });

  console.log("Done syncing");
  console.log("store", Object.values(store.getState().records[""].MatchSky));
}).types([8201, "instantiations"]);
