WS_URL=ws://localhost:8545

GITCOMMIT := $(shell git rev-parse HEAD)
GITDATE := $(shell git show -s --format='%ct')
VERSION := v0.0.0

LDFLAGSSTRING +=-X main.GitCommit=$(GITCOMMIT)
LDFLAGSSTRING +=-X main.GitDate=$(GITDATE)
LDFLAGS := -ldflags "$(LDFLAGSSTRING)"

protoc: protoc-go protoc-ts
.PHONY: protoc

protoc-go:
	protoc --go_out=. --go-grpc_out=. ./proto/ecs-stream.proto
	protoc --go_out=. --go-grpc_out=. ./proto/ecs-snapshot.proto
	protoc --go_out=. --go-grpc_out=. ./proto/faucet.proto
.PHONY: protoc-go

protoc-ts:
	mkdir -p ./protobuf/ts/ecs-stream
	mkdir -p ./protobuf/ts/ecs-snapshot
	mkdir -p ./protobuf/ts/faucet
	npx protoc --ts_opt eslint_disable --ts_out ./protobuf/ts/ecs-stream --proto_path proto proto/ecs-stream.proto
	npx protoc --ts_opt eslint_disable --ts_out ./protobuf/ts/ecs-snapshot --proto_path proto proto/ecs-snapshot.proto
	npx protoc --ts_opt eslint_disable --ts_out ./protobuf/ts/faucet --proto_path proto proto/faucet.proto
.PHONY: protoc-ts

build: ecs-stream ecs-snapshot faucet
.PHONY: build

ecs-stream:
	go build $(LDFLAGS) -o ./bin/ecs-stream ./cmd/ecs-stream
.PHONY: ecs-stream

ecs-snapshot:
	go build $(LDFLAGS) -o ./bin/ecs-snapshot ./cmd/ecs-snapshot
.PHONY: ecs-snapshot

faucet:
	go build $(LDFLAGS) -o ./bin/faucet ./cmd/faucet
.PHONY: faucet

run-ecs-stream:
	./bin/ecs-stream -ws-url $(WS_URL)
.PHONY: run-ecs-stream

run-ecs-snapshot:
	./bin/ecs-snapshot -ws-url $(WS_URL)
.PHONY: run-ecs-snapshot

run-faucet:
	./bin/faucet --faucet-private-key ${FAUCET_PK}
.PHONY: run-faucet
