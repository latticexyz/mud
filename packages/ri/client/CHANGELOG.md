# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# 0.1.0 (2022-05-23)

### Bug Fixes

- **ri-client:** fix assuming component value is not undefined when using updateQuery ([f93ee23](https://github.com/latticexyz/mud/commit/f93ee233d1a2d4a1ef38d946cc241cc75b81e5a9))
- **ri-client:** integrate client with new contract-side component ids ([78bbdfb](https://github.com/latticexyz/mud/commit/78bbdfb87f7e19964550315696fba080a2056ab8))
- **ri-client:** type game contracts using combined facet abi ([6bc48a8](https://github.com/latticexyz/mud/commit/6bc48a89dfe9058b5505fcc07aedaf476fae1477))

### Features

- **ri-client:** add client reference implementation ([10a33cb](https://github.com/latticexyz/mud/commit/10a33cba983fb56e23af3d1baf68ceafb5325503))

### Performance Improvements

- **ri-client:** throttle ECS event processing to 12000 per second ([88726ec](https://github.com/latticexyz/mud/commit/88726ec559ff5707b84f2eae1d570510fb3ae358))
- **ri-client:** use json rpc provider to send transactions and load block events ([2455aeb](https://github.com/latticexyz/mud/commit/2455aebca5c021c5b9dfa9227be85d2497eb5df9))
