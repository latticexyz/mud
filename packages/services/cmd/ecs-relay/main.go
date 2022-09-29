package main

import (
	"flag"

	"latticexyz/mud/packages/services/pkg/grpc"
	"latticexyz/mud/packages/services/pkg/logger"
	"latticexyz/mud/packages/services/pkg/relay"
)

var (
	port                  = flag.Int("port", 50071, "gRPC Server Port")
	idleTimeoutTime       = flag.Int("idle-timeout-time", 30, "Time in seconds after which a client connection times out. Defaults to 30s")
	idleDisconnectIterval = flag.Int("idle-disconnect-interval", 60, "Time in seconds for how oftern to disconnect idle clients. Defaults to 60s")
	messsageDriftTime     = flag.Int("message-drift-time", 60, "Time in seconds that is acceptable as drift before message is not relayed. Defaults to 5s")
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
		IdleTimeoutTime:       *idleTimeoutTime,
		IdleDisconnectIterval: *idleDisconnectIterval,
		MessageDriftTime:      *messsageDriftTime,
	}

	// Start gRPC server and the relayer.
	grpc.StartRelayServer(*port, config, logger)
}
