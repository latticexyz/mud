package grpc

import (
	"time"

	"latticexyz/mud/packages/services/pkg/ecs"
	"latticexyz/mud/packages/services/pkg/eth"
	multiplexer "latticexyz/mud/packages/services/pkg/multiplexer"
	pb "latticexyz/mud/packages/services/protobuf/go/ecs-stream"

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/ethclient"
	"go.uber.org/zap"
)

type ecsStreamServer struct {
	pb.UnimplementedECSStreamServiceServer
	ethclient   *ethclient.Client
	multiplexer *multiplexer.Multiplexer
	logger      *zap.Logger
}

///
/// gRPC ENDPOINTS
///

func (server *ecsStreamServer) SubscribeToStreamLatest(
	request *pb.ECSStreamBlockBundleRequest,
	stream pb.ECSStreamService_SubscribeToStreamLatestServer,
) error {
	msgChannel := server.multiplexer.Subscribe()
	for {
		select {
		case <-stream.Context().Done():
			server.logger.Info("client cursor closed, unsubscribing a multiplexer listener")
			server.multiplexer.Unsubscribe(msgChannel)
			return nil
		case data := <-msgChannel:
			if block, ok := data.(*types.Block); ok {
				tsStart := time.Now()
				blockStreamResponse := buildStreamResponse(block, server.ethclient, request)
				tsElapsed := time.Since(tsStart)
				server.logger.Info("sending back block stream response", zap.String("category", "Stream"), zap.String("timeTaken", tsElapsed.String()))

				stream.Send(blockStreamResponse)
			}
		}
	}
}

func buildStreamResponse(block *types.Block, client *ethclient.Client, request *pb.ECSStreamBlockBundleRequest) *pb.ECSStreamBlockBundleReply {
	worldAddresses := []common.Address{common.HexToAddress(request.WorldAddress)}

	// Conditionally build a response to the request based on which fields were requested.
	response := &pb.ECSStreamBlockBundleReply{}

	blockNumber := block.Number()
	if request.BlockNumber {
		response.BlockNumber = uint32(blockNumber.Uint64())
	}
	if request.BlockHash {
		response.BlockHash = block.Hash().Hex()
	}
	if request.BlockTimestamp {
		response.BlockTimestamp = uint32(block.Time())
	}
	if request.TransactionsConfirmed {
		txHashes := []string{}
		for _, tx := range block.Transactions() {
			txHashes = append(txHashes, tx.Hash().Hex())
		}
		response.TransactionsConfirmed = txHashes
	}
	if request.EcsEvents {
		// Get all events in this block.
		logs := eth.GetAllEventsInBlock(client, blockNumber, worldAddresses)

		// Process and filter out logs.
		filteredLogs := eth.FilterLogs(logs)

		// Extract the ECS events from the logs.
		ecsEvents := ecs.LogsToEcsEvents(filteredLogs)
		response.EcsEvents = ecsEvents
	}

	return response
}
