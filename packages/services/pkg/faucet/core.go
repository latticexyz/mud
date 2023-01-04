package faucet

import (
	"fmt"
	"io/ioutil"
	"latticexyz/mud/packages/services/pkg/logger"
	"latticexyz/mud/packages/services/pkg/utils"
	"os"
	"strings"
	"time"

	"github.com/dghubble/go-twitter/twitter"
	"github.com/keith-turner/ecoji"
	"go.uber.org/zap"
	"google.golang.org/protobuf/proto"

	pb "latticexyz/mud/packages/services/protobuf/go/faucet"
)

type DripConfig struct {
	DripAmount    float64
	DripFrequency float64
	DripLimit     float64
	DevMode       bool
	TwitterMode   bool

	// Miscellaneous.
	NumLatestTweetsForVerify int
	NameSystemAddress        string
}

func TwitterUsernameQuery(username string) string {
	return fmt.Sprintf("from:%s", username)
}

func FindEmojiPosition(tweetText string) (int, error) {
	runes := []rune(tweetText)

	for i := 0; i < len(runes); i++ {
		r := runes[i]
		if r > 128 {
			return i, nil
		}
	}
	return -1, fmt.Errorf("no emoji signature found in tweet: %s", tweetText)
}

func ExtractSignatureFromTweet(tweet twitter.Tweet) (string, error) {
	// Find where the signature begins. We do this by finding the first emoji.
	tweetText := tweet.FullText
	signatureStart, err := FindEmojiPosition(tweetText)
	if err != nil {
		return "", err
	}
	signature := tweetText[signatureStart:]

	in := strings.NewReader(signature)
	out := new(strings.Builder)

	if err := ecoji.Decode(in, out); err != nil {
		return "", fmt.Errorf("error while decoding emoji: %s", err.Error())
	}

	return out.String(), nil
}

func VerifyDripRequest(tweets []twitter.Tweet, username string, address string, numLatestTweets int) error {
	for idx := 0; idx < utils.Min(len(tweets), numLatestTweets); idx++ {
		err := VerifyDripRequestTweet(tweets[idx], username, address)
		if err == nil {
			return nil
		}
		logger.GetLogger().Info("error while verifying tweet", zap.String("username", username), zap.Int("tweet", idx), zap.Error(err))
	}
	return fmt.Errorf("did not find drip tweet in latest %d tweets from user @%s", numLatestTweets, username)
}

func VerifyDripRequestTweet(tweet twitter.Tweet, username string, address string) error {
	tweetSignature, err := ExtractSignatureFromTweet(tweet)
	if err != nil {
		return err
	}

	isVerified, recoveredAddress, err := utils.VerifySig(
		address,
		tweetSignature,
		[]byte(fmt.Sprintf("%s tweetooor requesting drip to %s address", username, address)),
	)
	if err != nil {
		return fmt.Errorf("error verifying signature: %s", err.Error())
	}
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

func GetTotalDripCount() float64 {
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

func SetTotalDripCount(dripCount float64, store *pb.FaucetStore) {
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
	SetTotalDripCount(store.TotalDripCount+dripConfig.DripAmount, store)

	// Write the updated store to file.
	writeStore(
		encodeStore(store),
		FaucetStoreFilename,
	)

	logger.GetLogger().Info("incremented total drip amount by one drip increment",
		zap.Float64("current (ETH)", store.TotalDripCount),
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
	utils.EnsureDir(FaucetStoreDir)

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
