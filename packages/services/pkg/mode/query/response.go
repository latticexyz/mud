package query

import (
	"latticexyz/mud/packages/services/protobuf/go/mode"
	pb_mode "latticexyz/mud/packages/services/protobuf/go/mode"
)

func QueryLayerResponseFromTable(table *mode.GenericTable, tableName string) *pb_mode.QueryLayerResponse {
	tables := map[string]*pb_mode.GenericTable{
		tableName: table,
	}
	return &pb_mode.QueryLayerResponse{
		Tables: tables,
	}
}

func QueryLayerResponseFromTables(tables []*mode.GenericTable, tableNames []string) *pb_mode.QueryLayerResponse {
	tableMap := make(map[string]*pb_mode.GenericTable)
	for i := range tables {
		tableMap[tableNames[i]] = tables[i]
	}
	return &pb_mode.QueryLayerResponse{
		Tables: tableMap,
	}
}
