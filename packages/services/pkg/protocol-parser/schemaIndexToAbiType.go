package protocolparser

import schematype "latticexyz/mud/packages/services/pkg/schema-type"

func SchemaIndexToAbiType(schema Schema, schemaIndex int) schematype.SchemaType {
	if schemaIndex < len(schema.StaticFields) {
		return schema.StaticFields[schemaIndex]
	}
	return schema.DynamicFields[schemaIndex-len(schema.StaticFields)]
}
