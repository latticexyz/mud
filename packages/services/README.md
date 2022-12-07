# Services

This package contains MUD services -- complimentary software components for enhanced interactions with on-chain ECS state when building with MUD. Services are designed to work with the ECS data representations and work out-of-the-box with any project built with MUD. Every service is a stand-alone Go binary that can be run connected to a chain that a MUD application is deployed to. Refer below for more technical details and to the linked entry-points for each service for details such as required and optional command-line arguments that allow you to customize each service.

| Service      | Description                                                                                                                              | Proto / Spec                                     | Default Port |
| ------------ | :--------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------- | -----------: |
| ecs-snapshot | Indexer reducing ECS events into a single "current" state for fast snapshot client syncs                                                 | [ecs-snapshot.proto](./proto/ecs-snapshot.proto) |        50061 |
| ecs-stream   | Multiplexer for subscriptions to receive current block data, ECS events per block, and transaction origination data                      | [ecs-stream.proto](./proto/ecs-stream.proto)     |        50051 |
| ecs-relay    | Generic message relayer, supporting signed messages, service-side signature verification, relay conditions for DDoS prevention, and more | [ecs-relay.proto](./proto/ecs-relay.proto)       |        50071 |
| faucet       | Faucet supporting custom drip amounts, global limits, twitter verification, and integrations with MUD components                         | [faucet.proto](./proto/faucet.proto)             |        50081 |

## Technical Details

Every service is a Go stand-alone binary that can be run individually. Entry-points (`main.go` files) for each service can be found linked in each sub-section below.

#### General

Each service exposes a gRPC server and a wrapper HTPP server (for ability to make gRPC wrapped requests from a web client, e.g. TypeScript MUD client). By default the gRPC server runs at the default `PORT` (specified above and in each `main.go` file) and the HTTP server runs at that `PORT + 1`. For example, the snapshot service has a gRPC server exposed on `50061` and a wrapper server is automatically exposed on `50062`.

Each service has specific command-line arguments. Each service requires a connection to an Ethereum node (for same network where your MUD application is deployed on) via a websocket. By default, all websocket connection URL parameters use a `localhost` instance running at port `8545`, so the full URL is `ws://localhost:8545`.

#### Dockerfile

There are Dockerfiles for each service available at the root of this repo -- `Dockerfile.{faucet|relay|snapshot|stream}`. Note that if you want to modify the Dockerfiles, one thing to make sure of is the exposed port to matching the port that each binary is configured to listen to by default.

Each service can be built and used within a Kubernetes cluster (via a resource that can pull the container image) by pushing the images to a container registry. For example, to build the snapshot server via the Dockerfile, we can build the image

```
docker build -f Dockerfile.snapshot --tag ghcr.io/latticexyz/mud-ecs-snapshot:<YOUR_TAG>
```

and then push to the container registry

```
docker push ghcr.io/latticexyz/mud-ecs-snapshot:<YOUR_TAG>
```

#### Protobuf

