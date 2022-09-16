/*
ecs-stream multiplexes ECS event data by subscribing to a feed of data from a chain and allowing
multiple clients to selectively subscribe to subsets of the data which they care about.

It exposes a gRPC RPC server for opening a stream data cursor and a gRPC-web HTTP server wrapper
to allow clients which are web applications to open a cursor with a POST request. Once the cursor
is opened, data will be piped via a channel and returned to the client via gRPC unless there is a
chain disconnect or when a client purposefully closes the cursor and disconnects. At that time, the
service will clean up the channel subscription and only keep piping data into the channels that
have a client connected.

By default, ecs-stream attempts to connect to a local development chain.

Usage:

    ecs-stream [flags]

The flags are:

    -ws-url
        Websocket URL for getting block data from chain.
    -port
        Port to expose the gRPC server.

*/
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
