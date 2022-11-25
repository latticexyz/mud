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

// A ecsStreamServer is the server on which gRPC methods for subscribing to stream data exist.
type ecsStreamServer struct {
	pb.UnimplementedECSStreamServiceServer
	ethclient   *ethclient.Client
	multiplexer *multiplexer.Multiplexer
	logger      *zap.Logger
}

///
/// gRPC ENDPOINTS
///

// SubscribeToStreamLatest is a gRPC endpoint that returns a stream of block data events.
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

	// Build a mapping of transaction hash to transaction object. In case the stream request
	// includes request for tx data per ecs event (tx which the event orginated from), then we
	// look up the tx via the tx hash from the event from this mapping.
	txHashToTx := map[string]*types.Transaction{}
	txHashes := []string{}

	for _, tx := range block.Transactions() {
		txHash := tx.Hash().Hex()
		txHashToTx[txHash] = tx
		txHashes = append(txHashes, txHash)
	}

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
		response.TransactionsConfirmed = txHashes
	}
	if request.EcsEvents {
		// Get all events in this block.
		logs := eth.GetAllEventsInBlock(client, blockNumber, worldAddresses)

		// Process and filter out logs.
		filteredLogs := eth.FilterLogs(logs)

		// Extract the ECS events from the logs.
		ecsEvents := ecs.LogsToEcsEvents(filteredLogs, txHashToTx, request.EcsEventsIncludeTxMetadata)
		response.EcsEvents = ecsEvents
	}

	return response
}
