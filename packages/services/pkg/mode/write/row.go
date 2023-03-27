package write

import (
	"latticexyz/mud/packages/services/pkg/mode"
	"latticexyz/mud/packages/services/pkg/mode/storecore"
)

// RowFromDecodedData creates a RowKV instance from the given DecodedData instances and TableSchema.
//
// Parameters:
// - decodedKeyData (*storecore.DecodedData): A pointer to a DecodedData instance containing the decoded key data for the row.
// - decodedFieldData (*storecore.DecodedData): A pointer to a DecodedData instance containing the decoded field data for the row.
// - tableSchema (*mode.TableSchema): A pointer to a TableSchema instance containing the schema for the table.
//
// Returns:
// (RowKV) - A map of strings to interface{} representing a row for the table.
func RowFromDecodedData(decodedKeyData *storecore.DecodedData, decodedFieldData *storecore.DecodedData, tableSchema *mode.TableSchema) RowKV {
	// Create a row for the table.
	row := RowKV{}
	// Add the keys.
	for idx, key_name := range tableSchema.KeyNames {
		row[key_name] = decodedKeyData.DataAt(idx)
	}
	// Add the fields.
	for idx, field_name := range tableSchema.FieldNames {
		row[field_name] = decodedFieldData.DataAt(idx)
	}

	return row
}
