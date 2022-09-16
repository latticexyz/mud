package utils

import (
	"time"

	"github.com/avast/retry-go"
	"go.uber.org/zap"
)

var ServiceDelayType = retry.DelayType(func(n uint, err error, config *retry.Config) time.Duration {
	return retry.FixedDelay(n, err, config)
})

var ServiceRetryAttempts = retry.Attempts(RetryAttempts)
var ServiceRetryDelay = retry.Delay(RetryDelay)

// LogErrorWhileRetrying is a wrapper for less verbose logging when retrying some actions, for
// instance, reconnecting to an Ethereum client.
func LogErrorWhileRetrying(msg string, err error, retrying *bool, logger *zap.Logger) {
	if err != nil {
		if !*retrying {
			logger.Error(msg, zap.Error(err))
			*retrying = true
		} else {
			logger.Warn(msg, zap.Error(err))
		}
	}
}
