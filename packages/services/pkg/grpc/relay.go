package grpc

import (
	"context"
	"fmt"
	"io"
	"latticexyz/mud/packages/services/pkg/eth"
	"latticexyz/mud/packages/services/pkg/relay"
	"latticexyz/mud/packages/services/pkg/utils"
	pb "latticexyz/mud/packages/services/protobuf/go/ecs-relay"
	"time"

	"github.com/ethereum/go-ethereum/crypto"
	"github.com/ethereum/go-ethereum/ethclient"
	"go.uber.org/zap"
)

type ecsRelayServer struct {
	pb.UnimplementedECSRelayServiceServer
	relay.ClientRegistry
	relay.SubscriptionRegistry

	ethClient *ethclient.Client
	config    *relay.RelayServerConfig
	logger    *zap.Logger
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
			if countDisconnected > 0 {
				server.logger.Info("done disconnecting idle clients", zap.Int("count", countDisconnected))
			}
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
		server.Register(identity, server.config)
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

	client, identity, err := server.GetClientFromSignature(signature)
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

	client, identity, err := server.GetClientFromSignature(request.Signature)
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

	client, identity, err := server.GetClientFromSignature(request.Signature)
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

	client, identity, err := server.GetClientFromSignature(signature)
	if err != nil {
		return err
	}

	if client.IsConnected() {
		server.logger.Info("closing opened channel, since already connected", zap.String("client", identity.Name))
		client.Disconnect()
	}

	client.Connect()
	client.Ping()

	relayedMessagesChannel := client.GetChannel()
	for {
		select {
		case <-stream.Context().Done():
			server.logger.Info("client closed stream")
			if client.IsConnected() {
				client.Disconnect()
			}
			return nil
		case relayedMessage := <-relayedMessagesChannel:
			stream.Send(relayedMessage)
		}
	}
}

func (server *ecsRelayServer) VerifyMessageSignature(message *pb.Message, identity *pb.Identity) (bool, string, error) {
	// First encode the message.
	messagePacked := fmt.Sprintf("(%d,%s,%s,%d)", message.Version, message.Id, crypto.Keccak256Hash(message.Data).Hex(), message.Timestamp)

	// Get the 'from' address, or if not specified, make an empty string placeholder, since the
	// verification will fail anyways but the caller may want to use the recovered address.
	var from string
	if identity == nil {
		from = ""
	} else {
		from = identity.Name
	}
	isVerified, recoveredAddress, err := utils.VerifySig(
		from,
		message.Signature,
		[]byte(messagePacked),
	)
	return isVerified, recoveredAddress, err
}

func (server *ecsRelayServer) VerifyMessage(message *pb.Message, identity *pb.Identity) error {
	if message == nil {
		return fmt.Errorf("message is not defined")
	}
	if identity == nil {
		return fmt.Errorf("identity is not defined")
	}
	if len(message.Signature) == 0 {
		return fmt.Errorf("signature is not defined")
	}

	// Verify that the message is OK to relay if config flag is on.
	if server.config.VerifyMessageSignature {
		// Recover the signer to verify that it is the same identity as the one making the RPC call.
		isVerified, recoveredAddress, err := server.VerifyMessageSignature(message, identity)
		if err != nil {
			return fmt.Errorf("error while verifying message: %s", err.Error())
		}
		if !isVerified {
			return fmt.Errorf("recovered signer %s != identity %s", recoveredAddress, identity.Name)
		}
	}

	// For every message verify that the timestamp is within an acceptable drift time.
	messageAge := time.Since(time.Unix(message.Timestamp, 0)).Seconds()
	if messageAge > float64(server.config.MessageDriftTime) {
		return fmt.Errorf("message is older than acceptable drift: %.2f seconds old", messageAge)
	}

	return nil
}

