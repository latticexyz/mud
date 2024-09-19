---
"@latticexyz/cli": patch
---

Significantly improved the deployment performance for large projects with public libraries by implementing a more efficient algorithm to resolve public libraries during deployment.
The local deployment time on a large reference project was reduced from over 10 minutes to 4 seconds.
