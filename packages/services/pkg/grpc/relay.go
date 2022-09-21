package grpc

import (
	"context"
	"fmt"
	"latticexyz/mud/packages/services/pkg/relay"
	pb "latticexyz/mud/packages/services/protobuf/go/ecs-relay"

	"go.uber.org/zap"
)

type ecsRelayServer struct {
	pb.UnimplementedECSRelayServiceServer
	relay.ClientRegistry
	relay.SubscriptionRegistry
	logger *zap.Logger
}

func (server *ecsRelayServer) Init() {
	server.SubscriptionRegistry.Init()
}

func (server *ecsRelayServer) Stop() {
	server.ClientRegistry.Stop()
}

func (server *ecsRelayServer) Authenticate(ctx context.Context, identity *pb.Identity) (*pb.Identity, error) {
	if len(identity.Name) == 0 {
		name, err := relay.GenerateRandomIdentifier()
		if err != nil {
			return nil, err
		} else {
			identity.Name = name
		}
	}
	server.logger.Info("authenticating client", zap.String("name", identity.Name))

	if !server.IsRegistered(identity) {
		server.Register(identity)
		server.logger.Info("registered new client identity", zap.String("name", identity.Name))
	} else {
		server.logger.Warn("client identity already registered", zap.String("name", identity.Name))
	}

	return identity, nil
}

func (server *ecsRelayServer) Revoke(ctx context.Context, identity *pb.Identity) (*pb.Identity, error) {
	if len(identity.Name) == 0 {
		return nil, fmt.Errorf("required to provide an identity when revoking")
	}
	server.logger.Info("authenticating client", zap.String("name", identity.Name))

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

func (server *ecsRelayServer) CountIdentities(ctx context.Context, request *pb.CountIdentitiesRequest) (*pb.CountIdentitiesResponse, error) {
	countClients := server.ClientRegistry.Count()
	server.logger.Info("returning the count of authenticated identities", zap.Int("count", countClients))

	return &pb.CountIdentitiesResponse{
		Count: uint32(countClients),
	}, nil
}

func (server *ecsRelayServer) Subscribe(ctx context.Context, request *pb.SubscriptionRequest) (*pb.Subscription, error) {
	client, err := server.GetClient(request.Identity)
	if err != nil {
		return nil, fmt.Errorf("client not authenticated")
	}

	label := server.GetLabel(request.Subscription.Label)
	if label.IsSubscribed(client) {
		server.logger.Error("client already subscribed to label", zap.String("label", request.Subscription.Label))
		return nil, fmt.Errorf("client already subscribed to label %s", request.Subscription.Label)
	}
	label.Subscribe(client)
	server.logger.Info("subscribed client to label",
		zap.String("client", request.Identity.Name),
		zap.String("label", request.Subscription.Label),
	)
	return request.Subscription, nil
}

func (server *ecsRelayServer) Unsubscribe(ctx context.Context, request *pb.SubscriptionRequest) (*pb.Subscription, error) {
	client, err := server.GetClient(request.Identity)
	if err != nil {
		return nil, fmt.Errorf("client not authenticated")
	}

	label := server.GetLabel(request.Subscription.Label)
	if !label.IsSubscribed(client) {
		server.logger.Error("client not currently subscribed to label", zap.String("label", request.Subscription.Label))
		return nil, fmt.Errorf("client not currently subscribed to label %s", request.Subscription.Label)
	}
	err = label.Unsubscribe(client)
	if err != nil {
		return nil, err
	}

	server.logger.Info("unsubscribed client from label",
		zap.String("client", request.Identity.Name),
		zap.String("label", request.Subscription.Label),
	)
	return request.Subscription, nil
}

func (server *ecsRelayServer) OpenStream(identity *pb.Identity, stream pb.ECSRelayService_OpenStreamServer) error {
	client, err := server.GetClient(identity)
	if err != nil {
		return fmt.Errorf("client not authenticated")
	}

	server.logger.Info("opening stream", zap.String("client", identity.Name))
	client.Connect()

	for msg := range client.GetChannel() {
		if err := stream.Send(msg); err != nil {
			return err
		}
	}

	server.logger.Info("closing stream", zap.String("client", identity.Name))
	client.Disconnect()

	return nil
}

func (server *ecsRelayServer) Push(ctx context.Context, request *pb.PushRequest) (*pb.PushResponse, error) {
	label := server.GetLabel(request.Label)

	for _, message := range request.Messages {
		label.Propagate(message)
	}
	return &pb.PushResponse{}, nil
}
