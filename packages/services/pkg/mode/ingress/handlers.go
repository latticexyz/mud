package ingress

import (
	"encoding/json"
	"latticexyz/mud/packages/services/pkg/mode"
	"latticexyz/mud/packages/services/pkg/mode/storecore"
	"strings"

	"github.com/ethereum/go-ethereum/common/hexutil"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/umbracle/ethgo/abi"
	"go.uber.org/zap"
)

// handleLogs processes and handles logs of events in the ingress layer.
//
// Parameters:
// - logs ([]types.Log): A slice of `types.Log` containing the logs of events to handle.
//
// Returns:
// - void.
func (il *Layer) handleLogs(logs []types.Log) {
	// defer func() {
	// 	if err := recover(); err != nil {
	// 		il.logger.Error("failed to handle logs", zap.Any("error", err))
	// 	}
	// }()

	// Process each log and handle events.
	for _, vLog := range logs {
		switch vLog.Topics[0].Hex() {
		case StoreSetRecordEvent().Hex():
			event, err := ParseStoreSetRecord(vLog)
			if err != nil {
				il.logger.Error("failed to parse StoreSetRecord event", zap.Error(err))
				continue
			}
			err = il.handleSetRecordEvent(event)
			if err != nil {
				il.logger.Warn("failed to handle StoreSetRecord event", zap.Error(err))
				continue
			}
		case StoreSetFieldEvent().Hex():
			event, err := ParseStoreSetField(vLog)
			if err != nil {
				il.logger.Error("failed to parse StoreSetField event", zap.Error(err))
				continue
			}
			err = il.handleSetFieldEvent(event)
			if err != nil {
				il.logger.Warn("failed to handle StoreSetField event", zap.Error(err))
				continue
			}
		case StoreDeleteRecordEvent().Hex():
			event, err := ParseStoreDeleteRecord(vLog)
			if err != nil {
				il.logger.Error("failed to parse StoreDeleteRecord event", zap.Error(err))
				continue
			}
			err = il.handleDeleteRecordEvent(event)
			if err != nil {
				il.logger.Warn("failed to handle StoreDeleteRecord event", zap.Error(err))
				continue
			}
		}
	}
}

// handleSetRecordEvent handles the StoreSetRecord event by determining the table ID and calling the appropriate handler
// function.
//
// Parameters:
// - event (*storecore.StorecoreStoreSetRecord): A pointer to the parsed `StoreSetRecord` event to handle.
//
// Returns:
// - void.
func (il *Layer) handleSetRecordEvent(event *storecore.StorecoreStoreSetRecord) error {
	tableID := mode.TableIdToHex(event.TableId)
	il.logger.Info("handling set record (StoreSetRecordEvent) event", zap.String("table_id", tableID))

	// Handle the following scenarios:
	// 1. The table is the schema table. This means that a new table should be created.
	// 2. The table is the metadata table. This means we need to update a schema of an existing table.
	// 3. The table is a generic table. This means we need to update rows of an existing table.

	switch tableID {
	case mode.MUDStoreSchemaTableId():
		return il.handleSchemaTableEvent(event)
	case mode.MUDStoreStoreMetadataTableId():
		return il.handleMetadataTableEvent(event)
	default:
		return il.handleGenericTableEvent(event)
	}
}

// handleSetFieldEventUpdateRow handles the StoreSetField event by decoding the field, getting the name of the field,
// creating a partial row object, and updating the row.
//
// Parameters:
//   - event (*storecore.StorecoreStoreSetField): A pointer to the parsed `StoreSetField` event to handle.
//   - tableSchema (*mode.TableSchema): A pointer to the `TableSchema` object representing the table schema of the table
//     to update.
//   - filter ([]*pb_mode.Filter): An array of filter objects used to identify the row to update.
//
// Returns:
// - void.
func (il *Layer) handleSetFieldEventUpdateRow(
	event *storecore.StorecoreStoreSetField,
	table *mode.Table,
	filter map[string]interface{},
) error {
	il.logger.Info("setField: start updating existing row",
		zap.String("table_id", table.Id),
		zap.String("field_name", table.FieldNames[event.SchemaIndex]),
	)

	// Decode the row field data at the field index.
	decodedFieldData := table.StoreCoreFieldSchema.DecodeFieldDataAt(event.Data, event.SchemaIndex)

	// Create a row for the table from the decoded data. Note that we don't provide decoded key data
	// since its a partial row where we are only updating a single field.
	row := table.RowFromDecodedData(nil, decodedFieldData)

	// Update the row.
	il.wl.UpdateRow(table, row, filter)

	il.logger.Info("setField: finished updating existing row",
		zap.String("table_id", table.Id),
		zap.String("field_name", table.FieldNames[event.SchemaIndex]),
		zap.Any("row", row),
	)
	return nil
}

