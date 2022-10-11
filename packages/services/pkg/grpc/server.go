package grpc

import (
	"crypto/ecdsa"
	"fmt"
	"latticexyz/mud/packages/services/pkg/faucet"
	multiplexer "latticexyz/mud/packages/services/pkg/multiplexer"
	"latticexyz/mud/packages/services/pkg/relay"
	"latticexyz/mud/packages/services/pkg/snapshot"
	pb_relay "latticexyz/mud/packages/services/protobuf/go/ecs-relay"
	pb_snapshot "latticexyz/mud/packages/services/protobuf/go/ecs-snapshot"
	pb_stream "latticexyz/mud/packages/services/protobuf/go/ecs-stream"
	pb_faucet "latticexyz/mud/packages/services/protobuf/go/faucet"
	"net"
	"net/http"

	"github.com/dghubble/go-twitter/twitter"
	"github.com/ethereum/go-ethereum/ethclient"
	grpc_prometheus "github.com/grpc-ecosystem/go-grpc-prometheus"
	"github.com/improbable-eng/grpc-web/go/grpcweb"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	"go.uber.org/zap"
	"google.golang.org/grpc"
	"google.golang.org/grpc/health"
	"google.golang.org/grpc/health/grpc_health_v1"
	"google.golang.org/grpc/reflection"
)

func startRPCServer(grpcServer *grpc.Server, port int, logger *zap.Logger) {
	listener, err := net.Listen("tcp", fmt.Sprintf("localhost:%d", port))
	if err != nil {
		logger.Fatal("failed to listen", zap.String("category", "gRPC server"), zap.Error(err))
	}
	logger.Info("started listening",
		zap.String("category", "gRPC server"),
		zap.String("address", listener.Addr().String()),
		zap.Int("port", port),
	)

	if err := grpcServer.Serve(listener); err != nil {
		logger.Fatal("failed to serve", zap.String("category", "gRPC server"), zap.Error(err))
	}
}

func startHTTPServer(grpcWebServer *grpcweb.WrappedGrpcServer, port int, logger *zap.Logger) {
	// Create the HTTP server.
	httpServer := &http.Server{
		Handler: grpcWebServer,
		Addr:    fmt.Sprintf("0.0.0.0:%d", port),
	}
	logger.Info("started listening",
		zap.String("category", "http server"),
		zap.String("address", httpServer.Addr),
		zap.Int("port", port),
	)

	if err := httpServer.ListenAndServe(); err != nil {
		logger.Fatal("failed to serve", zap.String("category", "http server"), zap.Error(err))
	}
}

func startMetricsServer(port int, logger *zap.Logger) {
	// Create the HTTP server.
	metricServer := &http.Server{
		Handler: promhttp.Handler(),
		Addr:    fmt.Sprintf("0.0.0.0:%d", port),
	}

	// Register a handler for the /metrics of Prometheus server.
	http.Handle("/metrics", metricServer.Handler)

	logger.Info("started listening",
		zap.String("category", "metric server"),
		zap.String("address", metricServer.Addr),
		zap.Int("port", port),
	)

	if err := metricServer.ListenAndServe(); err != nil {
		logger.Fatal("failed to serve", zap.String("category", "metric server"), zap.Error(err))
	}
}

func createGrpcServer() *grpc.Server {
	grpcServer := grpc.NewServer(
		grpc.StreamInterceptor(grpc_prometheus.StreamServerInterceptor),
		grpc.UnaryInterceptor(grpc_prometheus.UnaryServerInterceptor),
	)

	// Create and register health service server.
	grpc_health_v1.RegisterHealthServer(grpcServer, health.NewServer())

	// Register reflection service on gRPC server.
	reflection.Register(grpcServer)

	// Register a prometheus metric service.
	grpc_prometheus.Register(grpcServer)

	return grpcServer
}

func createWebGrpcServer(grpcServer *grpc.Server) *grpcweb.WrappedGrpcServer {
	// Wrap gRPC server into a gRPC-web HTTP server.
	return grpcweb.WrapServer(
		grpcServer,
		// Enable CORS.
		grpcweb.WithCorsForRegisteredEndpointsOnly(false),
		grpcweb.WithOriginFunc(func(origin string) bool { return true }),
	)
}

func createWebGrpcServerWithWebsockets(grpcServer *grpc.Server) *grpcweb.WrappedGrpcServer {
	// Wrap gRPC server into a gRPC-web HTTP server with websocket support.
	return grpcweb.WrapServer(
		grpcServer,
		// Enable CORS.
		grpcweb.WithCorsForRegisteredEndpointsOnly(false),
		grpcweb.WithOriginFunc(func(origin string) bool { return true }),
		grpcweb.WithWebsockets(true),
		grpcweb.WithWebsocketOriginFunc(func(req *http.Request) bool {
			return true
		}),
	)
}

