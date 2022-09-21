package main

import (
	"flag"

	"latticexyz/mud/packages/services/pkg/grpc"
	"latticexyz/mud/packages/services/pkg/logger"
)

var (
	port = flag.Int("port", 50071, "gRPC Server Port")
)

func main() {
	// Parse command line flags.
	flag.Parse()

	// Setup logging.
	logger.InitLogger()
	logger := logger.GetLogger()
	defer logger.Sync()

	// Start gRPC server and the relayer.
	grpc.StartRelayServer(*port, logger)
}
