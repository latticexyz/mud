package grpc

import (
	"context"
	"crypto/ecdsa"
	"fmt"
	"latticexyz/mud/packages/services/pkg/faucet"
	pb "latticexyz/mud/packages/services/protobuf/go/faucet"
	"math"
	"math/big"
	"time"

	"github.com/dghubble/go-twitter/twitter"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/ethereum/go-ethereum/ethclient"
	"go.uber.org/zap"
)

type faucetServer struct {
	pb.UnimplementedFaucetServiceServer
	twitterClient *twitter.Client
	ethClient     *ethclient.Client
	privateKey    *ecdsa.PrivateKey
	publicKey     *ecdsa.PublicKey
	dripConfig    *faucet.DripConfig
	logger        *zap.Logger
}

/// Utility functions for faucet logic.

func (server *faucetServer) VerifyUsernameAddressLinked(username string, address string) error {
	linkedUsername := faucet.GetUsernameForAddress(address)
	if linkedUsername != username {
		return fmt.Errorf("linked username doesn't match requested username @%s != @%s", linkedUsername, username)
	}
	linkedAddress := faucet.GetAddressForUsername(username)
	if linkedAddress != address {
		return fmt.Errorf("linked address doesn't match requested address %s != %s", linkedAddress, address)
	}
	return nil
}

func (server *faucetServer) VerifyTimeForDrip(address string) error {
	latestDrip := faucet.GetTimestampForDrip(address)
	timeDiffSinceDrip := faucet.TimeDiff(time.Unix(latestDrip, 0), time.Now())
	if latestDrip != 0 && timeDiffSinceDrip.Minutes() < server.dripConfig.DripFrequency {
		return fmt.Errorf("address %s received drip recently, come back in %.2f minutes", address, (server.dripConfig.DripFrequency - timeDiffSinceDrip.Minutes()))
	}
	return nil
}

///
/// gRPC ENDPOINTS
///

func (server *faucetServer) TimeUntilDrip(ctx context.Context, request *pb.DripRequest) (*pb.TimeUntilDripResponse, error) {
	if request.Username == "" {
		return nil, fmt.Errorf("username required")
	}
	if request.Address == "" {
		return nil, fmt.Errorf("address required")
	}

	err := server.VerifyUsernameAddressLinked(request.Username, request.Address)
	if err != nil {
		return nil, err
	}

	// Get the timestamp of last drip and return the diff to current time.
	latestDrip := faucet.GetTimestampForDrip(request.Address)
	timeDiffSinceDrip := faucet.TimeDiff(time.Unix(latestDrip, 0), time.Now())

	minutesUntilDrip := math.Max((server.dripConfig.DripFrequency - timeDiffSinceDrip.Minutes()), 0)

	return &pb.TimeUntilDripResponse{
		TimeUntilDripMinutes: minutesUntilDrip,
		TimeUntilDripSeconds: minutesUntilDrip * 60,
	}, nil
}

func (server *faucetServer) Drip(ctx context.Context, request *pb.DripRequest) (*pb.DripResponse, error) {
	// Check if there are any funds left to drip per the current period (before they refresh).
	totalDripCount := faucet.GetTotalDripCount()
	if totalDripCount >= server.dripConfig.DripLimit {
		return nil, fmt.Errorf("faucet limit exhausted, come back soon")
	}

	if request.Username == "" {
		return nil, fmt.Errorf("username required")
	}
	if request.Address == "" {
		return nil, fmt.Errorf("address required")
	}

	// Verify that the username and address in the request match and are connected. The only way to
	// connect a username and address is by verifying the tweet via the initial drip request, so we
	// use this to verify that the address is authorized for a follow-up drip.
	err := server.VerifyUsernameAddressLinked(request.Username, request.Address)
	if err != nil {
		return nil, err
	}

	// Verify that the address / username pairing has not requested drip recently.
	err = server.VerifyTimeForDrip(request.Address)
	if err != nil {
		return nil, err
	}

	server.logger.Info("follow-up drip request verified successfully",
		zap.String("username", request.Username),
		zap.String("address", request.Address),
	)

	// Send a tx dripping the funds.
	txHash, err := server.SendDripTransaction(request.Address)
	if err != nil {
		return nil, err
	}
	// Update the current total drip amount.
	faucet.IncrementTotalDripCount(server.dripConfig)

	// Update the timestamp of the latest drip.
	faucet.UpdateDripRequestTimestamp(request.Address)

	return &pb.DripResponse{
		TxHash: txHash,
	}, nil
}

func (server *faucetServer) DripDev(ctx context.Context, request *pb.DripDevRequest) (*pb.DripResponse, error) {
	if !server.dripConfig.DevMode {
		return nil, fmt.Errorf("dev mode is not on")
	}
	if request.Address == "" {
		return nil, fmt.Errorf("address required")
	}

	// Send a tx dripping the funds.
	txHash, err := server.SendDripTransaction(request.Address)
	if err != nil {
		return nil, err
	}

	return &pb.DripResponse{
		TxHash: txHash,
	}, nil
}

