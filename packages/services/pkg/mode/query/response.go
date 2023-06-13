package query

import (
	"latticexyz/mud/packages/services/protobuf/go/mode"
)

// QueryLayerResponseFromTable creates a QueryLayerResponse object from a single table object.
//
// Parameters:
// - table (*mode.GenericTable): The table object to create the response from.
// - tableName (string): The name of the table.
//
// Returns:
// - (*mode.QueryLayerResponse): A QueryLayerResponse object containing the input table.
func ResponseFromTable(table *mode.TableData, tableName string) *mode.QueryLayerResponse {
	tables := map[string]*mode.TableData{
		tableName: table,
	}
	return &mode.QueryLayerResponse{
		Tables: tables,
	}
}

// QueryLayerResponseFromTables creates a QueryLayerResponse from an array of tables and their corresponding names.
//
// Parameters:
// - tables ([]*mode.GenericTable): An array of tables to include in the QueryLayerResponse.
// - tableNames ([]string): The names of the tables in the same order as the tables array.
//
// Returns:
// - (*mode.QueryLayerResponse): The QueryLayerResponse containing the tables.
func ResponseFromTables(tables []*mode.TableData, tableNames []string) *mode.QueryLayerResponse {
	tableMap := make(map[string]*mode.TableData)
	for i := range tables {
		tableMap[tableNames[i]] = tables[i]
	}
	return &mode.QueryLayerResponse{
		Tables: tableMap,
	}
}

// QueryLayerStateResponseFromTable creates a new QueryLayerStateResponse struct with a single table.
//
// Parameters:
// - table (*mode.GenericTable): A pointer to the generic table to be included in the response.
// - tableName (string): The name of the table to be included in the response.
// - isChainTable (bool): A boolean indicating whether the table is a chain table or a world table.
//
// Returns:
// - (*mode.QueryLayerStateResponse): A pointer to the newly created QueryLayerStateResponse struct with the single
// table.
func StateResponseFromTable(
	tableData *mode.TableData,
	tableName string,
	isChainTable bool,
) *mode.QueryLayerStateResponse {
	tables := map[string]*mode.TableData{
		tableName: tableData,
	}
	if isChainTable {
		return &mode.QueryLayerStateResponse{
			ChainTables: tables,
		}
	}
	return &mode.QueryLayerStateResponse{
		WorldTables: tables,
	}
}

// QueryLayerStateResponseFromTables creates a QueryLayerStateResponse from a set of chain and world tables.
//
// Parameters:
// - chainTables ([]*mode.GenericTable): An array of chain tables.
// - worldTables ([]*mode.GenericTable): An array of world tables.
// - chainTableNames ([]string): An array of names for the chain tables.
// - worldTableNames ([]string): An array of names for the world tables.
//
// Returns:
// - (*mode.QueryLayerStateResponse): The QueryLayerStateResponse object containing the provided chain and world tables.
func StateResponseFromTables(
	chainTableData []*mode.TableData,
	worldTableData []*mode.TableData,
	chainTableNames []string,
	worldTableNames []string,
) *mode.QueryLayerStateResponse {
	chainTableMap := make(map[string]*mode.TableData)
	for i := range chainTableData {
		chainTableMap[chainTableNames[i]] = chainTableData[i]
	}

	worldTableMap := make(map[string]*mode.TableData)
	for i := range worldTableData {
		worldTableMap[worldTableNames[i]] = worldTableData[i]
	}

	return &mode.QueryLayerStateResponse{
		ChainTables: chainTableMap,
		WorldTables: worldTableMap,
	}
}

// StateStreamResponseFromTables generates a QueryLayerStateStreamResponse from BufferedEvents.
//
// Parameters:
// - inserted (*BufferedEvents): The inserted BufferedEvents to create a QueryLayerStateResponse from.
// - updated (*BufferedEvents): The updated BufferedEvents to create a QueryLayerStateResponse from.
// - deleted (*BufferedEvents): The deleted BufferedEvents to create a QueryLayerStateResponse from.
//
// Returns:
// - (*mode.QueryLayerStateStreamResponse): A QueryLayerStateStreamResponse object containing the created
// QueryLayerStateResponse objects.

func StateStreamResponseFromTables(
	inserted *BufferedEvents,
	updated *BufferedEvents,
	deleted *BufferedEvents,
) *mode.QueryLayerStateStreamResponse {
	return &mode.QueryLayerStateStreamResponse{
		Inserted: StateResponseFromTables(
			inserted.ChainTableData,
			inserted.WorldTableData,
			inserted.ChainTableNames,
			inserted.WorldTableNames,
		),
		Updated: StateResponseFromTables(
			updated.ChainTableData,
			updated.WorldTableData,
			updated.ChainTableNames,
			updated.WorldTableNames,
		),
		Deleted: StateResponseFromTables(
			deleted.ChainTableData,
			deleted.WorldTableData,
			deleted.ChainTableNames,
			deleted.WorldTableNames,
		),
	}
}
