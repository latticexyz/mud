---
order: 10
---

# Getting started

## Quickstart

Let's create our first MUD project!

Run the following command in the console of your choice to create a new MUD project in `my-project` using the `minimal` template.

```shell
npx @latticexyz/cli create my-project --template minimal
```

Next, run `yarn dev` in the root directory of your new project to start the development server (web client and local Ethereum node).

```shell
yarn dev
```

![Starting a new MUD project with the MUD cli](/public/mud-create.gif)

The minimal MUD project template is organized as a yarn monorepo.
You can find the contract code in `packages/contracts` and then minimal client setup in `packages/client`.

```
$ tree . -d -L 4
.
└── packages
    ├── client
    │   └── src
    └── contracts
        └── src
            ├── components
            ├── libraries
            ├── systems
            └── test

9 directories
```

## Contracts

Contracts are structured in a [forge](https://getfoundry.sh/) compatible Solidity project.
Naming and code organization follows conventions, which allows MUD tools to automate much of the deployment process and improve the development experience.

### Components

Component definitions are placed in `src/components`.
As a convention, each component must be kept in its own file, with the file name corresponding to the name of the component contract inside the file.
Additionally, the file and contract name must follow the schema `<NAME>Component`.
Besides the component contract, the file must include the component's `ID` as a constant.

**Example**: `CounterComponent.sol`

```solidity
// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "std-contracts/components/Uint32Component.sol";

uint256 constant ID = uint256(keccak256("component.Counter"));

contract CounterComponent is Uint32Component {
  constructor(address world) Uint32Component(world, ID) {}
}

```

### Systems

Systems are placed in `src/systems`.
Similar to components, each system must be kept in its own file, with the file name corresponding to the name of the system contract inside the file.
File and contract names must follow the schema `<NAME>System`, and the file must include the system's `ID` as constant.

When using the `mud deploy-contracts --dev --watch` cli command, the MUD cli watches for changes in system files (and imported libraries) and automatically upgrades the relevant systems if necessary.

**Example**: `IncrementSystem.sol`

```solidity
// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { System, IWorld } from "solecs/System.sol";
import { getAddressById } from "solecs/utils.sol";
import { CounterComponent, ID as CounterComponentID } from "components/CounterComponent.sol";
import { LibMath } from "libraries/LibMath.sol";

uint256 constant ID = uint256(keccak256("system.Increment"));

contract IncrementSystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  function execute(bytes memory arguments) public returns (bytes memory) {
    uint256 entity = abi.decode(arguments, (uint256));
    CounterComponent c = CounterComponent(getAddressById(components, CounterComponentID));
    LibMath.increment(c, entity);
  }
}

```

### Libraries

[Libraries](https://docs.soliditylang.org/en/v0.8.17/introduction-to-smart-contracts.html?highlight=libraries#delegatecall-and-libraries) can be used to split up code into reusable packets.
They are placed in `src/libraries`.

All code in libraries is executed in the context of the calling contract (because they are inlined or delegate called), so component write access control needs to happen at the level of systems.

**Example**: `LibMath.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { Uint32Component } from "std-contracts/components/Uint32Component.sol";

library LibMath {
  function increment(Uint32Component component, uint256 entity) internal {
    uint32 current = component.has(entity) ? component.getValue(entity) : 0;
    component.set(entity, current + 10);
  }
}

```

### Deployment

Deployment configuration lives in `deploy.json`.
It contains the list of components and systems to deploy, and which systems needs write access to which systems.

This file is the source of truth for MUD's deployment tools.
If a component or system is not included, it is not deployed, even if it is placed in the `components` or `systems` directory.

**Example**: `deploy.json`

```json
{
  "components": ["CounterComponent"],
  "systems": [
    {
      "name": "IncrementSystem",
      "writeAccess": ["CounterComponent"]
    }
  ]
}
```

### Tests

MUD uses `forge` for Solidity testing.
Test files are placed in `src/tests`.

To take full advantage of MUD's deployment setup in tests, they must extend `MudTest` (imported from `@latticexyz/std-contracts/test/MudTest.t.sol`).

Head over to the forge documentation for more details on [how to write tests with forge](https://book.getfoundry.sh/forge/writing-tests).

**Example**: `Deploy.t.sol`

```solidity
// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Deploy } from "./Deploy.sol";
import "std-contracts/test/MudTest.t.sol";

contract DeployTest is MudTest {
  constructor() MudTest(new Deploy()) {}

  function testDeploy() public view {
    console.log(deployer);
  }
}

```

### Development

To start a local Ethereum node, run `yarn devnode` at the root of the contracts directory.
This starts a local `anvil` instance with 1 second blocktime.
For more information about anvil, head over to the [anvil documentation](https://book.getfoundry.sh/anvil/).

To deploy the contracts to the local node, run `yarn dev` from the root of the contracts directory (which calls `mud deploy-contracts --dev --watch` under the hood).
After deploying, it will set up a watcher to detect file changes in system files or libraries and automatically redeploy impacted systems.

## Client

## Demo