// handleSetFieldEventInsertRow handles the StoreSetField event by decoding the row record data (value) and key,
// creating a row object, and inserting the row into the table.
//
// Parameters:
// - event (*storecore.StorecoreStoreSetField): A pointer to the parsed `StoreSetField` event to handle.
// - tableSchema (*mode.TableSchema): A pointer to the `TableSchema` object representing the table schema of the table
// to insert into.
//
// Returns:
// - void.
func (il *Layer) handleSetFieldEventInsertRow(
	event *storecore.StorecoreStoreSetField,
	table *mode.Table,
) error {
	il.logger.Info("setField: start inserting new row",
		zap.String("table_id", table.Id),
		zap.String("field_name", table.FieldNames[event.SchemaIndex]),
	)

	// Decode the row field data at the field index.
	decodedFieldData := table.StoreCoreFieldSchema.DecodeFieldDataAt(event.Data, event.SchemaIndex)
	// Decode the row key data.
	decodedKeyData := table.StoreCoreKeySchema.DecodeKeyData(event.Key)

	// Create a row for the table from the decoded data.
	row := table.RowFromDecodedData(decodedKeyData, decodedFieldData)

	// Insert the row into the table.
	il.wl.InsertRow(table, row)

	il.logger.Info("setField: finished inserting new row",
		zap.String("table_id", table.Id),
		zap.String("field_name", table.FieldNames[event.SchemaIndex]),
		zap.Any("row", row),
	)
	return nil
}

// handleSetFieldEvent handles the StoreSetField event, which is triggered when a field in a row of a table is updated
// or created. The function checks if the row exists in the table by building a filter from the setField key. If the
// row exists, the function constructs a partial row with the new value for the field that was modified and updates the
// row. If the row does not exist, the function constructs a new row with default values for each column and inserts it
// into the table.
//
// Parameters:
// - event (*storecore.StorecoreStoreSetField): The StoreSetField event to be handled.
//
// Returns:
// - void.
func (il *Layer) handleSetFieldEvent(event *storecore.StorecoreStoreSetField) error {
	tableID := mode.TableIdToHex(event.TableId)

	// Get the target Table.
	table, err := il.tableStore.GetTable(il.ChainID(), event.WorldAddress(), mode.TableIdToTableName(tableID))
	if err != nil {
		il.logger.Error("setField: failed to get table", zap.Error(err))
		return nil
	}

	// Handle the following scenarios:
	// 1. The setField event is modifying a row that doesn't yet exist (i.e. key doesn't match anything),
	//    in which case we insert a new row with default values for each column.
	//
	// 2. The setField event is modifying a row that already exists, in which case we update the
	//    row by constructing a partial row with the new value for the field that was modified.

	// Build the "filter" from the setField key. This is used to find the actual row/record that
	// we're updating (or inserting if doesn't exist).
	filter := table.KeyToFilter(event.Key)

	rowExists, err := il.rl.DoesRowExist(table, filter)
	if err != nil {
		il.logger.Error("setField: failed to check if row exists", zap.Error(err))
		return nil
	}

	// Handle the two scenarios described above.
	if rowExists {
		return il.handleSetFieldEventUpdateRow(event, table, filter)
	}
	return il.handleSetFieldEventInsertRow(event, table)
}

// handleDeleteRecordEvent deletes a row from a given table based on the provided event data.
//
// Parameters:
// - event (*storecore.StorecoreStoreDeleteRecord): The StoreDeleteRecord event to be handled.
//
// Returns:
// - void.
func (il *Layer) handleDeleteRecordEvent(event *storecore.StorecoreStoreDeleteRecord) error {
	tableID := mode.TableIdToHex(event.TableId)
	il.logger.Info("deleteRecord: start handling", zap.String("table_id", tableID))

	// Fetch the target Table.
	table, err := il.tableStore.GetTable(il.ChainID(), event.WorldAddress(), mode.TableIdToTableName(tableID))
	if err != nil {
		il.logger.Error("failed to get table", zap.Error(err))
		return err
	}

	// Build the "filter" from the deleteRecord key. This is used to find the actual row/record that
	// we're deleting.
	filter := table.KeyToFilter(event.Key)
	il.wl.DeleteRow(table, filter)

	il.logger.Info("deleteRecord: finished handling", zap.String("table_id", tableID))
	return nil
}

