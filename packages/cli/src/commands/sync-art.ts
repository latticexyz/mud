import { Arguments, CommandBuilder } from "yargs";
import { exec } from "../utils";

type Options = {
  repo: string;
  commitHash?: string;
};

export const command = "sync-art <repo>";
export const desc = "Syncs art from a MUD-compatible art repo, found in <repo>";

export const builder: CommandBuilder<Options, Options> = (yargs) =>
  yargs.positional("repo", { type: "string", demandOption: true }).options({
    commitHash: { type: "string" },
  });

export const handler = async (argv: Arguments<Options>): Promise<void> => {
  const { repo, commitHash } = argv;
  console.log("Syncing art repo from", repo);
  const clean = await exec(`git diff --quiet --exit-code`);
  if (clean !== 0) {
    console.log("Directory is not clean! Please git add and commit");
    process.exit(0);
  }

  console.log("Cloning...");
  await exec(`git clone ${repo} _artmudtemp`);
  if (commitHash) {
    await exec(`cd _artmudtemp && git reset --hard ${commitHash} && cd -`);
  }

  console.log("Moving atlases...");
  await exec(`cp -r _artmudtemp/atlases src/public`);

  console.log("Moving tilesets...");
  await exec(`cp -r _artmudtemp/tilesets src/layers/Renderer/assets`);

  console.log("Moving tileset types...");
  await exec(`cp -r _artmudtemp/types/ src/layers/Renderer/Phaser/tilesets/`);

  console.log("Cleaning up...");
  await exec(`rm -rf _artmudtemp`);

  console.log("Committing...");
  await exec(`git add src/public && git add src/layers/Renderer && git commit -m "feat(art): adding art from ${repo}"`);
  process.exit(0);
};
