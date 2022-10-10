package relay

import (
	"fmt"
	"latticexyz/mud/packages/services/pkg/logger"
	pb "latticexyz/mud/packages/services/protobuf/go/ecs-relay"
	"sync"
	"time"

	"github.com/ethereum/go-ethereum/crypto"
	"go.uber.org/zap"
	"golang.org/x/time/rate"
)

type RelayServerConfig struct {
	IdleTimeoutTime       int
	IdleDisconnectIterval int
	MessageDriftTime      int
	MinAccountBalance     int

	VerifyMessageSignature bool
	VerifyAccountBalance   bool
	MessageRateLimit       int
}

type Client struct {
	identity            *pb.Identity
	channel             chan *pb.Message
	connected           bool
	latestPingTimestamp int64

	sufficientBalance          bool
	sufficientBalanceLimiter   *rate.Limiter
	insufficientBalanceLimiter *rate.Limiter
	messageRateLimiter         *rate.Limiter

	mutex sync.Mutex
}

func (client *Client) Connect() {
	client.mutex.Lock()
	client.channel = make(chan *pb.Message)
	client.connected = true
	client.mutex.Unlock()
	logger.GetLogger().Info("connected client", zap.String("client", client.identity.Name))
}

func (client *Client) Disconnect() {
	client.mutex.Lock()
	close(client.channel)
	client.connected = false
	client.mutex.Unlock()
	logger.GetLogger().Info("disconnected client", zap.String("client", client.identity.Name))
}

func (client *Client) Ping() {
	client.mutex.Lock()
	client.latestPingTimestamp = time.Now().Unix()
	client.mutex.Unlock()
}

func (client *Client) IsConnected() bool {
	return client.connected
}

func (client *Client) IsIdle(idleTimeoutTime int) bool {
	return time.Since(time.Unix(client.latestPingTimestamp, 0)).Seconds() >= float64(idleTimeoutTime)
}

func (client *Client) GetChannel() chan *pb.Message {
	return client.channel
}

func (client *Client) GetIdentity() *pb.Identity {
	return client.identity
}

func (client *Client) GetLimiter() *rate.Limiter {
	return client.messageRateLimiter
}

func (client *Client) HasSufficientBalance() bool {
	return client.sufficientBalance
}

func (client *Client) SetHasSufficientBalance(hasSufficientBalance bool) {
	client.sufficientBalance = hasSufficientBalance
}

func (client *Client) ShouldCheckBalance() bool {
	if client.sufficientBalance {
		return client.sufficientBalanceLimiter.Allow()
	} else {
		return client.insufficientBalanceLimiter.Allow()
	}
}

type ClientRegistry struct {
	clients []*Client
	mutex   sync.Mutex
}

func (registry *ClientRegistry) DisconnectAll() {
	for _, client := range registry.clients {
		client.Disconnect()
	}
}

func (registry *ClientRegistry) Count() int {
	return len(registry.clients)
}

func (registry *ClientRegistry) CountConnected() int {
	count := 0
	registry.mutex.Lock()
	for _, client := range registry.clients {
		if client.connected {
			count += 1
		}
	}
	registry.mutex.Unlock()
	return count
}

func (registry *ClientRegistry) GetClients() []*Client {
	return registry.clients
}

func GenerateRandomIdentifier() (string, error) {
	timestamp, err := time.Now().MarshalBinary()
	if err != nil {
		logger.GetLogger().Error("cannot generate random identifier from current time")
		return "", fmt.Errorf("cannot generated random identifier")
	}
	return crypto.Keccak256Hash(timestamp).Hex(), nil
}

func (registry *ClientRegistry) GetClientFromIdentity(identity *pb.Identity) (*Client, error) {
	registry.mutex.Lock()
	for _, client := range registry.clients {
		if client.identity.Name == identity.Name {
			registry.mutex.Unlock()
			return client, nil
		}
	}
	registry.mutex.Unlock()
	return nil, fmt.Errorf("client not registered: %s", identity.Name)
}

