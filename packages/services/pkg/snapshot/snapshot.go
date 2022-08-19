package snapshot

import (
	"bytes"
	"fmt"
	"io/ioutil"
	"latticexyz/mud/packages/services/pkg/logger"
	pb "latticexyz/mud/packages/services/protobuf/go-ecs-snapshot"

	"math"
	"os"
	"sort"
	"time"

	"github.com/ethereum/go-ethereum/crypto"
	"go.uber.org/zap"
	"google.golang.org/protobuf/proto"
)

type SnapshotType int

const (
	Latest SnapshotType = iota
	BlockSpecific
	InitialSync
)

func snapshotTypeToName(snapshotType SnapshotType) (string, error) {
	if snapshotType == Latest {
		return "latest", nil
	} else if snapshotType == BlockSpecific {
		return "block range", nil
	} else if snapshotType == InitialSync {
		return "initial sync", nil
	} else {
		return "", fmt.Errorf("received unsupported SnapshotType")
	}
}

func isSnaphotAvailableLatest(worldAddress string) bool {
	_, err := os.Stat(getSnapshotFilenameLatest(worldAddress))
	return err == nil
}

func getSnapshotFilenameInitialSync() string {
	return fmt.Sprintf("%s-initial-sync", SerializedStateFilename)
}

func getSnapshotFilenameAtBlock(endBlockNumber uint64) string {
	return fmt.Sprintf("%s-%d", SerializedStateFilename, endBlockNumber)
}

func getSnapshotFilenameLatest(worldAddress string) string {
	return fmt.Sprintf("%s-latest-%s", SerializedStateFilename, worldAddress)
}

func encodeState(state ECSState, startBlockNumber uint64, endBlockNumber uint64) []byte {
	stateSnapshot := stateToSnapshot(state, startBlockNumber, endBlockNumber)
	encoding, err := proto.Marshal(stateSnapshot)
	if err != nil {
		logger.GetLogger().Error("failed to encode ECSState", zap.Error(err))
	}
	return encoding
}

func decodeState(encoding []byte) ECSState {
	stateSnapshot := decodeSnapshot(encoding)
	state := snapshotToState(stateSnapshot)
	return state
}

func decodeSnapshot(encoding []byte) *pb.ECSStateSnapshot {
	stateSnapshot := &pb.ECSStateSnapshot{}
	if err := proto.Unmarshal(encoding, stateSnapshot); err != nil {
		logger.GetLogger().Error("failed to decode ECSState", zap.Error(err))
	}
	return stateSnapshot
}

func stateToSnapshot(state ECSState, startBlockNumber uint64, endBlockNumber uint64) *pb.ECSStateSnapshot {
	stateSnapshot := &pb.ECSStateSnapshot{}

	var rawStateBuffer bytes.Buffer
	tsStart := time.Now()

	// List of components and entities strings. We pad by one to avoid protobufs omitting
	// our data.
	components := []string{"0x0"}
	entities := []string{"0x0"}

	// Map of components / entities to their position in an array. This helps us
	// assign the correct values to the ECSState slices as we build the snapshot.
	componentToIdx := map[string]uint32{}
	entitiyToIdx := map[string]uint32{}

	// Indexes tracking the position of every component and entity in the array.
	componentIdx := uint32(1)
	entityIdx := uint32(1)

	componentKeys := []string{}
	for k := range state {
		componentKeys = append(componentKeys, k)
	}
	sort.Strings(componentKeys)

	for _, componentId := range componentKeys {
		_state := state[componentId]

		if _, ok := componentToIdx[componentId]; !ok {
			components = append(components, componentId)
			componentToIdx[componentId] = componentIdx
			componentIdx++
		}

		entityKeys := []string{}
		for k := range _state {
			entityKeys = append(entityKeys, k)
		}
		sort.Strings(entityKeys)

		for _, entityId := range entityKeys {
			value := _state[entityId]

			if _, ok := entitiyToIdx[entityId]; !ok {
				entities = append(entities, entityId)
				entitiyToIdx[entityId] = entityIdx
				entityIdx++
			}

			stateSlice := &pb.ECSState{
				ComponentIdIdx: componentToIdx[componentId],
				EntityIdIdx:    entitiyToIdx[entityId],
				Value:          value,
			}
			stateSnapshot.State = append(stateSnapshot.State, stateSlice)

			rawStateBuffer.WriteString(componentId)
			rawStateBuffer.WriteString(entityId)
			rawStateBuffer.Write(value)
		}
	}

	stateSnapshot.StateComponents = components
	stateSnapshot.StateEntities = entities
	stateSnapshot.StateHash = crypto.Keccak256Hash(rawStateBuffer.Bytes()).String()

	stateSnapshot.StartBlockNumber = uint32(startBlockNumber)
	stateSnapshot.EndBlockNumber = uint32(endBlockNumber)

	tsElapsed := time.Since(tsStart)
	logger.GetLogger().Info("computed hash of snapshot", zap.String("category", "Snapshot"), zap.String("keccak256Hash", stateSnapshot.StateHash), zap.String("timeTaken", tsElapsed.String()))

	return stateSnapshot
}