func (server *faucetServer) DripVerifyTweet(ctx context.Context, request *pb.DripVerifyTweetRequest) (*pb.DripResponse, error) {
	// Check if there are any funds left to drip per the current period (before they refresh).
	totalDripCount := faucet.GetTotalDripCount()
	if totalDripCount >= server.dripConfig.DripLimit {
		return nil, fmt.Errorf("faucet limit exhausted, come back soon")
	}

	if request.Username == "" {
		return nil, fmt.Errorf("username required")
	}
	if request.Address == "" {
		return nil, fmt.Errorf("address required")
	}

	// Verify that this request has a valid address / username pairing.
	// First verify that no other username is linked to address.
	linkedUsername := faucet.GetUsernameForAddress(request.Address)
	if faucet.IsLinked(linkedUsername, request.Username) {
		return nil, fmt.Errorf("address %s is already connected to username @%s", request.Address, linkedUsername)
	}
	// Now verify that no other address is linked to username.
	linkedAddress := faucet.GetAddressForUsername(request.Username)
	if faucet.IsLinked(linkedAddress, request.Address) {
		return nil, fmt.Errorf("username @%s is already connected to address %s", request.Username, linkedAddress)
	}

	// Verify that the address / username pairing has not requested drip recently.
	err := server.VerifyTimeForDrip(request.Address)
	if err != nil {
		return nil, err
	}

	query := faucet.TwitterUsernameQuery(request.Username)
	search, resp, err := server.twitterClient.Search.Tweets(&twitter.SearchTweetParams{
		Query:     query,
		TweetMode: "extended",
	})

	if err != nil {
		server.logger.Error("could not get tweets from account", zap.Error(err))
		return nil, fmt.Errorf("could not get tweets from account")
	}
	if resp.StatusCode != 200 {
		server.logger.Error("response not 200-OK Twitter API", zap.String("status", resp.Status))
		return nil, fmt.Errorf("response not 200-OK from Twitter API")
	}

	if len(search.Statuses) == 0 {
		server.logger.Error("twitter search did not return any tweets matching query", zap.String("query", query))
		return nil, fmt.Errorf("did not find the tweet")
	}
	latestTweet := search.Statuses[0]

	// Verify the signature inside of the tweet.
	err = faucet.VerifyDripRequestTweet(latestTweet, request.Username, request.Address)
	if err != nil {
		server.logger.Error("tweet drip request verification failed", zap.Error(err))
		return nil, err
	}
	server.logger.Info("tweet drip request verified successfully",
		zap.String("username", request.Username),
		zap.String("address", request.Address),
	)

	// Send a tx dripping the funds.
	txHash, err := server.SendDripTransaction(request.Address)
	if err != nil {
		return nil, err
	}
	// Update the current total drip amount.
	faucet.IncrementTotalDripCount(server.dripConfig)

	// Update the timestamp of the latest drip.
	faucet.UpdateDripRequestTimestamp(request.Address)

	// Link the address and username, if not linked already.
	if linkedAddress == "" && linkedUsername == "" {
		faucet.LinkAddressAndUsername(request.Address, request.Username)
	}

	return &pb.DripResponse{
		TxHash: txHash,
	}, nil
}

func (server *faucetServer) SendDripTransaction(recipientAddress string) (string, error) {
	fromAddress := crypto.PubkeyToAddress(*server.publicKey)
	nonce, err := server.ethClient.PendingNonceAt(context.Background(), fromAddress)
	if err != nil {
		return "", err
	}

	value := big.NewInt(server.dripConfig.DripAmount)
	gasLimit := uint64(21000)

	gasPrice, err := server.ethClient.SuggestGasPrice(context.Background())
	if err != nil {
		return "", err
	}

	toAddress := common.HexToAddress(recipientAddress)
	var data []byte
	tx := types.NewTransaction(nonce, toAddress, value, gasLimit, gasPrice, data)

	// Get the chain ID.
	chainID, err := server.ethClient.NetworkID(context.Background())
	if err != nil {
		return "", err
	}

	// Sign the transaction.
	signedTx, err := types.SignTx(tx, types.NewEIP155Signer(chainID), server.privateKey)
	if err != nil {
		return "", err
	}

	// Send the transaction.
	err = server.ethClient.SendTransaction(context.Background(), signedTx)
	if err != nil {
		return "", err
	}

	txHash := signedTx.Hash().Hex()
	server.logger.Info("drip tx sent", zap.String("tx", txHash))

	return txHash, nil
}

func (server *faucetServer) GetLinkedTwitterForAddress(ctx context.Context, request *pb.LinkedTwitterForAddressRequest) (*pb.LinkedTwitterForAddressResponse, error) {
	linkedUsername := faucet.GetUsernameForAddress(request.Address)

	server.logger.Info("getting linked username for address",
		zap.String("address", request.Address),
		zap.String("username", linkedUsername),
	)

	return &pb.LinkedTwitterForAddressResponse{
		Username: linkedUsername,
	}, nil
}

func (server *faucetServer) GetLinkedAddressForTwitter(ctx context.Context, request *pb.LinkedAddressForTwitterRequest) (*pb.LinkedAddressForTwitterResponse, error) {
	linkedAddress := faucet.GetAddressForUsername(request.Username)

	server.logger.Info("getting linked address for username",
		zap.String("username", request.Username),
		zap.String("address", linkedAddress),
	)
	return &pb.LinkedAddressForTwitterResponse{
		Address: linkedAddress,
	}, nil
}

func (server *faucetServer) GetLinkedTwitters(context.Context, *pb.GetLinkedTwittersRequest) (*pb.GetLinkedTwittersResponse, error) {
	store := faucet.GetStore()
	if store.UsernameToAddress == nil {
		return nil, fmt.Errorf("no linked twitters yet")
	}

	linkedTwitters := &pb.GetLinkedTwittersResponse{}
	for username, address := range store.UsernameToAddress {
		linkedTwitters.LinkedTwitters = append(linkedTwitters.LinkedTwitters, &pb.LinkedTwitterPair{
			Username: username,
			Address:  address,
		})
	}
	server.logger.Info("returning linked twitters", zap.Int("count", len(linkedTwitters.LinkedTwitters)))

	return linkedTwitters, nil
}
