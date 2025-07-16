# ERC20 World Module

> :warning: **Important note: this module has not been audited yet, so any production use is discouraged for now.**

## ERC20 contracts

In order to achieve a similar level of composability to [`OpenZeppelin` ERC20 contract extensions](https://docs.openzeppelin.com/contracts/5.x/api/token/erc20), we use our experimental [`WorldConsumer` contract](../world-consumer) to abstract the underlying World being used. This allows developers to easily create ERC20 tokens that attach themselves to an existing World.

The `MUDERC20` contract is the base ERC20 implementation adapted from Openzeppelin's ERC20. Contains the ERC20 logic, reads/writes to the world through MUD's codegen libraries and initializes the tables it needs.

Extensions and other contracts: contracts like `Ownable`, `Pausable`, `ERC20Burnable`, etc are adapted from `OpenZeppelin` contracts to use MUD's codegen libraries to read and write from a `Store`. They inherit from `WorldConsumer`, so they can obtain the `ResourceId` for the tables they use with `_encodeTableId()`.

### Example

The `WorldConsumer` (which `MUDERC20` inherits from) contract internally points the `StoreSwitch` to the provided World and attempts to register the provided namespace. It allows all the contracts in the inheritance list to consume the same World, using the provided namespace for all operations. Additionally, all functions that use the `onlyNamespace` modifier can only be called by addresses that have access to the namespace, by calling the token as a `System`.

```solidity
contract ERC20PausableBurnable is MUDERC20, ERC20Pausable, ERC20Burnable {
  constructor(
    IBaseWorld world,
    bytes14 namespace,
    string memory name,
    string memory symbol
  ) WorldConsumer(world, namespace, true) MUDERC20(name, symbol) {
    // transfer namespace ownership to the creator
    world.transferOwnership(getNamespaceId(), _msgSender());
  }

  function mint(address to, uint256 value) public onlyNamespace {
    _mint(to, value);
  }

  function pause() public onlyNamespace {
    _pause();
  }

  function unpause() public onlyNamespace {
    _unpause();
  }

  // The following functions are overrides required by Solidity.

  function _update(address from, address to, uint256 value) internal override(MUDERC20, ERC20Pausable) {
    super._update(from, to, value);
  }
}
```

# Module usage

The ERC20Module receives the namespace, name and symbol of the token as parameters, and deploys the new token. Currently it installs a default ERC20 (`examples/ERC20BurnablePausable.sol`) with the following features:

- ERC20Burnable: Allows users to burn their tokens (or the ones approved to them) using the `burn` and `burnFrom` function.
- ERC20Pausable: Supports pausing and unpausing token operations. This is combined with the `pause` and `unpause` public functions that can be called by addresses and systems with access to the token's namespace.
- Minting: Addresses and systems with namespace access can call the `mint` function to mint tokens to any address.

## Installation

In your MUD config:

```typescript
import { defineWorld } from "@latticexyz/world";
import { defineERC20Module } from "@latticexyz/world-module-erc20/internal";

export default defineWorld({
  namespace: "app",
  tables: {
    Counter: {
      schema: {
        value: "uint32",
      },
      key: [],
    },
  },
  modules: [
    defineERC20Module({
      namespace: "erc20Namespace",
      name: "MyToken",
      symbol: "MTK",
    }),
  ],
});
```

This will deploy the token and register the provided namespace.

In order to get the token's address in a script or system:

```solidity
// Table Id of the ERC20Registry, under the `erc20-module` namespace
ResourceId erc20RegistryResource = WorldResourceIdLib.encode(RESOURCE_TABLE, "erc20-module", "ERC20Registry");

// Namespace where the token was installed
ResourceId namespaceResource = WorldResourceIdLib.encodeNamespace(bytes14("erc20Namespace"));


// Get the ERC-20 token address
address tokenAddress = ERC20Registry.getTokenAddress(erc20RegistryResource, namespaceResource);
```