// handleSchemaTableEvent handles an event to set the schema for a table in the database.
//
// Parameters:
// - event (*storecore.StorecoreStoreSetRecord): The StoreSetRecord event to handle, containing the key, world address,
// and table schema.
//
// Returns:
// - void.
func (il *Layer) handleSchemaTableEvent(event *storecore.StorecoreStoreSetRecord) error {
	tableID := hexutil.Encode(event.Key[0][:])
	il.logger.Info("setRecord: start handling table creation",
		zap.String("world_address", event.WorldAddress()),
		zap.String("table_id", tableID),
	)

	// Parse out the raw bytes of schemas for the table.
	fieldsSchemaBytes32 := mode.GetFieldSchema(event.Data)
	keySchemaBytes32 := mode.GetKeySchema(event.Data)

	fieldsSchema := storecore.DecodeSchema(fieldsSchemaBytes32)
	keySchema := storecore.DecodeSchema(keySchemaBytes32)

	// Create a Table object that will be saved into the "schemas" table.
	table := &mode.Table{
		Id:                   tableID,
		Name:                 mode.TableIdToTableName(tableID),
		StoreCoreKeySchema:   keySchema,
		StoreCoreFieldSchema: fieldsSchema,
		// Create a postgres namespace ('schema') for the world address + the chain (if it doesn't already exist).
		Namespace: mode.Namespace(il.ChainID(), event.WorldAddress()),
		// Keeping track of columns names as they are case sensitive coming from the chain.
		OnChainColNames: map[string]string{},
	}

	// Populate the schema with default values. First populate fields.
	for idx, schemaType := range fieldsSchema.Flatten() {
		columnName := mode.DefaultFieldName(idx)
		table.FieldNames = append(table.FieldNames, columnName)

		solidityType := schemaType.ToSolidityType()
		postgresType := schemaType.ToPostgresType()

		// TODO: refactor
		if table.SolidityTypes == nil {
			table.SolidityTypes = make(map[string]string)
		}
		table.SolidityTypes[columnName] = solidityType

		if table.PostgresTypes == nil {
			table.PostgresTypes = make(map[string]string)
		}

		if table.IsKey == nil {
			table.IsKey = make(map[string]bool)
		}
		table.IsKey[columnName] = false

		table.PostgresTypes[columnName] = postgresType
	}
	// Populate keys.
	for idx, schemaType := range keySchema.Flatten() {
		columnName := mode.DefaultKeyName(idx)
		table.KeyNames = append(table.KeyNames, columnName)

		solidityType := schemaType.ToSolidityType()
		postgresType := schemaType.ToPostgresType()

		// TODO: refactor
		if table.SolidityTypes == nil {
			table.SolidityTypes = make(map[string]string)
		}
		table.SolidityTypes[columnName] = solidityType

		if table.PostgresTypes == nil {
			table.PostgresTypes = make(map[string]string)
		}

		if table.IsKey == nil {
			table.IsKey = make(map[string]bool)
		}
		table.IsKey[columnName] = true

		table.PostgresTypes[columnName] = postgresType
	}

	// Create the table.
	il.wl.CreateTable(table)
	tableJSON, _ := json.Marshal(table)

	// Save the Table as a row with whatever information is known so far into the schemas table.
	schemaTable := mode.SchemasTable(il.ChainID())
	row := mode.TableRow{
		"world_address": event.WorldAddress(),
		"namespace":     table.Namespace,
		"table_name":    table.Name,
		"table_json":    string(tableJSON),
		"key_schema":    hexutil.Encode(keySchemaBytes32),
		"fields_schema": hexutil.Encode(fieldsSchemaBytes32),
	}
	// Filter based on table name, world address, and namespace.
	filter := map[string]interface{}{
		"world_address": event.WorldAddress(),
		"namespace":     table.Namespace,
		"table_name":    table.Name,
	}
	il.wl.UpdateOrInsertRow(schemaTable, row, filter)

	// Now insert the record into the 'mudstore schema' table. (This is a separate table from the internal schema table
	// and is actually the one that the event table ID identifies).
	mudstoreSchemaTable := il.tableStore.MustGetTable(
		il.ChainID(),
		event.WorldAddress(),
		mode.TableIdToTableName(mode.MUDStoreSchemaTableId()),
	)

	// Decode the data directly into the table row.
	decodedFieldData := mudstoreSchemaTable.StoreCoreFieldSchema.DecodeFieldData(event.Data)

	// Build the decoded key data directly. This is because we save the table ID as a hex encoded string of uint256.
	decodedKeyData := storecore.NewDecodedDataFromSchemaType([]storecore.SchemaType{storecore.STRING})
	decodedKeyData.Add(&storecore.DataWithSchemaType{
		Data:       tableID,
		SchemaType: storecore.STRING,
	})
	// Create the row.
	mudstoreSchemaTableRow := mudstoreSchemaTable.RowFromDecodedData(decodedKeyData, decodedFieldData)

	// Insert the row.
	il.wl.InsertRow(mudstoreSchemaTable, mudstoreSchemaTableRow)

	il.logger.Info("setRecord: finished handling table creation",
		zap.String("world_address", event.WorldAddress()),
		zap.String("table_name", hexutil.Encode(event.Key[0][:])),
		zap.String("table_json", string(tableJSON)),
	)
	return nil
}

