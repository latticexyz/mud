package ecs

import (
	"latticexyz/mud/packages/services/pkg/eth"
	"latticexyz/mud/packages/services/pkg/logger"
	"latticexyz/mud/packages/services/pkg/world"
	pb "latticexyz/mud/packages/services/protobuf/go-ecs-stream"

	"github.com/ethereum/go-ethereum/common/hexutil"
	"github.com/ethereum/go-ethereum/core/types"
	"go.uber.org/zap"
)

func LogsToEcsEvents(filteredLogs []types.Log) []*pb.ECSEvent {
	ecsEvents := []*pb.ECSEvent{}

	for _, eventLog := range filteredLogs {
		// The first element in the topics array is always the hash of the event signature.
		eventSignatureHash := eventLog.Topics[0].Hex()

		if eventSignatureHash == eth.ComputeEventFingerprint("ComponentRegistered") {
			ecsEvents = append(ecsEvents, parseEventComponentRegistered(eventLog))
		} else if eventSignatureHash == eth.ComputeEventFingerprint("ComponentValueSet") {
			ecsEvents = append(ecsEvents, parseEventComponentValueSet(eventLog))
		} else if eventSignatureHash == eth.ComputeEventFingerprint("ComponentValueRemoved") {
			ecsEvents = append(ecsEvents, parseEventComponentValueRemoved(eventLog))
		} else {
			logger.GetLogger().Error("got unexpected event",
				zap.String("eventSignatureHash", eventSignatureHash),
				zap.ByteString("eventLog.Data", eventLog.Data),
			)
		}
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
