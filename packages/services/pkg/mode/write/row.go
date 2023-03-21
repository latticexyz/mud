package write

import (
	"latticexyz/mud/packages/services/pkg/mode"
	"latticexyz/mud/packages/services/pkg/mode/storecore"
)

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