// handleMetadataTableEvent handles an event to add metadata to a table schema in the database.
//
// Parameters:
// - event (*storecore.StorecoreStoreSetRecord): The StoreSetRecord event to handle, containing the key, world address,
// and metadata for the target table schema.
//
// Returns:
// - void.
func (il *Layer) handleMetadataTableEvent(event *storecore.StorecoreStoreSetRecord) error {
	tableID := hexutil.Encode(event.Key[0][:])

	il.logger.Info("setRecord: start handling schema update",
		zap.String("world_address", event.WorldAddress()),
		zap.String("table_id", tableID),
	)

	// Fetch the target Table (table to which the metadata is being added).
	table, err := il.tableStore.GetTable(il.ChainID(), event.Raw.Address.Hex(), mode.TableIdToTableName(tableID))
	if err != nil {
		il.logger.Error("failed to fetch schema for target table", zap.Error(err))
		return nil
	}

	// Fetch the metadata table.
	metadataTable := il.tableStore.MustGetTable(
		il.ChainID(),
		event.WorldAddress(),
		mode.TableIdToTableName(mode.MUDStoreStoreMetadataTableId()),
	)

	// Decode the metadata.
	decodedMetadata := metadataTable.StoreCoreFieldSchema.DecodeFieldData(event.Data)

	// Since we know the structure of the metadata, we decode it directly into types and handle.
	tableReadableName, _ := decodedMetadata.GetData(0).(string)
	tableColumnNamesHexString, _ := decodedMetadata.GetData(1).(string)
	tableColumnNamesBytes, _ := hexutil.Decode(tableColumnNamesHexString)

	// For some reason just string[] doesn't work with abi decoding here, so we use a tuple.
	_type := abi.MustNewType("tuple(string[] cols)")
	outStruct := struct {
		Cols []string
	}{
		Cols: []string{},
	}
	err = _type.DecodeStruct(tableColumnNamesBytes, &outStruct)
	if err != nil {
		il.logger.Error("failed to decode table column names", zap.Error(err))
		return nil
	}

	// Add extracted metdata to the schema, essentially completing it.
	//
	// 1. Add the readable name.
	// 2. Add the column names and types.
	table.OnChainReadableName = tableReadableName

	// Keep a record of the old field names so we can update the table.
	oldTableFieldNames := table.FieldNames
	// Keep a record of the new field names so we can update the table.
	newTableFieldNames := []string{}

	for idx, schemaType := range table.StoreCoreFieldSchema.Flatten() {
		columnNameFromChain := outStruct.Cols[idx]
		columnName := strings.ToLower(columnNameFromChain)
		newTableFieldNames = append(newTableFieldNames, columnName)

		solidityType := schemaType.ToSolidityType()
		postgresType := schemaType.ToPostgresType()

		// Update the solidity types to match the new field names (column names).
		if table.SolidityTypes == nil {
			table.SolidityTypes = make(map[string]string)
		}
		table.SolidityTypes[columnName] = solidityType

		// Update the postgres types to match the new field names (column names).
		if table.PostgresTypes == nil {
			table.PostgresTypes = make(map[string]string)
		}
		table.PostgresTypes[columnName] = postgresType

		// Update the records of the column names as they are originally spelled.
		if table.OnChainColNames == nil {
			table.OnChainColNames = make(map[string]string)
		}
		table.OnChainColNames[columnName] = columnNameFromChain
	}
	// Update the field names in the schema.
	table.FieldNames = newTableFieldNames

	// Save the completed Table to the schemas table.
	tableJSON, _ := json.Marshal(table)
	schemasTable := mode.SchemasTable(il.ChainID())
	row := mode.TableRow{
		"world_address": event.WorldAddress(),
		"namespace":     table.Namespace,
		"table_name":    table.Name,
		"table_json":    string(tableJSON),
	}
	filter := map[string]interface{}{
		"world_address": event.WorldAddress(),
		"namespace":     table.Namespace,
		"table_name":    table.Name,
	}
	il.wl.UpdateOrInsertRow(schemasTable, row, filter)

	// Update the table field names based on the new metadata.
	il.wl.RenameTableFields(table, oldTableFieldNames, table.FieldNames)

	// Now insert the record into the mudstore metadata table.
	mudstoreMetadataTable := il.tableStore.MustGetTable(
		il.ChainID(),
		event.WorldAddress(),
		mode.TableIdToTableName(mode.MUDStoreStoreMetadataTableId()),
	)

	// Decode the data directly into the table row.
	decodedFieldData := mudstoreMetadataTable.StoreCoreFieldSchema.DecodeFieldData(event.Data)

	// Build the decoded key data directly. This is because we save the table ID as a hex encoded string of uint256.
	decodedKeyData := storecore.NewDecodedDataFromSchemaType([]storecore.SchemaType{storecore.STRING})
	decodedKeyData.Add(&storecore.DataWithSchemaType{
		Data:       tableID,
		SchemaType: storecore.STRING,
	})
	// Create the row.
	mudstoreSchemaTableRow := mudstoreMetadataTable.RowFromDecodedData(decodedKeyData, decodedFieldData)

	// Insert the row.
	il.wl.InsertRow(mudstoreMetadataTable, mudstoreSchemaTableRow)

	il.logger.Info("setRecord: finished handling schema update",
		zap.String("world_address", event.WorldAddress()),
		zap.String("table_id", tableID),
		zap.String("table_json", string(tableJSON)),
	)
	return nil
}

