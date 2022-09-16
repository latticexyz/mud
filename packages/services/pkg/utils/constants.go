package utils

import "time"

// RetryAttempts is how many attempts are made to reconnect to an Ethereum client before failing.
const RetryAttempts = 60 * 60

// RetryDelay is the delay between reconnects to an Ethereum client.
const RetryDelay = 1 * time.Second