func (server *ecsRelayServer) VerifySufficientBalance(client *relay.Client, address string) error {
	// If the flag to verify account balance is turned off, do nothing.
	if !server.config.VerifyAccountBalance {
		return nil
	}

	if client.ShouldCheckBalance() {
		balance, err := eth.GetCurrentBalance(server.ethClient, address)
		if err != nil {
			return err
		}
		server.logger.Info("fetched up-to-date balance for account", zap.String("address", address), zap.Uint64("balance", balance))

		// Update the "cached" balance on the client, which helps us know whether to keep checking or not.
		client.SetHasSufficientBalance(balance > uint64(server.config.MinAccountBalance))

		if balance == 0 {
			return fmt.Errorf("client with address %s has insufficient balance to push messages via relay", address)
		}
	} else {
		if !client.HasSufficientBalance() {
			return fmt.Errorf("client with address %s has insufficient balance as of last check", address)
		}
	}
	return nil
}

func (server *ecsRelayServer) HandlePushRequest(request *pb.PushRequest) error {
	// When pushing a single message, we recover the sender from the message signature, which has
	// different format then identity signature.
	_, recoveredAddress, err := server.VerifyMessageSignature(request.Message, nil)
	if err != nil {
		return err
	}

	// Create an identity object from the address that signed the message.
	identity := &pb.Identity{
		Name: recoveredAddress,
	}

	// Get the client object for this identity to make sure it's authenticated.
	client, err := server.GetClientFromIdentity(identity)
	if err != nil {
		return err
	}

	// Check if the authenticated client has a balance. We permit pushes of messages only for
	// clients which have a non-zero balance. The checks to Ethereum client are rate limited such
	// that we don't check balance on every request.
	err = server.VerifySufficientBalance(client, recoveredAddress)
	if err != nil {
		return err
	}

	// Rate limit the client, if necessary.
	if !client.GetLimiter().Allow() {
		return fmt.Errorf("client rate limited, max %d msg push / second allowed", server.config.MessageRateLimit)
	}

	// Get the message.
	message := request.Message

	// Verify that the message is OK to relay.
	err = server.VerifyMessage(message, identity)
	if err != nil {
		return err
	}

	// Relay the message.
	label := server.GetLabel(request.Label)
	label.Propagate(message, identity)

	// Update the ping timer on the client since the client has just pushed a valid message.
	client.Ping()

	return nil
}

func (server *ecsRelayServer) Push(ctx context.Context, request *pb.PushRequest) (*pb.PushResponse, error) {
	if len(request.Message.Signature) == 0 {
		return nil, fmt.Errorf("signature required")
	}

	err := server.HandlePushRequest(request)
	if err != nil {
		server.logger.Info("error handling push request", zap.Error(err))
		return nil, err
	}

	return &pb.PushResponse{}, nil
}

func (server *ecsRelayServer) PushMany(ctx context.Context, request *pb.PushManyRequest) (*pb.PushResponse, error) {
	if request.Signature == nil {
		return nil, fmt.Errorf("signature required")
	}
	_, identity, err := server.GetClientFromSignature(request.Signature)
	if err != nil {
		return nil, err
	}

	label := server.GetLabel(request.Label)

	for _, message := range request.Messages {
		// Verify that the message is OK to relay.
		err := server.VerifyMessage(message, identity)
		if err != nil {
			server.logger.Info("not relaying message", zap.Error(err))
			continue
		}
		// Relay the message.
		label.Propagate(message, identity)
	}
	return &pb.PushResponse{}, nil
}

func (server *ecsRelayServer) PushStream(stream pb.ECSRelayService_PushStreamServer) error {
	// Continuously receive message relay requests, handle to relay, and respond with confirmations.
	for {
		// Receive request message from input stream.
		request, err := stream.Recv()

		// Check if the client has closed the input stream.
		if err == io.EOF {
			return nil
		}
		if err != nil {
			return err
		}

		// Handle the request.
		err = server.HandlePushRequest(request)
		if err != nil {
			server.logger.Info("error handling push request", zap.Error(err))
			return err
		}

		// Send a response to client signaling that the request was processed.
		stream.Send(&pb.PushResponse{})
	}
}
