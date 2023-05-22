# Services

This package contains MUD services -- complimentary software components for enhanced interactions with on-chain state when building with MUD. Services work out-of-the-box with any project built with MUD.

## V2 Services

### [📄 Docs](#)

The following services are available for use with MUD V2. For more details on each service, see the linked docs page.

| Service | Description                                                                           | Proto / Spec                     | Default Port |
| ------- | :------------------------------------------------------------------------------------ | :------------------------------- | -----------: |
| mode    | A node for MUD. PostgresDB-based indexer of MUD V2 events across chains + MUD worlds. | [mode.proto](./proto/mode.proto) |        50091 |

### 🏃 Quickstart

#### Running MODE with Docker Compose

(Only tested on MacOS for now.)

1. Install Docker for Mac (https://docs.docker.com/docker-for-mac/install/)
2. Install Docker Compose (https://docs.docker.com/compose/install/)
3. Run `docker-compose -f docker-compose.mode.yaml up`. This will start services for both MODE and PostgresDB.
4. By default it will connect to a local anvil node at `localhost:8545`. If you want to connect to a different node, you can change the `rpc.http` and `rpc.ws` fields in the `config.mode-docker.yaml` file.

#### Running the MODE service

1. Install Go
2. Install Postgres
3. Deside which database you want to use, e.g. `mode` and create the database
4. Set up logical replication on the database of your choice, e.g. `mode`. Logical replication is used to enable fast MUD state change streaming using the WAL (Write-Ahead Log) of the database. For more infromation on logical replication, see the [Postgres documentation](https://www.postgresql.org/docs/current/logical-replication.html). For this you need to
   1. Modify the DB config to use logical replication. This is done by adding the following to the `postgresql.conf` file:
      ```
      wal_level = logical
      max_replication_slots = 1
      max_wal_senders = 1
      ```
      alternatively you can use the following SQL commands:
      ```sql
      ALTER SYSTEM SET wal_level = logical;
      ALTER SYSTEM SET max_replication_slots = 1;
      ALTER SYSTEM SET max_wal_senders = 1;
      ```
   2. Restart the DB
5. Build the source. This will build the MODE service

```bash
make mode
```

6. Modify `config.mode.yaml` MODE config file to match your preferences. MODE can be configured either with a config file or via command line arguments (both will do the same thing). In this step you should probably change the `dsn` section to match your database name created in step (3): this is what MODE uses to connect to Postgres. Additionally change the `chains` section in case you'd like to connect and have MODE index a different chain other than a local node. You can also change the `port`s to match your preferences. Example config file:

```yaml
chains:
  - name: "localhost"
    id: "371337"
    rpc:
      http: "http://localhost:8545"
      ws: "ws://localhost:8545"
db:
  dsn: "postgresql://localhost:5432/mode_ephemeral?sslmode=disable&replication=database"
  wipe: false
sync:
  enabled: true
  startBlock: 0
  blockBatchCount: 10000
ql:
  port: 50091
metrics:
  port: 6060
```

7. If you're running with the default localhost / `371337` chain, make sure there is a local node running for the chain you want to connect to. For example, a hardhat node or an anvil node.
8. Run the MODE service

```bash
./bin/mode -config config.mode.yaml
```

or

```bash
make run-mode
```

9. Optionally, install `grpcurl` to interact with the MODE service API from the command line. For example, on MacOS you can use `brew` to install `grpcurl`:

```bash
brew install grpcurl
```

10. MODE exposes a `QueryLayer` gRPC server on port `50091` by default. You can use a gRPC client to interact with the service API. For example, to query for the current state of an indexed MUD world deployed at address `0xff738496c8cd898dC31b670D067162200C5c20A1` and on local chain with ID `371337`, you can use the `GetState` RPC endpoint:

```bash
grpcurl -plaintext -d '{"chainTables": [], "worldTables": [], "namespace": {"chainId":"371337", "worldAddress": "0xff738496c8cd898dC31b670D067162200C5c20A1"}}' localhost:50091 mode.QueryLayer/GetState
```

After the initial setup, to quickly re-build and run the MODE service, you can use

```bash
make mode run-mode
```

#### MODE and MUD

Certain parts of MODE depend on MUD, specifically the `storecore` package of MODE which allows us to work with data coming from MUD and perfom encoding/decodings between MUD SchemaTypes, Go types, and Postgres types when the data is store in the DB. If modifications are made to MUD StoreCore, MODE `storecore.go` needs to be re-generated. To do this, perform these steps:

1. Get the latest MUD StoreCore abi and save it to a file, e.g. `storecore.json` or `storecore.abi`. It should look something like this

```json
[
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "bytes32",
        "name": "tableId",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "bytes32[]",
        "name": "key",
        "type": "bytes32[]"
      }
    ],
    "name": "StoreDeleteRecord",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "bytes32",
        "name": "tableId",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "bytes32[]",
        "name": "key",
        "type": "bytes32[]"
      },
      {
        "indexed": false,
        "internalType": "uint8",
        "name": "schemaIndex",
        "type": "uint8"
      },
      {
        "indexed": false,
        "internalType": "bytes",
        "name": "data",
        "type": "bytes"
      }
    ],
    "name": "StoreSetField",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "bytes32",
        "name": "tableId",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "bytes32[]",
        "name": "key",
        "type": "bytes32[]"
      },
      {
        "indexed": false,
        "internalType": "bytes",
        "name": "data",
        "type": "bytes"
      }
    ],
    "name": "StoreSetRecord",
    "type": "event"
  }
]
```

2. Run the following command to generate the MODE `storecore.go` file:

```bash
abigen --abi storecore.abi --pkg storecore --out storecore.go
```

3. Copy the generated `storecore.go` file to the MODE `storecore` package. Alternatively, run the command in the storecore package directory and the file will overwrite the existing one.

## V1 Services

### [📄 Docs](./README.v1.md)

The following services are available for use with MUD V1. For more details on each service, see the linked docs page.

| Service      | Description                                                                                                                              | Proto / Spec                                     | Default Port |
| ------------ | :--------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------- | -----------: |
| ecs-snapshot | Indexer reducing ECS events into a single "current" state for fast snapshot client syncs                                                 | [ecs-snapshot.proto](./proto/ecs-snapshot.proto) |        50061 |
| ecs-stream   | Multiplexer for subscriptions to receive current block data, ECS events per block, and transaction origination data                      | [ecs-stream.proto](./proto/ecs-stream.proto)     |        50051 |
| ecs-relay    | Generic message relayer, supporting signed messages, service-side signature verification, relay conditions for DDoS prevention, and more | [ecs-relay.proto](./proto/ecs-relay.proto)       |        50071 |
| faucet       | Faucet supporting custom drip amounts, global limits, twitter verification, and integrations with MUD components                         | [faucet.proto](./proto/faucet.proto)             |        50081 |

### 🏃 Quickstart

#### Running the ECS Snapshot, Stream, Relay, and Faucet services

1. Install Go
2. Build the source. This will build all the services

```bash
make build
```

or to build only specific services

```bash
make ecs-snapshot ecs-stream ecs-relay faucet
```

3. If you're running with the default chain, make sure there is a local node running for the chain you want to connect to. For example, a hardhat node or an anvil node.
4. Run whichever binary via [`Makefile`](./Makefile). For example, to run the snapshot service

```bash
make run-ecs-snapshot
```

## Protobuf

MUD services use [Protocol Buffers](https://developers.google.com/protocol-buffers) to define the data structures and message schemas. The `.proto` files are available in the `/proto` directory at the root of this repo. For more details about `.proto` files and a language guide, see the [Language Guide (proto3)](https://developers.google.com/protocol-buffers/docs/proto3). The package has the protobuf files checked in, but in case you want to regenerate those (based on an updated `.proto` file for instance), run

```bash
make protoc
```
