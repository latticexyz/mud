package grpc

import (
	"context"
	"fmt"
	"latticexyz/mud/packages/services/pkg/snapshot"
	"latticexyz/mud/packages/services/pkg/utils"
	pb "latticexyz/mud/packages/services/protobuf/go/ecs-snapshot"
)

// A ecsSnapshotServer is the server on which gRPC methods for getting the snapshot data exist.
type ecsSnapshotServer struct {
	pb.UnimplementedECSStateSnapshotServiceServer

	config *snapshot.SnapshotServerConfig
}

///
/// gRPC ENDPOINTS
///

// GetWorlds is a gRPC endpoint that returns a list of World addresses that the snapshots have been
// taken for, if any.
func (server *ecsSnapshotServer) GetWorlds(ctx context.Context, in *pb.WorldsRequest) (*pb.Worlds, error) {
	if !snapshot.IsWorldAddressSnapshotAvailable() {
		return nil, fmt.Errorf("no worlds snapshot")
	}
	worlds := snapshot.RawReadWorldAddressesSnapshot()

	return &pb.Worlds{
		WorldAddress: worlds.WorldAddress,
	}, nil
}

// GetStateLatest is a gRPC endpoint that returns the latest snapshot, if any, for a given
// WorldAddress provided via ECSStateRequestLatest. The snapshot is sent as one object over the
// wire.
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

// GetStateLatestStream is a gRPC endpoint that returns the latest snapshot, if any, for a given
// WorldAddress provided via ECSStateRequestLatestStream. The snapshot is sent chunked via a stream over
// the wire.
func (server *ecsSnapshotServer) GetStateLatestStream(in *pb.ECSStateRequestLatestStream, stream pb.ECSStateSnapshotService_GetStateLatestStreamServer) error {
	if !snapshot.IsSnaphotAvailableLatest(in.WorldAddress) {
		return fmt.Errorf("no snapshot")
	}
	latestSnapshot := snapshot.RawReadStateSnapshotLatest(in.WorldAddress)

	// Respond in fraction chunks. If request has specified a chunk percentage, use that value.
	chunkPercentage := server.config.DefaultSnapshotChunkPercentage
	if in.ChunkPercentage != nil {
		chunkPercentage = int(*in.ChunkPercentage)
	}

	latestSnapshotChunked := snapshot.ChunkRawStateSnapshot(latestSnapshot, chunkPercentage)

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

func (server *ecsSnapshotServer) GetStateLatestStreamPruned(request *pb.ECSStateRequestLatestStreamPruned, stream pb.ECSStateSnapshotService_GetStateLatestStreamPrunedServer) error {
	if !snapshot.IsSnaphotAvailableLatest(request.WorldAddress) {
		return fmt.Errorf("no snapshot")
	}
	if len(request.PruneAddress) == 0 {
		return fmt.Errorf("address for which to prune for required")
	}
	latestSnapshot := snapshot.RawReadStateSnapshotLatest(request.WorldAddress)
	latestSnapshotPruned := snapshot.PruneSnapshotOwnedByComponent(latestSnapshot, request.PruneAddress)

	// Respond in fraction chunks. If request has specified a chunk percentage, use that value.
	chunkPercentage := server.config.DefaultSnapshotChunkPercentage
	if request.ChunkPercentage != nil {
		chunkPercentage = int(*request.ChunkPercentage)
	}

	latestSnapshotChunked := snapshot.ChunkRawStateSnapshot(latestSnapshotPruned, chunkPercentage)

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

// GetStateLatestStream is a gRPC endpoint that returns the block number for the latest available
// snapshot, if any, for a given WorldAddress provided via ECSStateBlockRequestLatest.
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

//
// V2 endpoints
//

func (server *ecsSnapshotServer) GetStateLatestStreamV2(in *pb.ECSStateRequestLatestStream, stream pb.ECSStateSnapshotService_GetStateLatestStreamV2Server) error {
	if !snapshot.IsSnaphotAvailableLatest(in.WorldAddress) {
		return fmt.Errorf("no snapshot")
	}
	latestSnapshot := snapshot.RawReadStateSnapshotLatest(in.WorldAddress)

	// Respond in fraction chunks. If request has specified a chunk percentage, use that value.
	chunkPercentage := server.config.DefaultSnapshotChunkPercentage
	if in.ChunkPercentage != nil {
		chunkPercentage = int(*in.ChunkPercentage)
	}

	latestSnapshotChunked := snapshot.ChunkRawStateSnapshot(latestSnapshot, chunkPercentage)

	for _, snapshotChunk := range latestSnapshotChunked {
		stream.Send(&pb.ECSStateReplyV2{
			State:           snapshotChunk.State,
			StateComponents: snapshotChunk.StateComponents,
			StateEntities:   utils.HexStringArrayToBytesArray(snapshotChunk.StateEntities),
			StateHash:       snapshotChunk.StateHash,
			BlockNumber:     snapshotChunk.EndBlockNumber,
		})
	}
	return nil
}

func (server *ecsSnapshotServer) GetStateLatestStreamPrunedV2(request *pb.ECSStateRequestLatestStreamPruned, stream pb.ECSStateSnapshotService_GetStateLatestStreamPrunedV2Server) error {
	if !snapshot.IsSnaphotAvailableLatest(request.WorldAddress) {
		return fmt.Errorf("no snapshot")
	}
	if len(request.PruneAddress) == 0 {
		return fmt.Errorf("address for which to prune for required")
	}
	latestSnapshot := snapshot.RawReadStateSnapshotLatest(request.WorldAddress)
	latestSnapshotPruned := snapshot.PruneSnapshotOwnedByComponent(latestSnapshot, request.PruneAddress)

	// Respond in fraction chunks. If request has specified a chunk percentage, use that value.
	chunkPercentage := server.config.DefaultSnapshotChunkPercentage
	if request.ChunkPercentage != nil {
		chunkPercentage = int(*request.ChunkPercentage)
	}

	latestSnapshotChunked := snapshot.ChunkRawStateSnapshot(latestSnapshotPruned, chunkPercentage)

	for _, snapshotChunk := range latestSnapshotChunked {
		stream.Send(&pb.ECSStateReplyV2{
			State:           snapshotChunk.State,
			StateComponents: snapshotChunk.StateComponents,
			StateEntities:   utils.HexStringArrayToBytesArray(snapshotChunk.StateEntities),
			StateHash:       snapshotChunk.StateHash,
			BlockNumber:     snapshotChunk.EndBlockNumber,
		})
	}
	return nil
}
