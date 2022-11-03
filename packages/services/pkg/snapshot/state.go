package snapshot

import (
	"latticexyz/mud/packages/services/pkg/eth"
	"latticexyz/mud/packages/services/pkg/logger"
	"latticexyz/mud/packages/services/pkg/world"
	"math"
	"sync"

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/common/hexutil"
	"github.com/ethereum/go-ethereum/core/types"
	"go.uber.org/zap"
)

// ECSState mimics a simple state machine, hence every transformation must return the updated
// state and there are no objects. This type represents an ECS state on the world.
type ECSState = map[string]*sync.Map

// ChainECSState is the full state of a chain, which is a mapping from all worlds to their ECSState.
type ChainECSState = map[string]ECSState

func getEmptyStateChain() ChainECSState {
	return ChainECSState{}
}

func getEmptyState() ECSState {
	return ECSState{}
}

func getInitialStateChain() (ChainECSState, uint64) {
	// Go through the list of worlds (if any), and process each world's state
	// one-by-one. If there are no worlds that we know of, the initial state
	// reduces to the empty state.
	state := getEmptyStateChain()
	worlds := readWorldAddressesSnapshot()

	var minBlockOfKnownECSState uint64 = math.MaxUint64
	min := func(a, b uint64) uint64 {
		if a < b {
			return a
		}
		return b
	}

	// Iterate through the world addresses (if there are none from snapshot then this is a no-op)
	// and build the initial state.
	for _, worldAddress := range worlds {
		ecsStateForWorld, blockOfEcsStateForWorld := getInitialState(worldAddress)

		// Set the state for this world address.
		state[worldAddress] = ecsStateForWorld
		// Take the minimum of the block numbers to record what is the lowest block that we
		// need to sync from.
		minBlockOfKnownECSState = min(minBlockOfKnownECSState, blockOfEcsStateForWorld)
	}
	return state, minBlockOfKnownECSState
}

func getInitialState(worldAddress string) (ECSState, uint64) {
	// Check if a local snapshot is available, and if yes, sync from that.
	if !IsSnaphotAvailableLatest(worldAddress) {
		return getEmptyState(), 0
	}

	stateSnapshot := decodeSnapshot(readStateLatest(worldAddress))
	return snapshotToState(stateSnapshot), uint64(stateSnapshot.EndBlockNumber)
}

func createStateValue(state ECSState, componentId string) ECSState {
	state[componentId] = &sync.Map{}
	return state
}

func setStateValue(state ECSState, componentId string, entityId string, value []byte) ECSState {
	// TODO: this step can be optimized away since the 'ComponentRegistered' event is responsible
	// for this to be populated.
	if _, ok := state[componentId]; !ok {
		state[componentId] = &sync.Map{}
	}
	state[componentId].Store(entityId, value)
	return state
}

func deleteStateValue(state ECSState, componentId string, entityId string) ECSState {
	state[componentId].Delete(entityId)
	return state
}

func reduceLogsIntoState(state ChainECSState, filteredLogs []types.Log) ChainECSState {
	for _, eventLog := range filteredLogs {
		// The first element in the topics array is always the hash of the event signature.
		eventSignatureHash := eventLog.Topics[0].Hex()

		// Get the address that has generated this event / log. All events are assumed to be
		// emittited by the World.
		worldAddress := eventLog.Address

		if eventSignatureHash == eth.ComputeEventFingerprint("ComponentRegistered") {
			emittedEvent, err := eth.ParseEventComponentRegistered(eventLog)
			state = reduceChainECSStateRegisteredEventFromWorld(state, worldAddress, emittedEvent, err)
		} else if eventSignatureHash == eth.ComputeEventFingerprint("ComponentValueSet") {
			emittedEvent, err := eth.ParseEventComponentValueSet(eventLog)
			state = reduceChainECSStateValueSetEventFromWorld(state, worldAddress, emittedEvent, err)
		} else if eventSignatureHash == eth.ComputeEventFingerprint("ComponentValueRemoved") {
			emittedEvent, err := eth.ParseEventComponentValueRemoved(eventLog)
			state = reduceChainECSStateValueRemovedEventFromWorld(state, worldAddress, emittedEvent, err)
		} else {
			logger.GetLogger().Error("got unexpected event",
				zap.String("eventSignatureHash", eventSignatureHash),
				zap.ByteString("eventLog.Data", eventLog.Data),
			)
		}
	}
	return state
}

func reduceChainECSStateRegisteredEventFromWorld(state ChainECSState, worldAddress common.Address, event *world.WorldComponentRegistered, err error) ChainECSState {
	worldAddressString := worldAddress.Hex()
	state = createEmptyECSStateIfNeeded(state, worldAddressString)
	state[worldAddressString] = processRegisteredEvent(state[worldAddressString], event, err)
	return state
}

func reduceChainECSStateValueSetEventFromWorld(state ChainECSState, worldAddress common.Address, event *world.WorldComponentValueSet, err error) ChainECSState {
	worldAddressString := worldAddress.Hex()
	state = createEmptyECSStateIfNeeded(state, worldAddressString)
	state[worldAddressString] = processValueSetEvent(state[worldAddressString], event, err)
	return state
}

func reduceChainECSStateValueRemovedEventFromWorld(state ChainECSState, worldAddress common.Address, event *world.WorldComponentValueRemoved, err error) ChainECSState {
	worldAddressString := worldAddress.Hex()
	state = createEmptyECSStateIfNeeded(state, worldAddressString)
	state[worldAddressString] = processValueRemovedEvent(state[worldAddressString], event, err)
	return state
}

func processRegisteredEvent(state ECSState, event *world.WorldComponentRegistered, err error) ECSState {
	if err != nil {
		logger.GetLogger().Fatal("failed to process WorldComponentRegistered event", zap.Error(err))
	}
	componentId := hexutil.EncodeBig(event.ComponentId)
	return createStateValue(state, componentId)
}

func processValueSetEvent(state ECSState, event *world.WorldComponentValueSet, err error) ECSState {
	if err != nil {
		logger.GetLogger().Fatal("failed to process WorldComponentValueSet event", zap.Error(err))
	}
	componentId := hexutil.EncodeBig(event.ComponentId)
	entityId := hexutil.EncodeBig(event.Entity)
	return setStateValue(state, componentId, entityId, event.Data)
}

func processValueRemovedEvent(state ECSState, event *world.WorldComponentValueRemoved, err error) ECSState {
	if err != nil {
		logger.GetLogger().Fatal("failed to process WorldComponentValueRemoved event", zap.Error(err))
	}
	componentId := hexutil.EncodeBig(event.ComponentId)
	entityId := hexutil.EncodeBig(event.Entity)
	return deleteStateValue(state, componentId, entityId)
}

func createEmptyECSStateIfNeeded(state ChainECSState, worldAddress string) ChainECSState {
	if _, ok := state[worldAddress]; !ok {
		state[worldAddress] = getEmptyState()
		logger.GetLogger().Info("created empty ECSState for world address", zap.String("worldAddress", worldAddress))
	}
	return state
}
