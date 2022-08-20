package grpc

import (
	"context"
	"fmt"
	"latticexyz/mud/packages/services/pkg/snapshot"
	pb "latticexyz/mud/packages/services/protobuf/go/ecs-snapshot"
)

type ecsSnapshotServer struct {
	pb.UnimplementedECSStateSnapshotServiceServer
}

///
/// gRPC ENDPOINTS
///

func (server *ecsSnapshotServer) GetWorlds(ctx context.Context, in *pb.WorldsRequest) (*pb.Worlds, error) {
	if !snapshot.IsWorldAddressSnapshotAvailable() {
		return nil, fmt.Errorf("no worlds snapshot")
	}
	worlds := snapshot.RawReadWorldAddressesSnapshot()

	return &pb.Worlds{
		WorldAddress: worlds.WorldAddress,
	}, nil
}

func (server *ecsSnapshotServer) GetStateLatest(ctx context.Context, in *pb.ECSStateRequestLatest) (*pb.ECSStateReply, error) {
	if !snapshot.IsSnaphotAvailableLatest(in.WorldAddress) {
		return nil, fmt.Errorf("no snapshot")
	}
	latestSnapshot := snapshot.RawReadStateSnapshotLatest(in.WorldAddress)

	return &pb.ECSStateReply{
		State:           latestSnapshot.State,
		StateComponents: latestSnapshot.StateComponents,
		StateEntities:   latestSnapshot.StateEntities,
		StateHash:       latestSnapshot.StateHash,
		BlockNumber:     latestSnapshot.EndBlockNumber,
	}, nil
}

func (server *ecsSnapshotServer) GetStateLatestStream(in *pb.ECSStateRequestLatest, stream pb.ECSStateSnapshotService_GetStateLatestStreamServer) error {
	if !snapshot.IsSnaphotAvailableLatest(in.WorldAddress) {
		return fmt.Errorf("no snapshot")
	}
	latestSnapshot := snapshot.RawReadStateSnapshotLatest(in.WorldAddress)
	// Respond in fraction chunks, e.g. in chunks of 10%.
	chunkFraction := 10
	latestSnapshotChunked := snapshot.ChunkRawStateSnapshot(latestSnapshot, chunkFraction)

	for _, snapshotChunk := range latestSnapshotChunked {
		stream.Send(&pb.ECSStateReply{
			State:           snapshotChunk.State,
			StateComponents: snapshotChunk.StateComponents,
			StateEntities:   snapshotChunk.StateEntities,
			StateHash:       snapshotChunk.StateHash,
			BlockNumber:     snapshotChunk.EndBlockNumber,
		})
	}
	return nil
}

func (server *ecsSnapshotServer) GetStateBlockLatest(ctx context.Context, in *pb.ECSStateBlockRequestLatest) (*pb.ECSStateBlockReply, error) {
	if !snapshot.IsSnaphotAvailableLatest(in.WorldAddress) {
		return nil, fmt.Errorf("no snapshot")
	}
	latestSnapshot := snapshot.RawReadStateSnapshotLatest(in.WorldAddress)

	return &pb.ECSStateBlockReply{
		BlockNumber: latestSnapshot.EndBlockNumber,
	}, nil
}

func (server *ecsSnapshotServer) GetStateAtBlock(ctx context.Context, in *pb.ECSStateRequestAtBlock) (*pb.ECSStateReply, error) {
	return nil, fmt.Errorf("not implemented")
}
