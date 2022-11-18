package ecs

import (
	"latticexyz/mud/packages/services/pkg/eth"
	"latticexyz/mud/packages/services/pkg/logger"
	"latticexyz/mud/packages/services/pkg/world"
	pb "latticexyz/mud/packages/services/protobuf/go/ecs-stream"

	"github.com/ethereum/go-ethereum/common/hexutil"
	"github.com/ethereum/go-ethereum/core/types"
	"go.uber.org/zap"
)

// LogsToEcsEvents transforms a list of filteredLogs coming directly from the block into a list of
// ECSEvents extracted from those logs. Returns the list of ECSEvents in protobuf format.
func LogsToEcsEvents(
	filteredLogs []types.Log,
	txHashToTx map[string]*types.Transaction,
	includeTxMetadata bool,
) []*pb.ECSEvent {
	ecsEvents := []*pb.ECSEvent{}

	for _, eventLog := range filteredLogs {
		// The first element in the topics array is always the hash of the event signature.
		eventSignatureHash := eventLog.Topics[0].Hex()

		var ecsEvent *pb.ECSEvent
		if eventSignatureHash == eth.ComputeEventFingerprint("ComponentRegistered") {
			ecsEvent = parseEventComponentRegistered(eventLog)
		} else if eventSignatureHash == eth.ComputeEventFingerprint("ComponentValueSet") {
			ecsEvent = parseEventComponentValueSet(eventLog)
		} else if eventSignatureHash == eth.ComputeEventFingerprint("ComponentValueRemoved") {
			ecsEvent = parseEventComponentValueRemoved(eventLog)
		} else {
			logger.GetLogger().Error("got unexpected event",
				zap.String("eventSignatureHash", eventSignatureHash),
				zap.ByteString("eventLog.Data", eventLog.Data),
			)
			continue
		}
		// Add tx hash.
		ecsEvent.TxHash = eventLog.TxHash.Hex()

		// Add tx metadata.
		if includeTxMetadata {
			tx := txHashToTx[eventLog.TxHash.Hex()]
			ecsEvent.TxMetadata = &pb.TxMetadata{
				Data:  tx.Data(),
				Value: tx.Value().Uint64(),
			}
			// Only add the 'to' field if it's non-nil, i.e. not a contract creation.
			if tx.To() != nil {
				ecsEvent.TxMetadata.To = tx.To().Hex()
			}
		}
		ecsEvents = append(ecsEvents, ecsEvent)
	}

	return ecsEvents
}

func parseEventComponentRegistered(log types.Log) *pb.ECSEvent {
	event := new(world.WorldComponentRegistered)
	if err := eth.UnpackLog(event, "ComponentRegistered", log); err != nil {
		logger.GetLogger().Fatal("failed to process WorldComponentRegistered event", zap.Error(err))
	}
	componentId := hexutil.EncodeBig(event.ComponentId)

	return &pb.ECSEvent{
		EventType:   "ComponentRegistered",
		ComponentId: componentId,
	}
}

func parseEventComponentValueSet(log types.Log) *pb.ECSEvent {
	event := new(world.WorldComponentValueSet)
	if err := eth.UnpackLog(event, "ComponentValueSet", log); err != nil {
		logger.GetLogger().Fatal("failed to process WorldComponentValueSet event", zap.Error(err))
	}
	componentId := hexutil.EncodeBig(event.ComponentId)
	entityId := hexutil.EncodeBig(event.Entity)

	return &pb.ECSEvent{
		EventType:   "ComponentValueSet",
		ComponentId: componentId,
		EntityId:    entityId,
		Value:       event.Data,
	}
}

func parseEventComponentValueRemoved(log types.Log) *pb.ECSEvent {
	event := new(world.WorldComponentValueRemoved)
	if err := eth.UnpackLog(event, "ComponentValueRemoved", log); err != nil {
		logger.GetLogger().Fatal("failed to process WorldComponentValueRemoved event", zap.Error(err))
	}
	componentId := hexutil.EncodeBig(event.ComponentId)
	entityId := hexutil.EncodeBig(event.Entity)

	return &pb.ECSEvent{
		EventType:   "ComponentValueRemoved",
		ComponentId: componentId,
		EntityId:    entityId,
	}
}
