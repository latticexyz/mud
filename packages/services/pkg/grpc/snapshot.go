package grpc

import (
	pb "latticexyz/mud/packages/services/protobuf/go-ecs-snapshot"
)

type ecsSnapshotServer struct {
	pb.UnimplementedECSStateSnapshotServiceServer
}