We use [Protocol Buffers](https://developers.google.com/protocol-buffers) to define the data structures and message schemas for each service. The `.proto` files are available in the `/proto` directory at the root of this repo -- `/proto/{ecs-relay|ecs-snapshot|ecs-stream|faucet}.proto`. For more details about `.proto` files and a language guide, see the [Language Guide (proto3)](https://developers.google.com/protocol-buffers/docs/proto3).

#### gRPC

We use [gRPC](https://grpc.io/docs/what-is-grpc/introduction/) along with protobuf for the complete Interface Definition Language (IDL) and message format. The `.proto` files in the `/proto` files directory contain the service definitions for each MUD service.

The benefit of using gRPC + protobuf is the abilitiy to generate both Golang and TypeScript stubs from the service + message definitions in `.proto` files. This way, we define what the service does and what kind of messages it can receive/send only once. We then generated the stubs for whatever language we want to use with the respective client-side or service-side codebase and we do so using the [protocol](https://grpc.io/docs/protoc-installation/) protocol buffer compiler. The generated stubs are placed in the `/protobuf` directory at the root of this repo, and are separated by subdirectories according to the language of the generated stubs. You may expect a directory structure like this

```
/protobuf
    /go
        /ecs-relay
        /ecs-snapshot
        /ecs-stream
        /faucet
    /ts
        /ecs-relay
        /ecs-snapshot
        /ecs-stream
        /faucet
```

If you would like to make edits to the service/message definitions in the protobuf files, it's as easy as editing the relevant `.proto` files and re-running the `protoc` command (more on this in "Getting Started"), which will re-generate the stubs for the languages that have been configured (Golang and TypeScript). If you'd like to add more languages, take a look at the linked resources on gRPC + protobufs and make edits to the [`Makefile`](./Makefile).

#### gRPC-web

As mentioned earlier, there is an HTTP server that gets run along the gRPC server in order to receive requests from gRPC-web (which are just POST routes). To do this we wrap the gRPC server in a HTTP listener server behind a "proxy". The services use a wrapper Go library to wrap the gRPC server and expose the HTTP server which will listen for gRPC-web requests and do the proxying.

#### grpcurl

For quick testing or experimentation with the services, we recommend using [grpcurl](https://github.com/fullstorydev/grpcurl). For example, once you build and run the snapshot service locally you can test the endpoint which returns the latest known and computed state to the service like this

```
grpcurl -plaintext -d '{"worldAddress": "<WORLD_ADDRESS>"}' localhost:50061 ecssnapshot.ECSStateSnapshotService/GetStateLatest
```

Note that the port is the gRPC server port and not the HTTP server port, since we are sending a raw gRPC request directly.

### [`ecs-snapshot`](./cmd/ecs-snapshot/main.go)

This service's function is to compute and save the ECS state from the chain via "snapshots", such that a client can perform an initial sync to the ECS world state without having to process all ECS state changes (in the form of events).

Because every update in MUD ECS is driven by events emitted on the world and triggered by individual component updates, to "catch up" to the "present time", any client needs to process and reduce the events that have been emitted on-chain. While possible to do and reasonable for applications with sparse component updates, once enough time passes (can reason about this as the chain getting "older"), it becomes infeasible and very redundant for every client to perform such a sync by manually reducing events. For example, two clients (even two browser windows on a single machine) would have to perform the same event processing steps in-browser to join a running instance of a deployed on-chain MUD application. Hence, we motivate the job of a snapshot service as a task to "catch" events as they are emitted, parse them out of every block, and reduce them into a state. In this way, the snapshot service effectively computes the "current" world state as it is updated on-chain. Put differently, it "indexes" the events into the state so that clients don't have to, hence the interchangeable use of "indexer" to call the snapshot service.

The interaction from a client perspective now becomes simpler. If a client needs to sync (as it has to if a new user is attempting to interact with an instance of deployed MUD application), it simply makes a call to an API endpoint that the snapshot service exposes and receives the current state encoded according to a spec over the wire.

There are multiple endpoints defined in the protobuf file and implemented in the gRPC Go server. For example, you can request the state as a single object via `/GetStateLatest`, but for larger states, there is an endpoint that can chunk the snapshot object according to a variable percentage, `/GetStateLatestStream`. This allows the client to load the state in, for instance, chunks of 1% to reduce the bandwidth load. State growth means that snapshots might get large enough that even a streamed RPC is a bit too much for a web client to handle. For this, there are a number of "pruned" state endpoints that return the snapshot state but with some specific components and their data omitted. Note that these endpoints are experimental and can be tweaked according to specific use cases when dealing with large state growth.

### [`ecs-stream`](./cmd/ecs-stream/main.go)

This service's function is to serve as a multiplexer, subscribing to a feed of data from an EVM-based network and allowing multiple clients to selectively subscribe to subsets of the data that they care about.

When building with MUD, you're likely to want to know when new blocks are produced and what transactions are included in those blocks since transactions generate state changes that are expressed as ECS events and hence are of interest to the application. One naive way to implement an app's "update" functionality is to "poll" the network at certain time intervals to get up-to-date information. For instance, the client can make an RPC call to a chain such as `eth_getBlockByNumber`. This approach is limiting because it creates unnecessary overhead where clients must initiate requests instead of reacting to state change.

The stream service provides a flexible way to receive updates and is integrated with MUD to provide specific per-block data, such as all ECS events in that block. The stream service intakes block updates when connected to a network node and makes the data available for multiple consumers. This means that the service consumes data once but makes it available to as many clients as connected to the service. Additionally, the service has a flexible message subscription schema where clients can specify exactly what data they're interested in subscribing to. For example, if a client only cares about what block number it is, it's sufficient to subscribe to the block number only. Clients who also care about the timestamp or the block hash are free to request those when subscribing to the stream.

The stream service contains a single RPC method called `/SubscribeToStreamLatest` that the clients connect to. We also refer to connected clients on this endpoint as "opening a cursor", since clients, by default, are kept connected and receive updates from the service as a server-side stream until they explicitly disconnect or there's a connection error.

### [`ecs-relay`](./cmd/ecs-relay/main.go)

This service's function is to act as an arbitrary, configurable message relay for data that does not _have_ to go on chain but which an application built with MUD can plug in to utilize seamlessly. The relay service is configurable to support arbitrary messages, messages with signatures, signature verification, and conditions for message relay, such as "do not relay message if balance < threshold" for DDoS prevention.

The relay works by exposing a system of "topics" and subscriptions/unsubscriptions that clients can opt in and opt-out of depending on interests. On top of the topic system, the relay exposes an endpoint for clients to "push" messages with topics attached to them that are then relayed. Messages are relayed to clients who subscribe to the aforementioned topic, which is done via a different endpoint akin to opening a cursor and listening for relayed events.

The flow in detail may resemble something like this.

1. Client "authenticates" with the service by making RPC on `/Authenticate` endpoint. The client has to identify itself to the service by providing a signature, at which point the public key of the message signer is registered as an identity by the service (which does this by recovering the signer from the signature). If this RPC returns successfully, then the service has registered this client.

2. Client subscribes to any labels that it is interested in via the `/Subscribe` endpoint. For example, this can be a recurrent process where the client keeps subscribing / unsubscribing to chunks as the player moves around a map. We needed to "authenticate" first to associate these subscriptions with a given client. This way, the service knows who is sending what. So as part of the request, the "identity" is provided to this RPC by the client in the form of a signature. The service again recovers the signer and checks against known registrations.

3. At the same time as subscribing (in another thread, for instance, or something similar), a client opens a cursor to receive events via `/OpenCursor`, again providing a signature to identify itself. This will use any current subscriptions at a given time from step (2) and pipe any messages to a stream. There is a timeout feature designed to disconnect idle clients, so we also need to keep sending a `/Ping` RPC to keep this stream open.

4. At this point, steps (2) and (3) are active, `/Subscribe` & `/Unsubscribe` keep being called to update what the client wants to see via the opened cursor, and `/Ping`s are sent to keep the connection alive

5. Last but not least, in parallel with all of this, the client most likely needs to send a bunch of stuff to be relayed, so to do that, it uses the `/Push` or `/PushStream` RPC and sends messages with some given label that identifies a topic that others might subscribe to. These labeled "pushes" are then relayed to whoever is subscribed to the labels and has a `/OpenCursor` active, etc., etc., and so on.

The `main.go` entry point for the relay service contains several command line arguments that can be tweaked to enhance and restrict the message relay flows as desired.

### [`faucet`](./cmd/faucet/main.go)

This service's function is to act as a configurable faucet with in-service integrations for MUD transactions. A faucet, by definition, is a service that distributes a pre-set amount of currency on a network limited by a global limit and/or a time limit. For example, a faucet might be able to "drip" 0.01 ETH on a testnet, claimable by the same address no more than once per 12 hours, with a total daily limit of 100 ETH. This service allows you to run a faucet just like this and more.

#### Twitter Verification

The faucet additionally supports verification via Twitter, utilizing the Twitter API and digital signature verification. Note that this requires a Twitter API secret & key that should be obtained from the Twitter Developer portal. A Twitter verification allows you to run a faucet with an extra condition enforced on the ability of your users to claim a "drip". In addition to the time / amount limits, with Twitter verification, a user of your app will have to tweet a valid digital signature to serve as proof of ownership over the address that they are requesting the drip to. In this way, the user "links" the Twitter username with an address and after making an RPC call to verify the tweet, receive a drip. Follow-up requests for a drip from the faucet service do not require extra tweets. Drip limits, time limits, and global ETH emission limits are still enforced the same way as running without Twitter verification.

#### MUD Transaction Support

The faucet also supports integration with the MUD World contracts and Components and allows you to insert custom code on "drip" events to set MUD Component values. This allows for close integration with your deployed on-chain MUD application. For example, you can build an extended faucet, which accepts drip requests with Twitter verification, and after verifying the signature in the Tweet, sends an on-chain transaction to set a Component value to link the Twitter username and signer address on-chain. This then can allow the client, for instance, a web app, to display the linked Twitter username for the user by getting the state directly from the on-chain state without relying on any server, even the faucet itself.

Similarly, as for other services, check out the services `main.go` entry point file for more command-line arguments that can be configured to tweak the configuration of the faucet and turn features on or off.

## Getting started

### Quickstart

The services are written in Go, so to compile and run the service locally you will need Golang installed locally. We use a [`Makefile`](./Makefile) for 'build' & 'run' tasks.

1. Install Go

2. Build the source. This will build all the services

```
make build
```

3. Frequently you'd like to build only a specific service, for example, as you're developing it might not be needed to rebuild all services. For this case the `Makefile` exposes individual commands to build specific service binaries. For example, to build the snapshot service only

```
make ecs-snapshot
```

4. Run whichever binary via [`Makefile`](./Makefile). For example, to run the snapshot service

```
make run-ecs-snapshot WS_URL=<websocket URL>
```

### Generating protobuf files

The package has the protobuf files checked in, but in case you want to regenerate those (based on an updated `.proto` file for instance), run

```
make protoc
```
