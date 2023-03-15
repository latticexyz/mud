WS_URL=ws://localhost:8545

GITCOMMIT := $(shell git rev-parse HEAD)
GITDATE := $(shell git show -s --format='%ct')
VERSION := v0.0.0

LDFLAGSSTRING +=-X main.GitCommit=$(GITCOMMIT)
LDFLAGSSTRING +=-X main.GitDate=$(GITDATE)
LDFLAGS := -ldflags "$(LDFLAGSSTRING)"

protoc: protoc-go protoc-ts protoc-clean
.PHONY: protoc

protoc-go:
	protoc --go_out=. --go-grpc_out=. ./proto/ecs-stream.proto
	protoc --go_out=. --go-grpc_out=. ./proto/ecs-snapshot.proto
	protoc --go_out=. --go-grpc_out=. ./proto/ecs-relay.proto
	protoc --go_out=. --go-grpc_out=. ./proto/faucet.proto
	protoc --go_out=. --go-grpc_out=. ./proto/mode.proto
.PHONY: protoc-go

protoc-ts:
	mkdir -p ./protobuf/ts/ecs-stream
	mkdir -p ./protobuf/ts/ecs-snapshot
	mkdir -p ./protobuf/ts/ecs-relay
	mkdir -p ./protobuf/ts/faucet
	mkdir -p ./protobuf/ts/mode
	protoc \
	--plugin protoc-gen-ts_proto=./node_modules/.bin/protoc-gen-ts_proto \
	--ts_proto_out ./protobuf/ts/ecs-stream \
	--ts_proto_opt=env=browser,outputServices=nice-grpc,outputServices=generic-definitions,outputJsonMethods=false,useExactTypes=false,eslint_disable,esModuleInterop=true \
	--proto_path proto proto/ecs-stream.proto 
	protoc \
	--plugin protoc-gen-ts_proto=./node_modules/.bin/protoc-gen-ts_proto \
	--ts_proto_out ./protobuf/ts/ecs-snapshot \
	--ts_proto_opt=env=browser,outputServices=nice-grpc,outputServices=generic-definitions,outputJsonMethods=false,useExactTypes=false,eslint_disable,esModuleInterop=true \
	--proto_path proto proto/ecs-snapshot.proto 
	protoc \
	--plugin protoc-gen-ts_proto=./node_modules/.bin/protoc-gen-ts_proto \
	--ts_proto_out ./protobuf/ts/ecs-relay \
	--ts_proto_opt=env=browser,outputServices=nice-grpc,outputServices=generic-definitions,outputJsonMethods=false,useExactTypes=false,eslint_disable,esModuleInterop=true \
	--proto_path proto proto/ecs-relay.proto 
	protoc \
	--plugin protoc-gen-ts_proto=./node_modules/.bin/protoc-gen-ts_proto \
	--ts_proto_out ./protobuf/ts/faucet \
	--ts_proto_opt=env=browser,outputServices=nice-grpc,outputServices=generic-definitions,outputJsonMethods=false,useExactTypes=false,eslint_disable,esModuleInterop=true \
	--proto_path proto proto/faucet.proto 
	protoc \
	--plugin protoc-gen-ts_proto=./node_modules/.bin/protoc-gen-ts_proto \
	--ts_proto_out ./protobuf/ts/mode \
	--ts_proto_opt=env=browser,outputServices=nice-grpc,outputServices=generic-definitions,outputJsonMethods=false,useExactTypes=false,eslint_disable,esModuleInterop=true \
	--proto_path proto proto/mode.proto 
.PHONY: protoc-ts

protoc-clean:
	cd ./protobuf/go/mode && ls *.pb.go | xargs -n1 -IX bash -c 'sed s/,omitempty// X > X.tmp && mv X{.tmp,}'
.PHONY: protoc-clean

build: ecs-stream ecs-snapshot ecs-relay faucet
.PHONY: build

ecs-stream:
	go build $(LDFLAGS) -o ./bin/ecs-stream ./cmd/ecs-stream
.PHONY: ecs-stream

ecs-snapshot:
	go build $(LDFLAGS) -o ./bin/ecs-snapshot ./cmd/ecs-snapshot
.PHONY: ecs-snapshot

ecs-relay:
	go build $(LDFLAGS) -o ./bin/ecs-relay ./cmd/ecs-relay
.PHONY: ecs-relay

faucet:
	go build $(LDFLAGS) -o ./bin/faucet ./cmd/faucet
.PHONY: faucet

migrator:
	go build $(LDFLAGS) -o ./bin/migrator ./cmd/migrator
.PHONY: migrator

mode:
	go build $(LDFLAGS) -o ./bin/mode ./cmd/mode
.PHONY: mode

run-ecs-stream:
	./bin/ecs-stream -ws-url $(WS_URL)
.PHONY: run-ecs-stream

run-ecs-snapshot:
	./bin/ecs-snapshot -ws-url $(WS_URL) --block ${SNAPSHOT_START_BLOCK}
.PHONY: run-ecs-snapshot

run-ecs-relay:
	./bin/ecs-relay
.PHONY: run-ecs-relay

run-faucet:
	./bin/faucet --faucet-private-key ${FAUCET_PK}
.PHONY: run-faucet

run-faucet-dev:
	./bin/faucet --faucet-private-key ${FAUCET_PK} --dev
.PHONY: run-faucet-dev

run-migrator:
	./bin/migrator
.PHONY: run-migrator

run-mode:
	./bin/mode --config config.mode.yaml
.PHONY: run-mode