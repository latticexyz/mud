package main

import (
	"context"
	"crypto/ecdsa"
	"flag"
	"os"
	"time"

	"latticexyz/mud/packages/services/pkg/eth"
	"latticexyz/mud/packages/services/pkg/faucet"
	"latticexyz/mud/packages/services/pkg/grpc"
	"latticexyz/mud/packages/services/pkg/logger"

	"github.com/dghubble/go-twitter/twitter"
	"github.com/ethereum/go-ethereum/crypto"
	"go.uber.org/zap"
	"golang.org/x/oauth2/clientcredentials"
)

var (
	wsUrl             = flag.String("ws-url", "ws://localhost:8545", "Websocket Url")
	port              = flag.Int("port", 50081, "gRPC Server Port")
	faucetPrivateKey  = flag.String("faucet-private-key", "0x", "Private key to use for faucet")
	dripAmount        = flag.Int64("drip-amount", 10000000000000000, "Drip amount in wei. Default to 0.01 ETH")
	dripFrequency     = flag.Float64("drip-frequency", 1, "Drip frequency per account in minutes. Default to 60 minutes")
	dripLimit         = flag.Uint64("drip-limit", 1000000000000000000, "Drip limit in wei per drip frequency interval. Default to 1 ETH")
	numLatestTweets   = flag.Int("num-latest-tweets", 5, "Number of latest tweets to check per user when verifying drip tweet. Default to 5")
	nameSystemAddress = flag.String("name-system-address", "", "Address of NameSystem to set an address/username mapping when verifying drip tweet. Not specified by default")
	devMode           = flag.Bool("dev", false, "Flag to run the faucet in dev mode, where verification is not required. Default to false")
	metricsPort       = flag.Int("metrics-port", 6060, "Prometheus metrics http handler port. Defaults to port 6060")
)

func main() {
	// Parse command line flags.
	flag.Parse()

	// Setup logging.
	logger.InitLogger()
	logger := logger.GetLogger()
	defer logger.Sync()

	// Create a drip config.
	dripConfig := &faucet.DripConfig{
		DripAmount:               *dripAmount,
		DripFrequency:            *dripFrequency,
		DripLimit:                *dripLimit,
		DevMode:                  *devMode,
		NumLatestTweetsForVerify: *numLatestTweets,
		NameSystemAddress:        *nameSystemAddress,
	}
	logger.Info("using a drip configuration",
		zap.Int64("amount", dripConfig.DripAmount),
		zap.Float64("frequency", dripConfig.DripFrequency),
		zap.Uint64("limit", dripConfig.DripLimit),
		zap.Bool("dev", dripConfig.DevMode),
	)

	// Ensure that a twitter <-> address store is setup.
	faucet.SetupStore()

	// Oauth2 configures a client that uses app credentials to keep a fresh token.
	config := &clientcredentials.Config{
		ClientID:     os.Getenv("CLIENT_ID"),
		ClientSecret: os.Getenv("CLIENT_SECRET"),
		TokenURL:     "https://api.twitter.com/oauth2/token",
	}

	// Get a connection to Twitter API with a client.
	twitterClient := twitter.NewClient(config.Client(context.Background()))

	// Get an instance of ethereum client.
	ethClient := eth.GetEthereumClient(*wsUrl, logger)

	// Create a private key ECDSA object.
	privateKey, err := crypto.HexToECDSA(*faucetPrivateKey)
	if err != nil {
		logger.Fatal("error creating ECDSA object from private key string", zap.String("privateKey", *faucetPrivateKey))
	}

	publicKey, ok := privateKey.Public().(*ecdsa.PublicKey)
	if !ok {
		logger.Fatal("error casting public key to ECDSA")
	}

	// Kick off a worked that will reset the faucet limit at the specified interval.
	// Note: the duration here matches whatever time units are used in 'drip-frequency'.
	go faucet.ReplenishFaucetWorker(time.NewTicker(time.Duration(*dripFrequency)*time.Minute), make(chan struct{}))

	// Start the faucet gRPC server.
	grpc.StartFaucetServer(*port, *metricsPort, twitterClient, ethClient, privateKey, publicKey, dripConfig, logger)
}
