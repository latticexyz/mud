# Store Consumer Contracts

> :warning: **Important note: these contracts have not been audited yet, so any production use is discouraged for now.**

The `WorldConsumer` contract allows contracts that inherit from it to be registered as systems while also supporting functions that can be called from outside of the world `World`.
It initializes the store and also registers the provided namespace in the provided World. It provides the `onlyWorld` and `onlyNamespace` modifiers, which can be used to restrict access to certain functions, only allowing calls that come from the world.

For examples of how it can be used in practice you can check the [examples directory](./src/examples/) and our [ERC20 World Module](../world-module-erc20/).
