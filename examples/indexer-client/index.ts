import { createIndexerClient } from "@latticexyz/store-sync/trpc-indexer";
const indexer = createIndexerClient({
  url: "http://127.0.0.1:3001/trpc",
});

const result = await indexer.findAll.query({
  chainId: 31337,
  address: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
});

console.log(`Block number: ${result.blockNumber}`);

console.log(`Tables: ${result.tables.map((t) => t.name)}`);

const counterTable = result.tables.filter((t) => t.name == "Counter")[0];
console.log("Information about Counter");
console.log(counterTable);

console.log(`The actual value: ${counterTable.records[0].value.value}`);
