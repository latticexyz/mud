---
"@latticexyz/world": major
---
All `World` methods now revert if the `World` calls itself.
The `World` should never need to call itself, since all internal table operations are done as library calls, and all root system operations are done as delegate call to the system contract.
It should not be possible to make the `World` call itself as an external actor.
If it were possible to make the `World` call itself, it would be possible to write to internal tables that only the `World` should have access to.
As this is a very important invariance, we decided to codify it in an explicit requirement check in every `World` method, instead of just relying on making it impossible to trigger the `World` to call itself.
