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

	// DecodedData has everything stored in a single values array. So we start the index at 0 and
	// go to the length of the key/field names.
	// First add the keys.
	for index := 0; index < decodedKeyData.Length(); index++ {
		key_name := tableSchema.KeyNames[index]
		row[key_name] = decodedKeyData.GetData(index)
	}
	// Add the fields.
	for index := 0; index < decodedFieldData.Length(); index++ {
		field_name := tableSchema.FieldNames[index]
		row[field_name] = decodedFieldData.GetData(index)
	}
	return row
}
