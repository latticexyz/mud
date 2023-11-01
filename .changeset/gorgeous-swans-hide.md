---
"@latticexyz/world-modules": minor
---

Added the `ERC721Module` to `@latticexyz/world-modules`.
This module allows the registration of `ERC721` tokens in an existing World.

Important note: this module has not been audited yet, so any production use is discouraged for now.

````solidity
import { PuppetModule } from "@latticexyz/world-modules/src/modules/puppet/PuppetModule.sol";
import { ERC721MetadataData } from "@latticexyz/world-modules/src/modules/erc721-puppet/tables/ERC721Metadata.sol";
import { IERC721Mintable } from "@latticexyz/world-modules/src/modules/erc721-puppet/IERC721Mintable.sol";
import { registerERC721 } from "@latticexyz/world-modules/src/modules/erc721-puppet/registerERC721.sol";

// The ERC721 module requires the Puppet module to be installed first
world.installModule(new PuppetModule(), new bytes(0));

// After the Puppet module is installed, new ERC721 tokens can be registered
IERC721Mintable token = registerERC721(world, "myERC721", ERC721MetadataData({ name: "Token", symbol: "TKN", baseURI: "" }));```
````
