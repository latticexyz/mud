import chalk from "chalk";

export function printMUD() {
  console.log(
    chalk.yellow(`
.------..------..------.
|M.--. ||U.--. ||D.--. |
| (\\/) || (\\/) || :/\\: |
| :\\/: || :\\/: || (__) |
| '--'M|| '--'U|| '--'D|
'------''------''------'
`)
  );
}
