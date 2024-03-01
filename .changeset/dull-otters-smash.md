---
"@latticexyz/world-modules": patch
---

ERC20 and ERC721 implementations now always register the token namespace, instead of checking if it has already been registered. This prevents issues with registering the namespace beforehand, namely that only the owner of a system can create a puppet for it.
