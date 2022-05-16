# Embodied Systems

This folder is where one would register embodied systems.

Embodied systems are systems that are not called from the outside, and that specifically target a target entity from a source entity. If the target entity and the source entity are different, a path check algorithm is executed. It takes into account `Traversable` and `Mined` components on each tile. Optionally, a `MaxDistance` as well as a `IgnoreTraversability` component can be applied to the spell to further control the path checker.

## Architecture

- Use `UsingAppStorage` to get access to the app storage, and the utils in `EmbodiedSystemLib` to register embodied systems .
- Import the contract in the content creator that utilises this embodied systems, and refer to the selector you need.
- Import the contract in the `InitializeFacet`, and register it as an embodied system using `EmbodiedSystemLib`.
