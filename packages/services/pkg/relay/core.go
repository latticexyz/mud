package relay

import (
	"fmt"
	"latticexyz/mud/packages/services/pkg/logger"
	pb "latticexyz/mud/packages/services/protobuf/go/ecs-relay"
	"sync"
	"time"

	"github.com/ethereum/go-ethereum/crypto"
)

type Client struct {
	identity  *pb.Identity
	channel   chan *pb.Message
	connected bool
	mutex     sync.Mutex
}

func (client *Client) Connect() {
	client.mutex.Lock()
	client.connected = true
	client.mutex.Unlock()
}

func (client *Client) Disconnect() {
	client.mutex.Lock()
	client.connected = false
	client.mutex.Unlock()
}

func (client *Client) GetChannel() chan *pb.Message {
	return client.channel
}

type ClientRegistry struct {
	clients []*Client
	mutex   sync.Mutex
}

func (registry *ClientRegistry) Stop() {
	for _, client := range registry.clients {
		client.mutex.Lock()
		close(client.channel)
		client.connected = false
		client.mutex.Unlock()
	}
}

func (registry *ClientRegistry) Count() int {
	return len(registry.clients)
}

func GenerateRandomIdentifier() (string, error) {
	timestamp, err := time.Now().MarshalBinary()
	if err != nil {
		logger.GetLogger().Error("cannot generate random identifier from current time")
		return "", fmt.Errorf("cannot generated random identifier")
	}
	return crypto.Keccak256Hash(timestamp).Hex(), nil
}

func (registry *ClientRegistry) GetClient(identity *pb.Identity) (*Client, error) {
	registry.mutex.Lock()
	for _, client := range registry.clients {
		if client.identity.Name == identity.Name {
			registry.mutex.Unlock()
			return client, nil
		}
	}
	registry.mutex.Unlock()
	return nil, fmt.Errorf("client not registered")
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

func (registry *ClientRegistry) Register(identity *pb.Identity) {
	registry.mutex.Lock()

	newClient := new(Client)
	newClient.identity = identity
	newClient.channel = make(chan *pb.Message)
	newClient.connected = false
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

func (label *MessageLabel) Propagate(message *pb.Message) {
	label.mutex.Lock()
	for _, client := range label.subscriptions {
		client.mutex.Lock()
		if client.connected {
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