func snapshotToState(stateSnapshot *pb.ECSStateSnapshot) ECSState {
	state := getEmptyState()

	components := stateSnapshot.StateComponents
	entities := stateSnapshot.StateEntities

	for _, stateSlice := range stateSnapshot.State {
		// First read the indexes from the snapshot, then lookup the actual
		// component / entity id values from the array.
		componentIdIdx := stateSlice.ComponentIdIdx
		entityIdIdx := stateSlice.EntityIdIdx
		value := stateSlice.Value

		componentId := components[componentIdIdx]
		entityId := entities[entityIdIdx]

		if _, ok := state[componentId]; !ok {
			state[componentId] = map[string][]byte{}
		}
		state[componentId][entityId] = value
	}
	return state
}

func writeStateInitialSync(encoding []byte) {
	writeState(encoding, getSnapshotFilenameInitialSync())
}

func writeStateAtBlock(encoding []byte, endBlockNumber uint64) {
	writeState(encoding, getSnapshotFilenameAtBlock(endBlockNumber))
}

func writeStateLatest(encoding []byte, worldAddress string) {
	writeState(encoding, getSnapshotFilenameLatest(worldAddress))
}

func writeState(encoding []byte, fileName string) {
	if err := ioutil.WriteFile(fileName, encoding, 0644); err != nil {
		logger.GetLogger().Fatal("failed to write ECSState", zap.String("fileName", fileName), zap.Error(err))
	}
}

func readStateAtBlock(blockNumber uint64) []byte {
	return readState(getSnapshotFilenameAtBlock(blockNumber))
}

func readStateLatest(worldAddress string) []byte {
	return readState(getSnapshotFilenameLatest(worldAddress))
}

func readState(fileName string) []byte {
	encoding, err := ioutil.ReadFile(fileName)
	if err != nil {
		logger.GetLogger().Fatal("failed to read encoded state", zap.String("fileName", fileName), zap.Error(err))
	}
	return encoding
}

func takeStateSnapshotChain(chainState ChainECSState, startBlockNumber uint64, endBlockNumber uint64, snapshotType SnapshotType) {
	logger.GetLogger().Info("taking full chain state snapshot",
		zap.String("category", "Snapshot"),
	)
	worldAddresses := []string{}
	for worldAddress, ecsStateForWorld := range chainState {
		// Collect the list of worlds.
		worldAddresses = append(worldAddresses, worldAddress)

		// Serialize the state for a given world and take a snapshot.
		takeStateSnapshot(ecsStateForWorld, worldAddress, startBlockNumber, endBlockNumber, snapshotType)
	}
	// Take a snapshot of the world addresses.
	takeWorldAddressesSnapshot(worldAddresses)
}

