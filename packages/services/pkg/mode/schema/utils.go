package schema

import (
	"fmt"

	"github.com/ethereum/go-ethereum/crypto"
)

//
// Utilities for building table names.
//

func ChainTable(chainId string) string {
	return TABLE_PREFIX + CONNECTOR + chainId
}

func WorldTable(chainId string, worldAddress string) string {
	return ChainTable(chainId) + CONNECTOR + worldAddress
}

func MUDTable(chainId string, worldAddress string, tableName string) string {
	return ChainTable(chainId) + CONNECTOR + crypto.Keccak256Hash([]byte(WorldTable(chainId, worldAddress)+CONNECTOR+tableName)).Hex()
}

//
// Utilities for building field names.
//

func DefaultFieldName(index int) string {
	return "field_" + fmt.Sprint(index)
}
