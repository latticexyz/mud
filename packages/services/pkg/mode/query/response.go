package query

import (
	"latticexyz/mud/packages/services/protobuf/go/mode"
)

func QueryLayerResponseFromTable(table *mode.GenericTable, tableName string) *mode.QueryLayerResponse {
	tables := map[string]*mode.GenericTable{
		tableName: table,
	}
	return &mode.QueryLayerResponse{
		Tables: tables,
	}
}

func QueryLayerResponseFromTables(tables []*mode.GenericTable, tableNames []string) *mode.QueryLayerResponse {
	tableMap := make(map[string]*mode.GenericTable)
	for i := range tables {
		tableMap[tableNames[i]] = tables[i]
	}
	return &mode.QueryLayerResponse{
		Tables: tableMap,
	}
}

func QueryLayerStateResponseFromTables(chainTables []*mode.GenericTable, worldTables []*mode.GenericTable, chainTableNames []string, worldTableNames []string) *mode.QueryLayerStateResponse {
	chainTableMap := make(map[string]*mode.GenericTable)
	for i := range chainTables {
		chainTableMap[chainTableNames[i]] = chainTables[i]
	}

	worldTableMap := make(map[string]*mode.GenericTable)
	for i := range worldTables {
		worldTableMap[worldTableNames[i]] = worldTables[i]
	}

	return &mode.QueryLayerStateResponse{
		ChainTables: chainTableMap,
		WorldTables: worldTableMap,
	}
}