func takeStateSnapshot(state ECSState, worldAddress string, startBlockNumber uint64, endBlockNumber uint64, snapshotType SnapshotType) {
	encoding := encodeState(state, startBlockNumber, endBlockNumber)

	snapshotTypeName, err := snapshotTypeToName(snapshotType)
	if err != nil {
		logger.GetLogger().Fatal("received an unsupported SnapshotType", zap.Int("snapshotType", int(snapshotType)))
	}
	logger.GetLogger().Info("taking snapshot",
		zap.String("category", "Snapshot"),
		zap.String("type", snapshotTypeName),
		zap.Uint64("startBlockNumber", startBlockNumber),
		zap.Uint64("endBlockNumber", endBlockNumber),
	)

	if snapshotType == Latest {
		writeStateLatest(encoding, worldAddress)
	} else if snapshotType == BlockSpecific {
		writeStateAtBlock(encoding, endBlockNumber)
	} else if snapshotType == InitialSync {
		writeStateInitialSync(encoding)
	}
}

func readStateSnapshotAtBlock(blockNumber uint64) ECSState {
	logger.GetLogger().Info("reading snapshot",
		zap.String("category", "Snapshot"),
		zap.Uint64("blockNumber", blockNumber),
	)
	return decodeState(readStateAtBlock(blockNumber))
}

func readStateSnapshotLatest(worldAddress string) ECSState {
	logger.GetLogger().Info("reading latest snapshot", zap.String("category", "Snapshot"))
	return decodeState(readStateLatest(worldAddress))
}

func rawReadStateSnapshotLatest(worldAddress string) *pb.ECSStateSnapshot {
	logger.GetLogger().Info("reading latest raw snapshot", zap.String("category", "Snapshot"))
	return decodeSnapshot(readStateLatest(worldAddress))
}

func chunkRawStateSnapshot(rawStateSnapshot *pb.ECSStateSnapshot, chunkPercentage int) []*pb.ECSStateSnapshot {
	chunked := []*pb.ECSStateSnapshot{}
	chunkIdx := 0
	chunkSize := int(math.Ceil(float64(len(rawStateSnapshot.State))/float64(100))) * chunkPercentage

	logger.GetLogger().Info("start chunking raw state snapshot", zap.String("category", "Snapshot"), zap.Int("fullStateLength", len(rawStateSnapshot.State)), zap.Int("chunkSize", chunkSize), zap.String("chunkPercentage", fmt.Sprintf("%d%%", chunkPercentage)))
	tsStart := time.Now()

	for chunkIdx < len(rawStateSnapshot.State) {
		chunkUpperBound := func(a, b int) int {
			if a < b {
				return a
			}
			return b
		}

		stateSlice := rawStateSnapshot.State[chunkIdx:chunkUpperBound(chunkIdx+chunkSize, len(rawStateSnapshot.State))]

		// List of ECSState, components, and entities re-indexed since here we are working with a slice of
		// the complete state.
		reIndexedStateSlice := []*pb.ECSState{}
		reIndexedComponents := []string{"0x0"}
		reIndexedEntities := []string{"0x0"}

		// Map of components / entities to their position in an array. This helps us
		// assign the correct values to the ECSState slices as we build the snapshot.
		componentToIdx := map[string]uint32{}
		entitiyToIdx := map[string]uint32{}

		// Indexes tracking the position of every component and entity in the array.
		componentIdx := uint32(1)
		entityIdx := uint32(1)

		for _, state := range stateSlice {
			// Get the actual string values for the component and entity.
			componentId := rawStateSnapshot.StateComponents[state.ComponentIdIdx]
			entityId := rawStateSnapshot.StateEntities[state.EntityIdIdx]

			// Add the component to the list and to the mapping.
			if _, ok := componentToIdx[componentId]; !ok {
				reIndexedComponents = append(reIndexedComponents, componentId)
				componentToIdx[componentId] = componentIdx
				componentIdx++
			}

			// Add the entity to the list and to the mapping.
			if _, ok := entitiyToIdx[entityId]; !ok {
				reIndexedEntities = append(reIndexedEntities, entityId)
				entitiyToIdx[entityId] = entityIdx
				entityIdx++
			}

			// Extend the ECSState by creating a new re-mapped element. The value stays the
			// same, but the component and entity indexes are now pointing to the components
			// and entities that are specific to this slice.
			reIndexedState := &pb.ECSState{
				ComponentIdIdx: componentToIdx[componentId],
				EntityIdIdx:    entitiyToIdx[entityId],
				Value:          state.Value,
			}
			reIndexedStateSlice = append(reIndexedStateSlice, reIndexedState)
		}

		chunk := &pb.ECSStateSnapshot{
			State:            reIndexedStateSlice,
			StateComponents:  reIndexedComponents,
			StateEntities:    reIndexedEntities,
			StateHash:        rawStateSnapshot.StateHash,
			StartBlockNumber: rawStateSnapshot.StartBlockNumber,
			EndBlockNumber:   rawStateSnapshot.EndBlockNumber,
		}
		chunked = append(chunked, chunk)
		chunkIdx += chunkSize
	}

	tsElapsed := time.Since(tsStart)
	logger.GetLogger().Info("done chunking raw state snapshot", zap.String("category", "Snapshot"), zap.Int("numChunks", len(chunked)), zap.String("timeTaken", tsElapsed.String()))

	return chunked
}

