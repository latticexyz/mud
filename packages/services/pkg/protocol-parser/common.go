package protocolparser

import schematype "latticexyz/mud/packages/services/pkg/schema-type"

type Schema struct {
	StaticFields  []schematype.SchemaType
	DynamicFields []schematype.SchemaType
}

type TableSchema struct {
	KeySchema   Schema
	ValueSchema Schema
}
