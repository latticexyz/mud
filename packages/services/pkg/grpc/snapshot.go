package grpc

import (
	pb "latticexyz/chain-sidecar/protobuf/go-ecs-snapshot"
)

type ecsSnapshotServer struct {
	pb.UnimplementedECSStateSnapshotServiceServer
}