///
/// World list state snapshots.
///

func worldSnapshotToWorldAddressList(snapshot *pb.Worlds) []string {
	worldAddresses := []string{}
	for _, worldAddress := range snapshot.WorldAddress {
		worldAddresses = append(worldAddresses, worldAddress)
	}
	return worldAddresses
}

func worldAddressListToWorldsSnapshot(worldAddresses []string) *pb.Worlds {
	worlds := &pb.Worlds{}

	for _, worldAddress := range worldAddresses {
		worlds.WorldAddress = append(worlds.WorldAddress, worldAddress)
	}
	return worlds
}

func encodeWorldAddresses(worldAddresses []string) []byte {
	worlds := worldAddressListToWorldsSnapshot(worldAddresses)
	encoding, err := proto.Marshal(worlds)
	if err != nil {
		logger.GetLogger().Error("failed to encode World addresses", zap.Error(err))
	}
	return encoding
}

func decodeWorldAddresses(encoding []byte) *pb.Worlds {
	worldsSnapshot := &pb.Worlds{}
	if err := proto.Unmarshal(encoding, worldsSnapshot); err != nil {
		logger.GetLogger().Error("failed to decode World addresses snapshot", zap.Error(err))
	}
	return worldsSnapshot
}

func takeWorldAddressesSnapshot(worldAddresses []string) {
	logger.GetLogger().Info("taking world addresses snapshot",
		zap.String("category", "Snapshot"),
		zap.Int("countAdresses", len(worldAddresses)),
	)
	encoding := encodeWorldAddresses(worldAddresses)

	if err := ioutil.WriteFile(SerializedWorldsFilename, encoding, 0644); err != nil {
		logger.GetLogger().Fatal("failed to write World addresses state", zap.String("fileName", SerializedWorldsFilename), zap.Error(err))
	}
}

func readWorldAddressesSnapshot() []string {
	if !isWorldAddressSnapshotAvailable() {
		return []string{}
	}
	encoding := readState(SerializedWorldsFilename)
	worlds := decodeWorldAddresses(encoding)
	worldAddressList := worldSnapshotToWorldAddressList(worlds)
	return worldAddressList
}

func rawReadWorldAddressesSnapshot() *pb.Worlds {
	return decodeWorldAddresses(readState(SerializedWorldsFilename))
}

func isWorldAddressSnapshotAvailable() bool {
	_, err := os.Stat(SerializedWorldsFilename)
	return err == nil
}
