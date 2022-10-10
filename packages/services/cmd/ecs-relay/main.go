package main

import (
	"flag"

	"latticexyz/mud/packages/services/pkg/eth"
	"latticexyz/mud/packages/services/pkg/grpc"
	"latticexyz/mud/packages/services/pkg/logger"
	"latticexyz/mud/packages/services/pkg/relay"
)

var (
	wsUrl                  = flag.String("ws-url", "ws://localhost:8545", "Websocket Url")
	port                   = flag.Int("port", 50071, "gRPC Server Port")
	idleTimeoutTime        = flag.Int("idle-timeout-time", 30, "Time in seconds after which a client connection times out. Defaults to 30s")
	idleDisconnectIterval  = flag.Int("idle-disconnect-interval", 60, "Time in seconds for how oftern to disconnect idle clients. Defaults to 60s")
	messsageDriftTime      = flag.Int("message-drift-time", 5, "Time in seconds that is acceptable as drift before message is not relayed. Defaults to 5s")
	minAccountBalance      = flag.Int("min-account-balance", 1000000000000000, "Minimum balance for an account to get its messages relayed. Defaults to 1e15")
	verifyMessageSignature = flag.Bool("verify-msg-sig", false, "Whether to service-side verify the signature on each relayed message. Defaults to false.")
	verifyAccountBalance   = flag.Bool("verify-account-balance", false, "Whether to service-side verify that the account has sufficient balance when relaying message. Defaults to false.")
	messageRateLimit       = flag.Int("msg-rate-limit", 10, "Rate limit for messages per second that a single client can push to be relayed. Defaults to 10")
)

func main() {
	// Parse command line flags.
	flag.Parse()

	// Setup logging.
	logger.InitLogger()
	logger := logger.GetLogger()
	defer logger.Sync()

	// Build a config.
	config := &relay.RelayServerConfig{
		IdleTimeoutTime:        *idleTimeoutTime,
		IdleDisconnectIterval:  *idleDisconnectIterval,
		MessageDriftTime:       *messsageDriftTime,
		MinAccountBalance:      *minAccountBalance,
		VerifyMessageSignature: *verifyMessageSignature,
		VerifyAccountBalance:   *verifyAccountBalance,
		MessageRateLimit:       *messageRateLimit,
	}

	// Get an instance of ethereum client.
	ethClient := eth.GetEthereumClient(*wsUrl, logger)

	// Start gRPC server and the relayer.
	grpc.StartRelayServer(*port, ethClient, config, logger)
}