func (registry *ClientRegistry) GetClientFromSignature(signature *pb.Signature) (*Client, *pb.Identity, error) {
	// First recover the identity from the signature.
	identity, err := RecoverIdentity(signature)
	if err != nil {
		return nil, nil, err
	}
	// Now find the client corresponding to the identity.
	client, err := registry.GetClientFromIdentity(identity)
	return client, identity, err
}

func (registry *ClientRegistry) IsRegistered(identity *pb.Identity) bool {
	registry.mutex.Lock()
	for _, client := range registry.clients {
		if client.identity.Name == identity.Name {
			registry.mutex.Unlock()
			return true
		}
	}
	registry.mutex.Unlock()
	return false
}

func (registry *ClientRegistry) Register(identity *pb.Identity, config *RelayServerConfig) {
	registry.mutex.Lock()

	newClient := new(Client)
	newClient.identity = identity
	newClient.channel = make(chan *pb.Message)
	newClient.connected = false
	newClient.messageRateLimiter = rate.NewLimiter(rate.Every(1*time.Second/time.Duration(config.MessageRateLimit)), config.MessageRateLimit)

	// At most allow a check for balance every 60s if client has funds and every 10s if not.
	newClient.sufficientBalanceLimiter = rate.NewLimiter(rate.Limit(float64(1)/float64(60)), 1)
	newClient.insufficientBalanceLimiter = rate.NewLimiter(rate.Limit(float64(1)/float64(10)), 1)

	newClient.sufficientBalance = false

	registry.clients = append(registry.clients, newClient)

	registry.mutex.Unlock()
}

func (registry *ClientRegistry) Unregister(identity *pb.Identity) error {
	registry.mutex.Lock()
	for index, client := range registry.clients {
		if client.identity.Name == identity.Name {
			registry.clients = append(registry.clients[:index], registry.clients[index+1:]...)
			registry.mutex.Unlock()
			return nil
		}
	}
	registry.mutex.Unlock()
	return fmt.Errorf("client not registered")
}

type SubscriptionRegistry struct {
	labels map[string]*MessageLabel
	mutex  sync.Mutex
}

func (registry *SubscriptionRegistry) Init() {
	registry.labels = make(map[string]*MessageLabel)
}

func (registry *SubscriptionRegistry) GetLabel(key string) (label *MessageLabel) {
	registry.mutex.Lock()
	if value, exist := registry.labels[key]; exist {
		label = value
	} else {
		label = new(MessageLabel)
		registry.labels[key] = label
	}
	registry.mutex.Unlock()
	return
}

type MessageLabel struct {
	subscriptions []*Client
	mutex         sync.Mutex
}

func (label *MessageLabel) Propagate(message *pb.Message, origin *pb.Identity) {
	label.mutex.Lock()
	for _, client := range label.subscriptions {
		// Only pipe to clients that are connected and not the client which is the origin of
		// the message.
		client.mutex.Lock()
		if client.identity.Name != origin.Name && client.connected {
			client.channel <- message
		}
		client.mutex.Unlock()
	}
	label.mutex.Unlock()
}

func (label *MessageLabel) IsSubscribed(client *Client) bool {
	label.mutex.Lock()
	for _, subscribedClient := range label.subscriptions {
		if subscribedClient == client {
			label.mutex.Unlock()
			return true
		}
	}
	label.mutex.Unlock()
	return false
}

func (label *MessageLabel) Subscribe(client *Client) {
	label.mutex.Lock()
	label.subscriptions = append(label.subscriptions, client)
	label.mutex.Unlock()
}

func (label *MessageLabel) Unsubscribe(client *Client) error {
	label.mutex.Lock()
	for index, subscribedClient := range label.subscriptions {
		if subscribedClient == client {
			label.subscriptions = append(label.subscriptions[:index], label.subscriptions[index+1:]...)
			label.mutex.Unlock()
			return nil
		}
	}
	label.mutex.Unlock()
	return fmt.Errorf("client not subscribed to this label")
}
