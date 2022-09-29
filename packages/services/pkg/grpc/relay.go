package grpc

import (
	"context"
	"fmt"
	"latticexyz/mud/packages/services/pkg/relay"
	pb "latticexyz/mud/packages/services/protobuf/go/ecs-relay"
	"time"

	"go.uber.org/zap"
)

type ecsRelayServer struct {
	pb.UnimplementedECSRelayServiceServer
	relay.ClientRegistry
	relay.SubscriptionRegistry

	config *relay.RelayServerConfig
	logger *zap.Logger
}

func (server *ecsRelayServer) Init() {
	server.SubscriptionRegistry.Init()

	// Kick off a worker that will periodically cycle through the connected clients and disconnect
	// idle ones (the ones which have not received a /Ping RPC).
	go server.DisconnectIdleClientsWorker(
		time.NewTicker(time.Duration(server.config.IdleDisconnectIterval)*time.Second),
		make(chan struct{}),
	)
}

func (server *ecsRelayServer) DisconnectIdleClients(idleTimeoutTime int) int {
	// Count how many clients are disconnected.
	count := 0
	for _, client := range server.ClientRegistry.GetClients() {
		if client.IsIdle(idleTimeoutTime) && client.IsConnected() {
			client.Disconnect()
			count += 1
			server.logger.Info("disconnected client due to inactivity", zap.String("client", client.GetIdentity().Name))
		}
	}
	return count
}

func (server *ecsRelayServer) DisconnectIdleClientsWorker(ticker *time.Ticker, quit chan struct{}) {
	for {
		select {
		case <-ticker.C:
			countDisconnected := server.DisconnectIdleClients(server.config.IdleTimeoutTime)
			server.logger.Info("done disconnecting idle clients", zap.Int("count", countDisconnected))
		case <-quit:
			ticker.Stop()
			return
		}
	}
}

func (server *ecsRelayServer) Stop() {
	server.ClientRegistry.DisconnectAll()
}

func (server *ecsRelayServer) Authenticate(ctx context.Context, signature *pb.Signature) (*pb.Identity, error) {
	if len(signature.Signature) == 0 {
		return nil, fmt.Errorf("signature required to authenticate")
	}

	identity, err := relay.RecoverIdentity(signature)
	if err != nil {
		return nil, err
	}
	server.logger.Info("successfully authenticated client", zap.String("name", identity.Name))

	if !server.IsRegistered(identity) {
		server.Register(identity)
		server.logger.Info("registered new client identity", zap.String("name", identity.Name))
	} else {
		server.logger.Warn("client identity already registered", zap.String("name", identity.Name))
	}

	return identity, nil
}

func (server *ecsRelayServer) Revoke(ctx context.Context, signature *pb.Signature) (*pb.Identity, error) {
	if len(signature.Signature) == 0 {
		return nil, fmt.Errorf("signature required to revoke")
	}

	identity, err := relay.RecoverIdentity(signature)
	if err != nil {
		return nil, err
	}
	server.logger.Info("successfully authenticated client", zap.String("name", identity.Name))

	if server.IsRegistered(identity) {
		err := server.Unregister(identity)
		if err != nil {
			return nil, err
		}
		server.logger.Info("unregistered client identity", zap.String("name", identity.Name))
	} else {
		server.logger.Warn("client identity not registered", zap.String("name", identity.Name))
	}

	return identity, nil
}

func (server *ecsRelayServer) Ping(ctx context.Context, signature *pb.Signature) (*pb.Identity, error) {
	if len(signature.Signature) == 0 {
		return nil, fmt.Errorf("signature required")
	}

	client, identity, err := server.GetClient(signature)
	if err != nil {
		return nil, err
	}

	server.logger.Info("received ping from client", zap.String("client", identity.Name))
	client.Ping()

	return identity, nil
}

func (server *ecsRelayServer) CountAuthenticated(ctx context.Context, request *pb.CountIdentitiesRequest) (*pb.CountIdentitiesResponse, error) {
	countClients := server.ClientRegistry.Count()
	server.logger.Info("returning the count of authenticated clients", zap.Int("count", countClients))

	return &pb.CountIdentitiesResponse{
		Count: uint32(countClients),
	}, nil
}

func (server *ecsRelayServer) CountConnected(ctx context.Context, request *pb.CountIdentitiesRequest) (*pb.CountIdentitiesResponse, error) {
	countClients := server.ClientRegistry.CountConnected()
	server.logger.Info("returning the count of connected clients", zap.Int("count", countClients))

	return &pb.CountIdentitiesResponse{
		Count: uint32(countClients),
	}, nil
}

func (server *ecsRelayServer) Subscribe(ctx context.Context, request *pb.SubscriptionRequest) (*pb.Subscription, error) {
	if request.Signature == nil {
		return nil, fmt.Errorf("signature required")
	}

	client, identity, err := server.GetClient(request.Signature)
	if err != nil {
		return nil, err
	}

	label := server.GetLabel(request.Subscription.Label)
	if !label.IsSubscribed(client) {
		label.Subscribe(client)

		server.logger.Info("subscribed client to label",
			zap.String("client", identity.Name),
			zap.String("label", request.Subscription.Label),
		)
	} else {
		server.logger.Info("client already subscribed to label", zap.String("label", request.Subscription.Label))
	}

	return request.Subscription, nil
}

func (server *ecsRelayServer) Unsubscribe(ctx context.Context, request *pb.SubscriptionRequest) (*pb.Subscription, error) {
	if request.Signature == nil {
		return nil, fmt.Errorf("signature required")
	}

	client, identity, err := server.GetClient(request.Signature)
	if err != nil {
		return nil, err
	}

	label := server.GetLabel(request.Subscription.Label)
	if label.IsSubscribed(client) {
		err = label.Unsubscribe(client)
		if err != nil {
			return nil, err
		}

		server.logger.Info("unsubscribed client from label",
			zap.String("client", identity.Name),
			zap.String("label", request.Subscription.Label),
		)
	} else {
		server.logger.Info("client not currently subscribed to label", zap.String("label", request.Subscription.Label))
	}

	return request.Subscription, nil
}

func (server *ecsRelayServer) OpenStream(signature *pb.Signature, stream pb.ECSRelayService_OpenStreamServer) error {
	if len(signature.Signature) == 0 {
		return fmt.Errorf("signature required")
	}

	client, identity, err := server.GetClient(signature)
	if err != nil {
		return err
	}

	if !client.IsConnected() {
		server.logger.Info("opening stream", zap.String("client", identity.Name))
		client.Connect()
	} else {
		server.logger.Info("reusing already opened stream", zap.String("client", identity.Name))
	}
	client.Ping()

	for msg := range client.GetChannel() {
		if err := stream.Send(msg); err != nil {
			server.logger.Info("closing stream due to error", zap.String("client", identity.Name), zap.Error(err))
			client.Disconnect()
			return err
		}
	}

	server.logger.Info("closing stream", zap.String("client", identity.Name))
	client.Disconnect()

	return nil
}

func (server *ecsRelayServer) Push(ctx context.Context, request *pb.PushRequest) (*pb.PushResponse, error) {
	if request.Signature == nil {
		return nil, fmt.Errorf("signature required when pushing a message")
	}
	_, identity, err := server.GetClient(request.Signature)
	if err != nil {
		return nil, err
	}

	label := server.GetLabel(request.Label)

	for _, message := range request.Messages {
		label.Propagate(message, identity)
	}
	return &pb.PushResponse{}, nil
}
