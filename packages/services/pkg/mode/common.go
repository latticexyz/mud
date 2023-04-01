package mode

import "latticexyz/mud/packages/services/protobuf/go/mode"

// FieldToString converts a field struct to a string.
//
// Parameters:
// - field (*mode.Field): a pointer to a field struct that contains information about the field.
//
// Returns:
// - (string) a string that represents the table name and table field, concatenated with a dot (.)
func FieldToString(field *mode.Field) string {
	return field.TableName + "." + field.TableField
}
