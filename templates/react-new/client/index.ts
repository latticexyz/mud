import { DozerSyncFilter, selectFrom } from "@latticexyz/store-sync/dozer";
import mudConfig from "../mud.config";
import { sync } from "./sync";
import { createStore } from "@latticexyz/stash/internal";

async function main() {
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

  console.log("query", filters);
  await sync({ dozerUrl, storeAddress, filters, store });

  console.log("Done syncing");
  console.log("store", Object.values(store.getState().records[""].MatchSky));
}

main();
