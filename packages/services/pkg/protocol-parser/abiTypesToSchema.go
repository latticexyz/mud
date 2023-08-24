package protocolparser

import schematype "latticexyz/mud/packages/services/pkg/schema-type"

func AbiTypesToSchema(abiTypes []schematype.SchemaType) Schema {
	staticFields := []schematype.SchemaType{}
	dynamicFields := []schematype.SchemaType{}

	for _, abiType := range abiTypes {
		if abiType.IsDynamic() {
			dynamicFields = append(dynamicFields, abiType)
		} else {
			staticFields = append(staticFields, abiType)
		}
	}

	return Schema{
		StaticFields:  staticFields,
		DynamicFields: dynamicFields,
	}
}
