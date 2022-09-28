package grpc

import (
	"fmt"
	multiplexer "latticexyz/mud/packages/services/pkg/multiplexer"
	"latticexyz/mud/packages/services/pkg/relay"
	pb_relay "latticexyz/mud/packages/services/protobuf/go/ecs-relay"
	pb_snapshot "latticexyz/mud/packages/services/protobuf/go/ecs-snapshot"
	pb_stream "latticexyz/mud/packages/services/protobuf/go/ecs-stream"
	"net"
	"net/http"

	"github.com/ethereum/go-ethereum/ethclient"
	"github.com/improbable-eng/grpc-web/go/grpcweb"
	"go.uber.org/zap"
	"google.golang.org/grpc"
	"google.golang.org/grpc/reflection"
)

func startRPCServer(grpcServer *grpc.Server, listener net.Listener, logger *zap.Logger) {
	if err := grpcServer.Serve(listener); err != nil {
		logger.Fatal("failed to serve", zap.String("category", "gRPC server"), zap.Error(err))
	}
}

func startHTTPServer(httpServer *http.Server, logger *zap.Logger) {
	if err := httpServer.ListenAndServe(); err != nil {
		logger.Fatal("failed to serve", zap.String("category", "http server"), zap.Error(err))
	}
}

// StartStreamServer starts a gRPC server and a HTTP web-gRPC server wrapper for an ECS stream
// service. The gRPC server is started at port and HTTP server at port + 1.
func StartStreamServer(port int, ethclient *ethclient.Client, multiplexer *multiplexer.Multiplexer, logger *zap.Logger) {
	var options []grpc.ServerOption
	grpcServer := grpc.NewServer(options...)

	pb_stream.RegisterECSStreamServiceServer(grpcServer, createStreamServer(ethclient, multiplexer, logger))

	// Register reflection service on gRPC server.
	reflection.Register(grpcServer)

	// Start the RPC server at PORT.
	listener, err := net.Listen("tcp", fmt.Sprintf("localhost:%d", port))
	if err != nil {
		logger.Info("failed to listen", zap.String("category", "gRPC server"), zap.Error(err))
	}
	go startRPCServer(grpcServer, listener, logger)
	logger.Info("started listening", zap.String("category", "gRPC server"), zap.String("address", listener.Addr().String()))

	// Wrap gRPC server into a gRPC-web HTTP server.
	grpcWebServer := grpcweb.WrapServer(
		grpcServer,
		// Enable CORS.
		grpcweb.WithCorsForRegisteredEndpointsOnly(false),
		grpcweb.WithOriginFunc(func(origin string) bool { return true }),
	)
	// Create and start the HTTP server at PORT+1.
	httpServer := &http.Server{
		Handler: grpcWebServer,
		Addr:    fmt.Sprintf("0.0.0.0:%d", port+1),
	}
	go startHTTPServer(httpServer, logger)
	logger.Info("started listening", zap.String("category", "http server"), zap.String("address", httpServer.Addr))
}

// StartStreamServer starts a gRPC server and a HTTP web-gRPC server wrapper for an ECS snapshot
// service. The gRPC server is started at port and HTTP server at port + 1.
func StartSnapshotServer(port int, logger *zap.Logger) {
	var options []grpc.ServerOption
	grpcServer := grpc.NewServer(options...)

	pb_snapshot.RegisterECSStateSnapshotServiceServer(grpcServer, createSnapshotServer())

	// Register reflection service on gRPC server.
	reflection.Register(grpcServer)

	// Start the RPC server at PORT.
	listener, err := net.Listen("tcp", fmt.Sprintf("localhost:%d", port))
	if err != nil {
		logger.Fatal("failed to listen", zap.String("category", "gRPC server"), zap.Error(err))
	}
	go startRPCServer(grpcServer, listener, logger)
	logger.Info("started listening", zap.String("category", "gRPC server"), zap.String("address", listener.Addr().String()))

	// Wrap gRPC server into a gRPC-web HTTP server.
	grpcWebServer := grpcweb.WrapServer(
		grpcServer,
		// Enable CORS.
		grpcweb.WithCorsForRegisteredEndpointsOnly(false),
		grpcweb.WithOriginFunc(func(origin string) bool { return true }),
	)
	// Create and start the HTTP server at PORT+1.
	httpServer := &http.Server{
		Handler: grpcWebServer,
		Addr:    fmt.Sprintf("0.0.0.0:%d", port+1),
	}
	go startHTTPServer(httpServer, logger)
	logger.Info("started listening", zap.String("category", "http server"), zap.String("address", httpServer.Addr))
}

func StartRelayServer(port int, config *relay.RelayServerConfig, logger *zap.Logger) {
	var options []grpc.ServerOption
	grpcServer := grpc.NewServer(options...)

	pb_relay.RegisterECSRelayServiceServer(grpcServer, createRelayServer(logger, config))

	// Register reflection service on gRPC server.
	reflection.Register(grpcServer)

	listener, err := net.Listen("tcp", fmt.Sprintf("localhost:%d", port))
	if err != nil {
		logger.Fatal("failed to listen", zap.String("category", "gRPC server"), zap.Error(err))
	}
	go startRPCServer(grpcServer, listener, logger)
	logger.Info("started listening", zap.String("category", "gRPC server"), zap.String("address", listener.Addr().String()))

	// Wrap gRPC server into a gRPC-web HTTP server.
	grpcWebServer := grpcweb.WrapServer(
		grpcServer,
		// Enable CORS.
		grpcweb.WithCorsForRegisteredEndpointsOnly(false),
		grpcweb.WithOriginFunc(func(origin string) bool { return true }),
	)
	// Create and start the HTTP server at PORT+1.
	httpServer := &http.Server{
		Handler: grpcWebServer,
		Addr:    fmt.Sprintf("0.0.0.0:%d", port+1),
	}
	logger.Info("started listening", zap.String("category", "http server"), zap.String("address", httpServer.Addr))
	startHTTPServer(httpServer, logger)
}

func createStreamServer(ethclient *ethclient.Client, multiplexer *multiplexer.Multiplexer, logger *zap.Logger) *ecsStreamServer {
	return &ecsStreamServer{
		ethclient:   ethclient,
		multiplexer: multiplexer,
		logger:      logger,
	}
}

func createSnapshotServer() *ecsSnapshotServer {
	return &ecsSnapshotServer{}
}

func createRelayServer(logger *zap.Logger, config *relay.RelayServerConfig) *ecsRelayServer {
	server := &ecsRelayServer{
		logger: logger,
		config: config,
	}
	server.Init()
	return server
}
