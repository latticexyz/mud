package ingress

import (
	"encoding/json"
	"latticexyz/mud/packages/services/pkg/mode"
	"latticexyz/mud/packages/services/pkg/mode/schema"
	"latticexyz/mud/packages/services/pkg/mode/storecore"
	"latticexyz/mud/packages/services/pkg/mode/write"

	"github.com/ethereum/go-ethereum/common/hexutil"
	"github.com/umbracle/ethgo/abi"
	"go.uber.org/zap"
)

func (il *IngressLayer) handleSetRecordEvent(event *storecore.StorecoreStoreSetRecord) {
	il.logger.Info("handling set record event", zap.String("table", hexutil.EncodeBig(event.Table)))

	tableId := hexutil.EncodeBig(event.Table)
	// Handle the following scenarios:
	// 1. The table is the schema table. This means that a new table should be created.
	// 2. The table is the metadata table. This means we need to update a schema of an existing table.
	// 3. The table is a generic table. This means we need to update rows of an existing table.
	switch tableId {
	case storecore.SchemaTable():
		il.handleSchemaTableEvent(event)
	case storecore.MetadataTable():
		il.handleMetadataTableEvent(event)
	default:
		il.handleGenericTableEvent(event)
	}
}

func (il *IngressLayer) handleSetFieldEvent(event *storecore.StorecoreStoreSetField) {
	il.logger.Info("handling set field event", zap.String("table", hexutil.EncodeBig(event.Table)))

	// Fetch the schema for the target table.
	tableSchema, err := il.schemaCache.GetTableSchema(il.chainConfig.Id, event.WorldAddress(), schema.MUDTable(il.chainConfig.Id, event.WorldAddress(), hexutil.EncodeBig(event.Table)))
	if err != nil {
		il.logger.Error("failed to get table schema", zap.Error(err))
		return
	}

	// Decode the field.
	fieldValue := storecore.DecodeDataField(event.Data, tableSchema.StoreCoreSchemaTypePair, event.SchemaIndex)

	// Get the name of the field. This is the name of the column in the database and the way to
	// get it is just to lookup what the field name is at the specified index in the schema, since
	// schema types and field names are 1:1.
	fieldName := tableSchema.FieldNames[event.SchemaIndex]

	// TODO: properly parse out the key and build a "filter" that the builder can use.
	// Build the filter for the row to update.
	filter := KeyToFilter(tableSchema, event.Key)

	// Create a row object. It's a partial row because we're only updating a single field.
	partialRow := write.RowKV{
		fieldName: fieldValue,
	}
	// Update the row.
	il.wl.UpdateRow(tableSchema, partialRow, filter)
}

func (il *IngressLayer) handleDeleteRecordEvent(event *storecore.StorecoreStoreDeleteRecord) {
	il.logger.Info("handling delete record event", zap.String("world_address", event.WorldAddress()), zap.String("table_name", hexutil.EncodeBig(event.Table)))

	// Fetch the schema for the target table.
	tableSchema, err := il.schemaCache.GetTableSchema(il.chainConfig.Id, event.WorldAddress(), schema.MUDTable(il.chainConfig.Id, event.WorldAddress(), hexutil.EncodeBig(event.Table)))
	if err != nil {
		il.logger.Error("failed to get table schema", zap.Error(err))
		return
	}

	// TODO: properly parse out the key and build a "filter" that the delete request builder can use.
	filter := KeyToFilter(tableSchema, event.Key)
	il.wl.DeleteRow(tableSchema, filter)

	il.logger.Info("delete record event handled", zap.String("world_address", event.WorldAddress()), zap.String("table_name", hexutil.EncodeBig(event.Table)))
}

func (il *IngressLayer) handleSchemaTableEvent(event *storecore.StorecoreStoreSetRecord) {
	il.logger.Info("handling schema table event", zap.String("world_address", event.WorldAddress()), zap.String("table_name", hexutil.Encode(event.Key[0][:])))

	// Parse out the schema types (both static and dynamic) for the table.
	storeCoreSchemaTypePair := storecore.DecodeSchemaTypePair(event.Data)
	// Create a schema table row for the table.
	tableSchema := &mode.TableSchema{
		TableName:               schema.MUDTable(il.chainConfig.Id, event.WorldAddress(), hexutil.Encode(event.Key[0][:])),
		StoreCoreSchemaTypePair: storeCoreSchemaTypePair,
	}
	// Populate the schema with default values.
	for idx, schemaType := range storecore.CombineSchemaTypePair(tableSchema.StoreCoreSchemaTypePair) {
		columnName := schema.DefaultFieldName(idx)
		tableSchema.FieldNames = append(tableSchema.FieldNames, columnName)

		solidityType := storecore.SchemaTypeToSolidityType(schemaType)
		postgresType := storecore.SchemaTypeToPostgresType(schemaType)

		if tableSchema.SolidityTypes == nil {
			tableSchema.SolidityTypes = make(map[string]string)
		}
		tableSchema.SolidityTypes[columnName] = solidityType

		if tableSchema.PostgresTypes == nil {
			tableSchema.PostgresTypes = make(map[string]string)
		}
		tableSchema.PostgresTypes[columnName] = postgresType
	}

	// Create the table with the schema so far (this can be updated with metadata later).
	il.wl.CreateTable(tableSchema)
	tableSchemaJson, _ := json.Marshal(tableSchema)

	// Save the row with whatever information is known so far into the schema table.
	schemaTableSchema := schema.SchemaTableSchema(il.chainConfig.Id)
	row := write.RowKV{
		"world_address": event.WorldAddress(),
		"table_name":    tableSchema.TableName,
		"schema":        string(tableSchemaJson),
	}
	// This takes care of the update being unique since the table name is based on both the world
	// address, chain ID, and table name.
	filter := schemaTableSchema.FilterFromMap(map[string]string{"table_name": tableSchema.TableName})
	il.wl.UpdateOrInsertRow(schemaTableSchema, row, filter)

	il.logger.Info("schema table event handled", zap.String("world_address", event.WorldAddress()), zap.String("table_name", hexutil.Encode(event.Key[0][:])), zap.String("schema", string(tableSchemaJson)))
}