// handleGenericTableEvent handles a generic event to set a row in a table in the database.
//
// Parameters:
// - event (*storecore.StorecoreStoreSetRecord): The StoreSetRecord event to handle, containing the key, world address,
// and row data.
//
// Returns:
// - void.
func (il *Layer) handleGenericTableEvent(event *storecore.StorecoreStoreSetRecord) error {
	tableID := mode.TableIdToHex(event.TableId)
	il.logger.Info("setRecord: start handling generic table event",
		zap.String("world_address", event.WorldAddress()),
		zap.String("table_id", tableID),
	)

	// Fetch the target Table.
	table, err := il.tableStore.GetTable(il.ChainID(), event.WorldAddress(), mode.TableIdToTableName(tableID))
	if err != nil {
		il.logger.Error("setRecord: failed to get table schema", zap.Error(err))
		return nil
	}

	// Decode the row field and key data.
	decodedFieldData := table.StoreCoreFieldSchema.DecodeFieldData(event.Data)
	decodedKeyData := table.StoreCoreKeySchema.DecodeKeyData(event.Key)
	// Create a row for the table from the decoded data.
	row := table.RowFromDecodedData(decodedKeyData, decodedFieldData)

	// Build the "filter" from the deleteRecord key. This is used to find the actual row/record that
	// we're deleting.
	filter := table.KeyToFilter(event.Key)

	// Insert or update the row in the table.
	il.wl.UpdateOrInsertRow(table, row, filter)

	il.logger.Info("setRecord: finished handling generic table event",
		zap.String("world_address", event.WorldAddress()),
		zap.String("table_id", tableID),
		zap.Any("row", row),
	)
	return nil
}
