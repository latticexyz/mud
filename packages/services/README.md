# MUD services

This package contains the source code for MUD services for enhanced interactions with on-chain ECS state -- ECS Snapshot Service and ECS Stream Service.

[ECS State Snapshot Service](./cmd/ecs-snapshot/main.go) -- The service's function is to compute and save ECS state from the chain via "snapshots", such that a client can perform an initial sync to the ECS world state without having to process all ECS state changes (in the form of events).

[ECS Stream Service](./cmd/ecs-stream/main.go) -- The service's function is to server as a multiplexer, subscribing to a feed of data from a Geth-based chain and allowing multiple clients to selectively subscribe to subsets of the data that they care about.

## Local setup

### Generating protobuf files

The package has the protobuf files checked in, but in case you want to regenerate those (based on an updated `.proto` file for instance)

```
make protoc
```

The services are written in Go, so to compile and run the service locally you will need Golang installed locally.

1. Install Go
2. Build the source `make build`
3. Run whichever binary

```
make run-ecs-stream WS_URL=<websocket URL>
```

or

```
make run-ecs-snapshot WS_URL=<websocket URL>
```

The websocket URLs default to a local node -- `ws://localhost:8545`.

### Support for gRPC-web

In order to recieve requests from gRPC-web (which are just POST routes), we need to wrap the gRPC server in a http listener server behind a "proxy". The services use a wrapper Go library to wrap the gRPC server and additionally expose an HTTP server which will listen for gRPC-web requests and do the proxying.

## Docker / Kubernetes setup

The service can be built and used within a Kubernetes cluster (via a resource that can pull the container image). To create the image, use the local `Dockerfile` and run, for example

```
docker build -f Dockerfile.snapshot --tag ghcr.io/latticexyz/lattice-ecs-snapshot:<YOUR_TAG>
```

This will build the service and tag the image such that you can push to a container registry, for example

```
docker push ghcr.io/latticexyz/lattice-ecs-snapshot:<YOUR_TAG>
```
