# ERC20 World Module

## ERC20 contracts

In order to achieve a similar level of composability to `Openzeppelin` ERC20 contract extensions, we provide a way to abstract the underlying Store being used. This allows developers to easily create ERC20 tokens that can either use its own storage as the Store, or attach themselves to an existing World.

- `StoreConsumer`: all contracts inherit from `StoreConsumer`, which abstracts the way in which `ResourceId`s are encoded. This allows us to have composable contracts whose implementations don't depend on the type of Store being used.
- `WithStore(address) is StoreConsumer`: this contract initializes the store, using the contract's internal storage or the provided external `Store`. It encodes `ResourceId`s using `ResourceIdLib` from the `@latticexyz/store` package.
- `WithWorld(IBaseWorld, bytes14) is WithStore`: initializes the store and also registers the provided namespace in the provided World. It encodes `ResourceId`s using `WorldResourceIdLib` (using the namespace). It also provides an `onlyNamespace` modifier, which can be used to restrict access to certain functions, only allowing calls from addresses that have access to the namespace.

- `MUDERC20`: base ERC20 implementation adapted from Openzeppelin's ERC20. Contains the ERC20 logic, reads/writes to the store through MUD's codegen libraries and initializes the tables it needs. As these libraries use `StoreSwitch` internally, this contract doesn't need to know about the store it's interacting with (it can be internal storage, an external `Store` or a `World`).

- Extensions and other contracts: contracts like `Ownable`, `Pausable`, `ERC20Burnable`, etc are adapted from `Openzeppelin` contracts to use MUD's codegen libraries to read and write from a `Store`. They inherit from `StoreConsumer`, so they can obtain the `ResourceId` for the tables they use using `_encodeResourceId()`.

### Example 1: Using the contract's storage

By using `WithStore(address(this))` as the first contract that the implementation inherits from, it allows all the other contracts in the inheritance list to use the contract's storage as a `Store`.

```solidity
contract ERC20WithInternalStore is WithStore(address(this)), MUDERC20, ERC20Pausable, ERC20Burnable, Ownable {
  constructor() MUDERC20("MyERC20", "MTK") Ownable(_msgSender()) {}

  function mint() public onlyOwner {
    _mint(to, value);
  }

  function pause() public onlyOwner {
    _pause();
  }

  function unpause() public onlyOwner {
    _unpause();
  }

  // The following functions are overrides required by Solidity.

  function _update(address from, address to, uint256 value) internal override(MUDERC20, ERC20Pausable) {
    super._update(from, to, value);
  }
}
```

### Example 2: Using a World as an external Store and registering a new Namespace

The `WithWorld` contract internally points the `StoreSwitch` to the provided World and attempts to register the provided namespace. It allows the other contracts in the inheritance list to use the external World as a `Store`, using the provided namespace for all operations. Additionally, all functions that use the `onlyNamespace` modifier can only be called by addresses that have access to the namespace.

```solidity
contract ERC20WithWorld is WithWorld, MUDERC20, ERC20Pausable, ERC20Burnable {
  constructor(
    IBaseWorld world,
    bytes14 namespace,
    string memory name,
    string memory symbol
  ) WithWorld(world, namespace) MUDERC20(name, symbol) {
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

The ERC20Module receives the namespace, name and symbol of the token as parameters, and deploys the new token. Currently it installs a default ERC20 (`examples/ERC20WithWorld.sol`) with the following features:

- ERC20Burnable: Allows users to burn their tokens (or the ones approved to them) using the `burn` and `burnFrom` function.
- ERC20Pausable: Supports pausing and unpausing token operations. This is combined with the `pause` and `unpause` public functions that can be called by addresses with access to the token's namespace.
- Minting: Addresses with namespace access can call the `mint` function to mint tokens to any address.

## Installation

In your MUD config:

```
import { defineWorld } from "@latticexyz/world";
import { createModuleConfig } from "@latticexyz/world-module-erc20";



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
    createModuleConfig("erc20Namespace", "MyToken", "MTK"),
  ],
});
```

This will deploy the token and register the provided namespace.

In order to get the token's address in a script or system:

```
// Table Id of the ERC20Registry, under the `erc20-module` namespace
ResourceId erc20RegistryResource = WorldResourceIdLib.encode(RESOURCE_TABLE, "erc20-module", "ERC20_REGISTRY");

// Namespace where the token was installed
ResourceId namespaceResource = WorldResourceIdLib.encodeNamespace(bytes14("erc20Namespace"));


// Get the ERC-20 token address
address tokenAddress = ERC20Registry.getTokenAddress(erc20RegistryResource, namespaceResource);
```
