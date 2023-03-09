package mode

import (
	pb_mode "latticexyz/mud/packages/services/protobuf/go/mode"
)

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

func (schema *TableSchema) FilterFromMap(filter map[string]string) []*pb_mode.Filter {
	filters := make([]*pb_mode.Filter, 0)
	for key, value := range filter {
		filters = append(filters, schema.FilterFromKV(key, value))
	}
	return filters
}
