import { exec } from "child_process";

// Usage: `pnpm fund <receiver>`

const rpcUrl = "http://127.0.0.1:8545";
const receiver = process.argv[2];

exec(
  `cast rpc --rpc-url ${rpcUrl} anvil_setBalance ${receiver} $(cast to-unit 1ether wei)`,
  (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
    }
    if (stdout) {
      console.log(`stdout: ${stdout}`);
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`);
    }
  },
);
