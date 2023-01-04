/*
faucet acts as a configurable faucet with in-service integrations for MUD transactions. Optionally, requests for drip can be gated behind Twitter signature verification.

By default, faucet attempts to connect to a local development chain.

Usage:

    faucet [flags]

The flags are:

    -ws-url
        Websocket URL for sending optional integrated MUD transactions to set Component values on, for example, successful drip.
    -port
        Port to expose the gRPC server.
	-dev
		Flag to run the faucet in dev mode, where verification is not required. Default to false.
	-faucet-private-key
		Private key to use for faucet.
	-drip-amount
		Drip amount in ETH. Default to 0.01 ETH
	-drip-frequency
		Drip frequency per account in minutes. Default to 60 minutes.
	-drip-limit
		Drip limit in ETH per drip frequency interval. Default to 1 ETH
	-twitter
		Flag to run the faucet in Twitter mode, where to receive a drip you have to tweet a signature. Default to false.
	-num-latest-tweets
		Number of latest tweets to check per user when verifying drip tweet. Default to 5.
	-name-system-address
		Address of NameSystem to set an address/username mapping when verifying drip tweet. Not specified by default.
	-metrics-port
		Prometheus metrics http handler port. Defaults to port 6060.
*/

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
	// General flags.
	wsUrl = flag.String("ws-url", "ws://localhost:8545", "Websocket Url")
	port  = flag.Int("port", 50081, "gRPC Server Port")
	// Dev mode.
	devMode = flag.Bool("dev", false, "Flag to run the faucet in dev mode, where verification is not required. Default to false")
	// Faucet configuration flags.
	faucetPrivateKey = flag.String("faucet-private-key", "0x", "Private key to use for faucet")
	// Drip configuration flags.
	dripAmount    = flag.Float64("drip-amount", 0.01, "Drip amount in ETH. Default to 0.01 ETH")
	dripFrequency = flag.Float64("drip-frequency", 60, "Drip frequency per account in minutes. Default to 60 minutes")
	dripLimit     = flag.Float64("drip-limit", 1, "Drip limit in ETH per drip frequency interval. Default to 1 ETH")
	// Flags for using twitter to verify drip requests.
	twitterMode       = flag.Bool("twitter", false, "Flag to run the faucet in Twitter mode, where to receive a drip you have to tweet a signature. Default to false")
	numLatestTweets   = flag.Int("num-latest-tweets", 5, "Number of latest tweets to check per user when verifying drip tweet. Default to 5")
	nameSystemAddress = flag.String("name-system-address", "", "Address of NameSystem to set an address/username mapping when verifying drip tweet. Not specified by default")
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
		TwitterMode:              *twitterMode,
		NumLatestTweetsForVerify: *numLatestTweets,
		NameSystemAddress:        *nameSystemAddress,
	}
	logger.Info("using a drip configuration",
		zap.Float64("amount", dripConfig.DripAmount),
		zap.Float64("frequency", dripConfig.DripFrequency),
		zap.Float64("limit", dripConfig.DripLimit),
		zap.Bool("dev", dripConfig.DevMode),
		zap.Bool("twitter", dripConfig.TwitterMode),
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
