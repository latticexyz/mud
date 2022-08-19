package main

import (
	"flag"

	eth "latticexyz/mud/packages/services/pkg/eth"
	grpc "latticexyz/mud/packages/services/pkg/grpc"
	"latticexyz/mud/packages/services/pkg/logger"
	"latticexyz/mud/packages/services/pkg/multiplexer"
	"latticexyz/mud/packages/services/pkg/stream"
)

var (
	wsUrl = flag.String("ws-url", "ws://localhost:8545", "Websocket Url")
	port  = flag.Int("port", 50051, "gRPC Server Port")
)

func main() {
	// Parse command line flags.
	flag.Parse()

	// Setup logging.
	logger.InitLogger()
	logger := logger.GetLogger()
	defer logger.Sync()

	// Get an instance of ethereum client.
	ethclient := eth.GetEthereumClient(*wsUrl, logger)

	// Get an instance of a multiplexer that will use channels to make data available.
	multiplexer := multiplexer.NewMultiplexer()
	go multiplexer.Start()

	// Start the gRPC server and pass in the channel that the server can receive piped data from.
	go grpc.StartStreamServer(*port, ethclient, multiplexer, logger)

	// Start the service (which will subscribe to the ethereum client data). Pass in the channel
	// that the service will use to pipe the data.
	stream.Start(ethclient, multiplexer, logger)
}
