# What if

## Each token has its own namespace

- When registering a new token, the token is in a new namespace.
- The token contract gets `callFrom` access for the namespace
- The token forwards calls as the original caller

- Since `callFrom` namespace delegation is set up per namespace, there needs to be a separate system for each namespace

## One ERC20 namespace, tables are keyed by token

- All balances etc are stored in a single table, the ERC20System has access to this table
- The ERC20System mirrors the token methods, except there is an additional param to identify the token
- The Token contract can "call from", only if it's authorized (= it's the address for this ID)

- When setting up the proxy contract, it's initialized with an identifier (the ID that it uses to identify itself), a world address, and a system ID to call as implementation

- This pattern can be generalized to anything: the Proxy contract just forwards calls, the generic ProxyDelegationControl checks if the last piece of calldata matches the registry

- The proxy has an "emit" function, which let's the "world" emit anything

## Different namespace for each token table, single implementation system

- Puppets have a namespace
- The namespace includes the tables
- There is a single implementation system, which writes to the tables
- The implementation system implements the interface methods, but with an additional namespace param
- There is a mapping between puppet contract address and namespace
- The puppet contract passes its own namespace as parameter and calls via callFrom (passing the system), the puppet delegation control checks that the parameter is valid (by checking the puppet registry table)

Token

- The token implementation contract uses a NamespaceOwner check on the namespace to guard some of the methods (mint, burn)
- Actually why even have tables in its own namespace? They need to be modified via the token implementation in order to
  trigger the events anyway
- The token implementation needs to have access to the tables too.
- Advantage is the tables are cleaner. (also for indexers)
- Also we need a way to find the owner of a token for permissioned functions like mint and burn, so why not use namespace ownership

Advantage of a single system:

- easier to call inside the world than a system for each token, cheaper to deploy tokens too
- issue: who owns the erc20 implementation namespace? could be no-one, maybe that's good?
- feels weird to have to deploy the same logic over and over again?
- problem with upgrades of this central system: all the token namespaces had to give access to the system,
  this manual access is not automatically upgraded to the new system address if the system is upgraded
- if all access management is based on a token namespace (which includes the system, and the tables), that would be easier

Advantage of a system per token: hooks are simpler, the system itself implements the ERC20 interface.
But in order to know which tables it writes to the table would have to be initialized with a constant.
Or it could read from storage.
It would be possible to register function selectors for the erc20 on the world without having to pass the token id

Assuming there is one system per puppet namespace, the system could still infer its namespace without any args.
The puppet delegation control could be installed as a namespace delegation check.
The puppet delegation control would check the puppet registry for puppet address == this namespace's address
The System could call its puppet by checking the PuppetRegistry table.
What if you want multiple puppets per namespace?

- The mapping can be systemId (not namespace) -> puppet address
- One issue here is that it's not possible for a root system to find its own systemId because its address is the root address
- For delegation check we need either `namespace/systemId` -> `puppet address` or `puppet address` -> `namespace/systemId` (both work)
- For the callback we need `somethign accessible in the system, ie namespace` -> `puppet address`

- If it's namespace, there can only be one puppet per namespace
- If it's not namespace, there be one puppet per system id, but it wouldn't work in the root namespace. Maybe that's fine?

PuppetRegistry:
Puppet Address <> System ID

PuppetDelegationControl checks whether System ID == Puppet Address

PuppetRegistrationSystem
To register a new puppet in a namespace, need to be the namespace owner

Puppet:
Forwards calls to a given system (can be in its constructor)
Has an "emit" method that lets the puppet master system emit events

ERC20 system:
Implements all erc20 methods via its own namespace
Emits events on its puppet

ERC20 module:
Requires the puppet module to be installed
Deploys a new puppet, ERC20 system and tables in a given namespace
Registers the puppet delegation control as the delegation control for the new token namespace (erc20 system)
It would work to register into an existing namespace if the caller owns the namespace

---

Went full circle - now with the last version, what's the advantage over just using system hooks?
One advantage is that we don't need to implement specific proxy contracts with manual methods but can just use
a generic Puppet proxy cotract (and can reuse it for ERC20, ERC721, and others)
It's a little nicer to have the logic for emitting events coupled with the implementation than in a separate contract
It might be cheaper than hooks
It would technically possible to have a single system, but not with the Puppet <> SystemId setup (could be changed)
