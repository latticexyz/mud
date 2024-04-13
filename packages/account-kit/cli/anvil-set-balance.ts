import { exec } from "child_process";

// Usage: `pnpm anvil-set-balance <receiver> <amount>`

const rpcUrl = "http://127.0.0.1:8545";
const receiver = process.argv[2];
const amount = process.argv[3] ?? "1ether";

exec(`cast rpc --rpc-url ${rpcUrl} anvil_setBalance ${receiver} $(cast to-unit ${amount} wei)`, (error, stdout) => {
  if (error) {
    console.error(`exec error: ${error}`);
    return;
  }
  if (stdout && stdout != "null\n") {
    console.log(`stdout: ${stdout}`);
  }
  console.log(`Set ${receiver} balance to ${amount}.`);
});
