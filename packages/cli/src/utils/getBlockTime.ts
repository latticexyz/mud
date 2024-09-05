export async function getBlockTime(rpc: string): Promise<number> {
  async function getBlock(blockNumber: number | string) {
    const response = await fetch(rpc, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_getBlockByNumber",
        params: [blockNumber, false],
        id: 1,
      }),
    });
    const data = await response.json();
    console.log("got block", data);
    return data.result;
  }

  // Get the latest block
  const latestBlock = await getBlock("latest");
  const latestBlockNumber = parseInt(latestBlock.number, 16);
  const latestBlockTimestamp = parseInt(latestBlock.timestamp, 16);

  // Get the previous block
  const previousBlock = await getBlock(latestBlockNumber - 1);
  const previousBlockTimestamp = parseInt(previousBlock.timestamp, 16);

  // Calculate the block time
  const blockTime = latestBlockTimestamp - previousBlockTimestamp;

  console.log(`Current block time: ${blockTime} seconds`);
  console.log(`Latest block number: ${latestBlockNumber}`);
  console.log(`Latest block timestamp: ${latestBlockTimestamp}`);
  console.log(`Previous block timestamp: ${previousBlockTimestamp}`);

  return blockTime;
}
