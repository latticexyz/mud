package mode

import (
	"strings"

	"github.com/umbracle/ethgo/abi"
)

// NamespacedTableName returns the fully-qualified table name in the format "namespace.table_name".
//
// Returns:
//   - (string): The fully-qualified table name.
func (table *Table) NamespacedName() string {
	return table.Namespace + `."` + table.Name + `"`
}

// GetEncodingTypes returns the encoding types for the specified field names and projections.
//
// Parameters:
//   - fieldNames ([]string): A slice of field names.
//   - fieldProjections (map[string]string): A map of field projections.
//
// Returns:
//   - ([]*abi.Type): A slice of encoding types.
//   - ([]string): A slice of encoding type strings.
func (table *Table) GetEncodingTypes(fieldNames []string, fieldProjections map[string]string) ([]*abi.Type, []string) {
	_types := []*abi.Type{}
	_typesStr := []string{}
	for _, fieldName := range fieldNames {
		var projectedField string
		// If the field is projected, use the projected field name, otherwise use the original field name.
		if fieldProjections[fieldName] != "" {
			projectedField = fieldProjections[fieldName]
		} else {
			projectedField = fieldName
		}
		solType := table.SolidityTypes[projectedField]

		// Create the Type object for the type. If the type is an array, we need to wrap it in a tuple.
		var _type *abi.Type
		if strings.Contains(solType, "[]") {
			_type = abi.MustNewType("tuple(" + solType + " cols)")
		} else {
			_type = abi.MustNewType(solType)
		}

		_types = append(_types, _type)
		_typesStr = append(_typesStr, _type.String())
	}
	return _types, _typesStr
}
