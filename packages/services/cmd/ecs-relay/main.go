/*
ecs-relay acts as an arbitrary, configurable message relay for data that does not *have* to go on
chain but which an application built with MUD can plug in to utilize seamlessly. The relay service
is configurable to support arbitrary messages, messages with signatures, signature verification, and
conditions for message relay, such as "do not relay message if balance < threshold" for DDoS prevention.

By default, ecs-relay attempts to connect to a local development chain.

Usage:

    ecs-relay [flags]

The flags are:

    -ws-url
        Websocket URL for getting data about accounts from the chain, such as the account balance.
    -port
        Port to expose the gRPC server.
	-idle-timeout-time
		Time in seconds after which a client connection times out. Defaults to 30s.
	-idle-disconnect-interval
		Time in seconds for how often to disconnect idle clients. Defaults to 60s.
	-message-drift-time
		Time in seconds that is acceptable as drift before message is not relayed. Defaults to 5s.
	-min-account-balance
		Minimum balance in wei for an account to get its messages relayed. Defaults to 0.001 ETH.
	-max-data-size
		Size limit for message data. Defaults to 1024 bytes.
	-verify-msg-sig
		Whether to service-side verify the signature on each relayed message. Defaults to false.
	-verify-account-balance
		Whether to service-side verify that the account has sufficient balance when relaying message. Defaults to false.
	-verify-data-size
		Whether to service-side verify that size of the data of messages doesn't surpass max-data-size. Defaults to false.
	-msg-rate-limit
		Rate limit for messages per second that a single client can push to be relayed. Defaults to 10.
	-metrics-port
		Prometheus metrics http handler port. Defaults to port 6060.
*/

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
	idleDisconnectInterval = flag.Int("idle-disconnect-interval", 60, "Time in seconds for how often to disconnect idle clients. Defaults to 60s")
	messageDriftTime       = flag.Int("message-drift-time", 5, "Time in seconds that is acceptable as drift before message is not relayed. Defaults to 5s")
	minAccountBalance      = flag.Float64("min-account-balance", 0.001, "Minimum balance in ETH for an account to get its messages relayed. Defaults to 0.001 ETH")
	maxDataSize            = flag.Int("max-data-size", 1024, "Size limit for message data. Defaults to 1024 bytes")
	verifyMessageSignature = flag.Bool("verify-msg-sig", false, "Whether to service-side verify the signature on each relayed message. Defaults to false")
	verifyAccountBalance   = flag.Bool("verify-account-balance", false, "Whether to service-side verify that the account has sufficient balance when relaying message. Defaults to false")
	verifyDataSize         = flag.Bool("verify-data-size", false, "Whether to service-side verify that size of the data of messages doesn't surpass max-data-size. Defaults to false")
	messageRateLimit       = flag.Int("msg-rate-limit", 10, "Rate limit for messages per second that a single client can push to be relayed. Defaults to 10")
	metricsPort            = flag.Int("metrics-port", 6060, "Prometheus metrics http handler port. Defaults to port 6060")
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
		IdleDisconnectInterval: *idleDisconnectInterval,
		MessageDriftTime:       *messageDriftTime,
		MinAccountBalance:      *minAccountBalance,
		MaxDataSize:            *maxDataSize,
		VerifyMessageSignature: *verifyMessageSignature,
		VerifyAccountBalance:   *verifyAccountBalance,
		VerifyDataSize:         *verifyDataSize,
		MessageRateLimit:       *messageRateLimit,
	}

	// Get an instance of ethereum client.
	ethClient := eth.GetEthereumClient(*wsUrl, logger)

	// Start gRPC server and the relayer.
	grpc.StartRelayServer(*port, *metricsPort, ethClient, config, logger)
}
