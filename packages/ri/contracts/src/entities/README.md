# Entities

This folder is where one would register entities into the ECS system by calling library functions from ContentLib.

## Architecture

- Use `UsingAppStorage` to get access to the app storage, and the utils in ContentLib to register add entities to the World.
- Inherit `IContentCreator` and expose a `createContent` function.
- Import the contract in the deploy script, deploy it, and pass its address to `registerContentCreatorExternally` to instantiate the contents using a `delegatecall`.
