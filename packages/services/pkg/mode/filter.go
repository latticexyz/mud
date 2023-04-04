package mode

import (
	pb_mode "latticexyz/mud/packages/services/protobuf/go/mode"
)

// FilterFromKV creates a Filter object for a given key-value pair, where the filter checks if the value of a field in the TableSchema
// is equal to the given value.
//
// Parameters:
// - key (string): the name of the field in the table that the filter is checking against
// - value (string): the value that the filter is checking for
//
// Returns:
// - (*pb_mode.Filter): a pointer to a Filter object that represents the filter condition where a specific field in the table is equal to a given value.
func (schema *TableSchema) FilterFromKV(key, value string) *pb_mode.Filter {
	return &pb_mode.Filter{
		Field: &pb_mode.Field{
			TableName:  schema.TableName,
			TableField: key,
		},
		Operator: "=",
		Value:    value,
	}
}

// FilterFromMap creates an array of Filter objects from a map of key-value pairs, where each filter checks if the value of a field in the TableSchema
// is equal to the given value.
//
// Parameters:
// - filter (map[string]string): a map where each key is the name of a field in the table that the filter is checking against,
// and each value is the value that the filter is checking for
//
// Returns:
// - ([]*pb_mode.Filter): an array of pointers to Filter objects that represent the filter conditions where specific fields in the table are equal to given values.
func (schema *TableSchema) FilterFromMap(filter map[string]string) []*pb_mode.Filter {
	filters := make([]*pb_mode.Filter, 0)
	for key, value := range filter {
		filters = append(filters, schema.FilterFromKV(key, value))
	}
	return filters
}
