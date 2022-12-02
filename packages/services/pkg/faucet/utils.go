package faucet

import (
	"time"
)

func IsLinked(linked string, requested string) bool {
	return linked != "" && linked != requested
}

func TimeDiff(earlierTime time.Time, laterTime time.Time) time.Duration {
	return laterTime.Sub(earlierTime)
}