func (il *IngressLayer) handleMetadataTableEvent(event *storecore.StorecoreStoreSetRecord) {
	il.logger.Info("handling metadata table event", zap.String("world_address", event.WorldAddress()), zap.String("table_name", hexutil.Encode(event.Key[0][:])))

	// Fetch the schema for the target table (table to which the metadata is being added).
	tableSchema, err := il.schemaCache.GetTableSchema(il.chainConfig.Id, event.Raw.Address.Hex(), schema.MUDTable(il.chainConfig.Id, event.WorldAddress(), hexutil.Encode(event.Key[0][:])))
	if err != nil {
		il.logger.Error("failed to fetch schema for target table", zap.Error(err))
		return
	}

	// Fetch the schema for the metadata table.
	metadataTableSchema, err := il.schemaCache.GetTableSchema(il.chainConfig.Id, event.WorldAddress(), schema.MUDTable(il.chainConfig.Id, event.WorldAddress(), storecore.MetadataTable()))
	if err != nil {
		il.logger.Error("failed to fetch schema for metadata table", zap.Error(err))
		return
	}

	// Decode the metadata.
	decodedMetadata := storecore.DecodeData(event.Data, metadataTableSchema.StoreCoreSchemaTypePair)

	// Since we know the structure of the metadata, we decode it directly into types and handle.
	tableReadableName := decodedMetadata.DataAt(0)
	tableColumnNames := decodedMetadata.DataAt(1)

	// Extract the column names from the metadata.
	tableColumnNamesBytes, _ := hexutil.Decode(tableColumnNames)
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
		return
	}

	// Add extracted metdata to the schema, essentially completing it.
	//
	// 1. Add the readable name.
	// 2. Add the column names and types.
	tableSchema.ReadableName = tableReadableName

	// Keep a record of the old field names so we can update the table.
	oldTableFieldNames := tableSchema.FieldNames
	// Keep a record of the new field names so we can update the table.
	newTableFieldNames := []string{}

	for idx, schemaType := range storecore.CombineSchemaTypePair(tableSchema.StoreCoreSchemaTypePair) {
		columnName := outStruct.Cols[idx]
		newTableFieldNames = append(newTableFieldNames, columnName)

		solidityType := storecore.SchemaTypeToSolidityType(schemaType)
		postgresType := storecore.SchemaTypeToPostgresType(schemaType)

		// Update the solidity types to match the new field names (column names).
		if tableSchema.SolidityTypes == nil {
			tableSchema.SolidityTypes = make(map[string]string)
		}
		tableSchema.SolidityTypes[columnName] = solidityType

		// Update the postgres types to match the new field names (column names).
		if tableSchema.PostgresTypes == nil {
			tableSchema.PostgresTypes = make(map[string]string)
		}
		tableSchema.PostgresTypes[columnName] = postgresType
	}
	// Update the field names in the schema.
	tableSchema.FieldNames = newTableFieldNames

	// Save the completed schema to the schema table.
	tableSchemaJson, _ := json.Marshal(tableSchema)
	schemaTableSchema := schema.SchemaTableSchema(il.chainConfig.Id)
	row := write.RowKV{
		"world_address": event.WorldAddress(),
		"table_name":    tableSchema.TableName,
		"schema":        string(tableSchemaJson),
	}
	filter := schemaTableSchema.FilterFromMap(map[string]string{"table_name": tableSchema.TableName})
	il.wl.UpdateOrInsertRow(schemaTableSchema, row, filter)

	// Update the table field names based on the new metadata.
	il.wl.RenameTableFields(tableSchema, oldTableFieldNames, tableSchema.FieldNames)

	il.logger.Info("metadata table event handled (schema updated)", zap.String("world_address", event.WorldAddress()), zap.String("table_name", hexutil.Encode(event.Key[0][:])), zap.String("schema", string(tableSchemaJson)))
}

func (il *IngressLayer) handleGenericTableEvent(event *storecore.StorecoreStoreSetRecord) {
	il.logger.Info("handling generic table event", zap.String("world_address", event.WorldAddress()), zap.String("table_name", hexutil.EncodeBig(event.Table)))

	// Fetch the schema for the target table.
	tableSchema, err := il.schemaCache.GetTableSchema(il.chainConfig.Id, event.WorldAddress(), schema.MUDTable(il.chainConfig.Id, event.WorldAddress(), hexutil.EncodeBig(event.Table)))
	if err != nil {
		il.logger.Error("failed to get table schema", zap.Error(err))
		return
	}

	// Decode the row record data.
	decodedData := storecore.DecodeData(event.Data, tableSchema.StoreCoreSchemaTypePair)

	// Create a row for the table.
	row := write.RowKV{}
	for idx, field_name := range tableSchema.FieldNames {
		row[field_name] = decodedData.DataAt(idx)
	}

	// Insert the row into the table.
	il.wl.InsertRow(tableSchema, row)

	il.logger.Info("generic table event handled", zap.String("world_address", event.WorldAddress()), zap.String("table_name", hexutil.EncodeBig(event.Table)), zap.Any("row", row))
}
