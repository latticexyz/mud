package mode

import "latticexyz/mud/packages/services/pkg/mode/storecore"

// RowFromDecodedData creates a TableRow instance from the given DecodedData instances.
//
// Parameters:
// - decodedKeyData (*storecore.DecodedData): A pointer to a DecodedData instance containing the decoded key data for
// the row.
// - decodedFieldData (*storecore.DecodedData): A pointer to a DecodedData instance containing the decoded field data
// for the row.
//
// Returns:
// (TableRow) - A map of strings to interface{} representing a row for the table.
func (table *Table) RowFromDecodedData(
	decodedKeyData *storecore.DecodedData,
	decodedFieldData *storecore.DecodedData,
) TableRow {
	// Create a row for the table.
	row := TableRow{}

	// DecodedData has everything stored in a single values array. So we start the index at 0 and
	// go to the length of the key/field names.
	// First add the keys.
	if decodedKeyData != nil {
		for index := 0; index < decodedKeyData.Length(); index++ {
			keyName := table.KeyNames[index]
			row[keyName] = decodedKeyData.GetData(index)
		}
	}
	// Add the fields.
	if decodedFieldData != nil {
		for index := 0; index < decodedFieldData.Length(); index++ {
			fieldName := table.FieldNames[index]
			row[fieldName] = decodedFieldData.GetData(index)
		}
	}
	return row
}
