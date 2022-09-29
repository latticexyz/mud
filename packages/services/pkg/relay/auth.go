package relay

import (
	"latticexyz/mud/packages/services/pkg/logger"
	"latticexyz/mud/packages/services/pkg/utils"
	pb "latticexyz/mud/packages/services/protobuf/go/ecs-relay"

	"go.uber.org/zap"
)

func RecoverIdentity(signature *pb.Signature) (*pb.Identity, error) {
	recoveredAddress, err := utils.RecoverSigAddress(
		signature.Signature,
		[]byte("ecs-relay-service"),
	)
	if err != nil {
		logger.GetLogger().Info("error while recovering identity", zap.Error(err))
		return nil, err
	}

	return &pb.Identity{
		Name: recoveredAddress,
	}, nil
}
