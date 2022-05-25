# Mud

Mud is a toolkit for building on-chain worlds

### How to start a new Mud project

1. Get a verson of forge that supports `forge script` (update your forge to use this PR: https://github.com/foundry-rs/foundry/pull/1208 by running `foundryup --pr 1208`)
2. Add the Github package registry: `npm login --scope=@latticexyz --registry=https://npm.pkg.github.com`
3. Bootstrap a new mud project: `npx @latticexyz/cli create <project>`. This will create a new mud project in `./<project>`, so make sure you're not in some other project.

Steps 1 and 2 are only for the initial setup. Next time you want to set up a new mud project, just run step 3.