// StartStreamServer starts a gRPC server and a HTTP web-gRPC server wrapper for an ECS stream
// service. The gRPC server is started at port and HTTP server at port + 1.
func StartStreamServer(grpcPort int, metricsPort int, ethclient *ethclient.Client, multiplexer *multiplexer.Multiplexer, logger *zap.Logger) {
	// Create gRPC server.
	grpcServer := createGrpcServer()

	// Create and register stream service server.
	pb_stream.RegisterECSStreamServiceServer(grpcServer, createStreamServer(ethclient, multiplexer, logger))

	// Start the RPC server at PORT.
	go startRPCServer(grpcServer, grpcPort, logger)

	// Start a metric HTTP server.
	go startMetricsServer(metricsPort, logger)

	// Start the HTTP server at PORT+1.
	go startHTTPServer(createWebGrpcServerWithWebsockets(grpcServer), grpcPort+1, logger)
}

// StartStreamServer starts a gRPC server and a HTTP web-gRPC server wrapper for an ECS snapshot
// service. The gRPC server is started at port and HTTP server at port + 1.
func StartSnapshotServer(grpcPort int, metricsPort int, config *snapshot.SnapshotServerConfig, logger *zap.Logger) {
	// Create gRPC server.
	grpcServer := createGrpcServer()

	// Create and register the snapshot service server.
	pb_snapshot.RegisterECSStateSnapshotServiceServer(grpcServer, createSnapshotServer(config))

	// Start the RPC server at PORT.
	go startRPCServer(grpcServer, grpcPort, logger)

	// Start a metric HTTP server.
	go startMetricsServer(metricsPort, logger)

	// Start the HTTP server at PORT+1.
	go startHTTPServer(createWebGrpcServer(grpcServer), grpcPort+1, logger)
}

func StartRelayServer(grpcPort int, metricsPort int, ethClient *ethclient.Client, config *relay.RelayServerConfig, logger *zap.Logger) {
	// Create gRPC server.
	grpcServer := createGrpcServer()

	// Create and register relay service server.
	pb_relay.RegisterECSRelayServiceServer(grpcServer, createRelayServer(logger, ethClient, config))

	// Start the RPC server at PORT.
	go startRPCServer(grpcServer, grpcPort, logger)

	// Start a metric HTTP server.
	go startMetricsServer(metricsPort, logger)

	// Start the HTTP server at PORT+1.
	startHTTPServer(createWebGrpcServerWithWebsockets(grpcServer), grpcPort+1, logger)
}

func StartFaucetServer(
	grpcPort int,
	metricsPort int,
	twitterClient *twitter.Client,
	ethClient *ethclient.Client,
	privateKey *ecdsa.PrivateKey,
	publicKey *ecdsa.PublicKey,
	dripConfig *faucet.DripConfig,
	logger *zap.Logger,
) {
	// Create gRPC server.
	grpcServer := createGrpcServer()

	// Create and register faucet service server.
	pb_faucet.RegisterFaucetServiceServer(grpcServer, createFaucetServer(twitterClient, ethClient, privateKey, publicKey, dripConfig, logger))

	// Start the RPC server at PORT.
	go startRPCServer(grpcServer, grpcPort, logger)

	// Start a metric HTTP server.
	go startMetricsServer(metricsPort, logger)

	// Start the HTTP server at PORT+1.
	startHTTPServer(createWebGrpcServer(grpcServer), grpcPort+1, logger)
}

func createStreamServer(ethclient *ethclient.Client, multiplexer *multiplexer.Multiplexer, logger *zap.Logger) *ecsStreamServer {
	return &ecsStreamServer{
		ethclient:   ethclient,
		multiplexer: multiplexer,
		logger:      logger,
	}
}

func createSnapshotServer(config *snapshot.SnapshotServerConfig) *ecsSnapshotServer {
	return &ecsSnapshotServer{
		config: config,
	}
}

func createRelayServer(logger *zap.Logger, ethClient *ethclient.Client, config *relay.RelayServerConfig) *ecsRelayServer {
	server := &ecsRelayServer{
		logger:    logger,
		ethClient: ethClient,
		config:    config,
	}
	server.Init()
	return server
}

func createFaucetServer(
	twitterClient *twitter.Client,
	ethClient *ethclient.Client,
	privateKey *ecdsa.PrivateKey,
	publicKey *ecdsa.PublicKey,
	dripConfig *faucet.DripConfig,
	logger *zap.Logger,
) *faucetServer {
	return &faucetServer{
		twitterClient: twitterClient,
		ethClient:     ethClient,
		privateKey:    privateKey,
		publicKey:     publicKey,
		dripConfig:    dripConfig,
		logger:        logger,
	}
}
