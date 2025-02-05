# Store Consumer Contracts

> :warning: **Important note: these contracts have not been audited yet, so any production use is discouraged for now.**

This set of contracts provides an easy way to make use of a `Store` for read and write operations, with the possibility of fully abstracting away the type of underlying store being used.

- `StoreConsumer`: all contracts that don't explicitly need to know which type of store is being used can inherit from `StoreConsumer`, which abstracts the way in which `ResourceId`s are encoded. This allows us to have composable contracts whose implementations don't depend on the type of the underlying Store.
- `WithStore(address) is StoreConsumer`: this contract initializes the store, using the contract's internal storage or the provided external `Store`. It encodes `ResourceId`s using `ResourceIdLib` from the `@latticexyz/store` package.
- `WithWorld(IBaseWorld, bytes14) is WithStore`: initializes the store and also registers the provided namespace in the provided World. It encodes `ResourceId`s using `WorldResourceIdLib` (using the namespace). It also provides an `onlyNamespace` modifier, which can be used to restrict access to certain functions, only allowing calls from addresses that have access to the namespace.

For examples of how these are used in practice you can check the [examples directory](./src/examples/) or our [ERC20 World Module](../world-module-erc20/).
