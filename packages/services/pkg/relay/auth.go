package relay

import (
	"fmt"
	"latticexyz/mud/packages/services/pkg/logger"
	"latticexyz/mud/packages/services/pkg/utils"
	pb "latticexyz/mud/packages/services/protobuf/go/ecs-relay"
	"time"

	"go.uber.org/zap"
)

func RecoverIdentity(signature *pb.Signature) (*pb.Identity, error) {

	expirationTime := signature.GetExpirationTime()
	var signedMessage string

	if expirationTime == 0 {
		// ExpirationTime is not provided, do things the old way.
		// Vulnerable to replay-attacks.
		signedMessage = "ecs-relay-service"
	} else {
		// ExpirationTime is included and part of the signed message.
		currentTime := time.Now().UnixMilli()
		// The expiration time must in the future.
		if currentTime > expirationTime {
			return nil, fmt.Errorf("signature is expired")
		}
		signedMessage = fmt.Sprintf("ecs-relay-service: %d", expirationTime)
	}

	recoveredAddress, err := utils.RecoverSigAddress(
		signature.Signature,
		[]byte(signedMessage),
	)
	if err != nil {
		logger.GetLogger().Info("error while recovering identity", zap.Error(err))
		return nil, err
	}

	return &pb.Identity{
		Name: recoveredAddress,
	}, nil
}
