package schema

import (
	"fmt"
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
	return TABLE_PREFIX + CONNECTOR + tableName
}

//
// Utilities for converting table names.
//

func RemoveTablePrefix(fullTableName string) string {
	return fullTableName[len(TABLE_PREFIX)+len(CONNECTOR):]
}

//
// Utilities for building field names.
//

func DefaultFieldName(index int) string {
	return "field_" + fmt.Sprint(index)
}

func DefaultKeyName(index int) string {
	return "key_" + fmt.Sprint(index)
}
