package faucet

import (
	"fmt"
	"io/ioutil"
	"latticexyz/mud/packages/services/pkg/logger"
	"os"
	"strings"
	"time"

	"github.com/dghubble/go-twitter/twitter"
	"github.com/ethereum/go-ethereum/accounts"
	"github.com/ethereum/go-ethereum/common/hexutil"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/keith-turner/ecoji"
	"go.uber.org/zap"
	"google.golang.org/protobuf/proto"

	pb "latticexyz/mud/packages/services/protobuf/go/faucet"
)

type DripConfig struct {
	DripAmount    int64
	DripFrequency float64
	DripLimit     uint64
	DevMode       bool
}

func TwitterUsernameQuery(username string) string {
	return fmt.Sprintf("from:%s", username)
}

func VerifySig(from, sigHex string, msg []byte) (bool, string) {
	sig := hexutil.MustDecode(sigHex)

	msg = accounts.TextHash(msg)
	if sig[crypto.RecoveryIDOffset] == 27 || sig[crypto.RecoveryIDOffset] == 28 {
		sig[crypto.RecoveryIDOffset] -= 27 // Transform yellow paper V from 27/28 to 0/1
	}

	recovered, err := crypto.SigToPub(msg, sig)
	if err != nil {
		return false, ""
	}

	recoveredAddr := crypto.PubkeyToAddress(*recovered)

	return from == recoveredAddr.Hex(), recoveredAddr.Hex()
}

func ExtractSignatureFromTweet(tweet twitter.Tweet) (string, error) {
	// TODO: decide on format of tweet to recover sig.
	in := strings.NewReader(tweet.FullText)
	out := new(strings.Builder)

	if err := ecoji.Decode(in, out); err != nil {
		return "", fmt.Errorf("error while decoding emoji: %s", err.Error())
	}

	return out.String(), nil
}

func VerifyDripRequestTweet(tweet twitter.Tweet, username string, address string) error {
	tweetSignature, err := ExtractSignatureFromTweet(tweet)
	if err != nil {
		return err
	}

	isVerified, recoveredAddress := VerifySig(
		address,
		tweetSignature,
		[]byte(fmt.Sprintf("%s tweetooor requesting drip to %s address", username, address)),
	)
	if !isVerified {
		return fmt.Errorf("recovered address %s != provided address %s", recoveredAddress, address)
	}
	return nil
}

func readStore(fileName string) []byte {
	encoding, err := ioutil.ReadFile(fileName)
	if err != nil {
		logger.GetLogger().Fatal("failed to read encoded store", zap.String("fileName", fileName), zap.Error(err))
	}
	return encoding
}

func writeStore(encoding []byte, fileName string) {
	if err := ioutil.WriteFile(fileName, encoding, 0644); err != nil {
		logger.GetLogger().Fatal("failed to write FaucetStore", zap.String("fileName", fileName), zap.Error(err))
	}
}

func decodeStore(encoding []byte) *pb.FaucetStore {
	store := &pb.FaucetStore{}
	if err := proto.Unmarshal(encoding, store); err != nil {
		logger.GetLogger().Error("failed to decode FaucetStore", zap.Error(err))
	}
	return store
}

func encodeStore(store *pb.FaucetStore) []byte {
	encoding, err := proto.Marshal(store)
	if err != nil {
		logger.GetLogger().Error("failed to encode FaucetStore", zap.Error(err))
	}
	return encoding
}

func GetStore() *pb.FaucetStore {
	return decodeStore(readStore(FaucetStoreFilename))
}

func GetAddressForUsername(username string) string {
	store := GetStore()
	if address, ok := store.UsernameToAddress[username]; ok {
		return address
	}
	return ""
}

func GetUsernameForAddress(address string) string {
	store := GetStore()
	if username, ok := store.AddressToUsername[address]; ok {
		return username
	}
	return ""
}

func GetTimestampForDrip(address string) int64 {
	store := GetStore()
	if dripTimestamp, ok := store.LatestDrip[address]; ok {
		return dripTimestamp
	}
	return 0
}

func GetTotalDripCount() uint64 {
	store := GetStore()
	return store.TotalDripCount
}

func SetUsernameForAddress(username string, address string, store *pb.FaucetStore) {
	if store.AddressToUsername == nil {
		store.AddressToUsername = map[string]string{}
	}
	store.AddressToUsername[address] = username
}

func SetAddressForUsername(address string, username string, store *pb.FaucetStore) {
	if store.UsernameToAddress == nil {
		store.UsernameToAddress = map[string]string{}
	}
	store.UsernameToAddress[username] = address
}

func SetTimestampForDrip(address string, timestamp int64, store *pb.FaucetStore) {
	if store.LatestDrip == nil {
		store.LatestDrip = map[string]int64{}
	}
	store.LatestDrip[address] = timestamp
}

func SetTotalDripCount(dripCount uint64, store *pb.FaucetStore) {
	store.TotalDripCount = dripCount
}

func LinkAddressAndUsername(address string, username string) {
	// Get current store from file.
	store := GetStore()

	// Update store to link.
	SetUsernameForAddress(username, address, store)
	SetAddressForUsername(address, username, store)

	// Write the updated store to file.
	writeStore(
		encodeStore(store),
		FaucetStoreFilename,
	)

	logger.GetLogger().Info("linked username to address and updated store",
		zap.String("username", username),
		zap.String("address", address),
	)
}

func UpdateDripRequestTimestamp(address string) {
	// Get current store from file.
	store := GetStore()

	// Update timestamp for address.
	timestamp := time.Now().Unix()
	SetTimestampForDrip(address, timestamp, store)

	// Write the updated store to file.
	writeStore(
		encodeStore(store),
		FaucetStoreFilename,
	)

	logger.GetLogger().Info("updated drip request timestamp",
		zap.String("address", address),
		zap.Int64("timestamp", timestamp),
	)
}

func IncrementTotalDripCount(dripConfig *DripConfig) {
	// Get current store from file.
	store := GetStore()

	// Update the total drip count to current count + drip amount.
	SetTotalDripCount(store.TotalDripCount+uint64(dripConfig.DripAmount), store)

	// Write the updated store to file.
	writeStore(
		encodeStore(store),
		FaucetStoreFilename,
	)

	logger.GetLogger().Info("incremented total drip amount by one drip increment",
		zap.Uint64("current", store.TotalDripCount),
	)
}

func ResetTotalDripCount() {
	// Get current store from file.
	store := GetStore()

	// Update the total drip count to zero.
	SetTotalDripCount(0, store)

	// Write the updated store to file.
	writeStore(
		encodeStore(store),
		FaucetStoreFilename,
	)

	logger.GetLogger().Info("reset total drip count to zero")
}

func SetupStore() {
	_, err := os.Stat(FaucetStoreFilename)
	if err != nil {
		// Write an empty store.
		writeStore(
			encodeStore(&pb.FaucetStore{
				AddressToUsername: map[string]string{},
				UsernameToAddress: map[string]string{},
				LatestDrip:        map[string]int64{},
				TotalDripCount:    0,
			}),
			FaucetStoreFilename,
		)
	}
}

func ReplenishFaucetWorker(ticker *time.Ticker, quit chan struct{}) {
	for {
		select {
		case <-ticker.C:
			ResetTotalDripCount()
			logger.GetLogger().Info("replenished faucet")
		case <-quit:
			ticker.Stop()
			return
		}
	}
}
