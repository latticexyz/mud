package protocolparser

import (
	schematype "latticexyz/mud/packages/services/pkg/schema-type"

	"github.com/andriidski/abiencode-go/abi"
)

func IsArray(value interface{}) bool {
	_, ok := value.([]interface{})
	return ok
}

func EncodeField(fieldType schematype.SchemaType, value interface{}) string {
	if fieldType.IsArray() {
		staticFieldType := schematype.ArrayAbiTypeToStaticAbiType(fieldType)
		valueArr, ok := value.([]interface{})
		if !ok {
			panic("value is not an array")
		}
		staticFieldTypeArr := make([]schematype.SchemaType, len(valueArr))
		for i := range valueArr {
			staticFieldTypeArr[i] = staticFieldType
		}
		return abi.EncodePacked(SchemaTypesToStringTypes(staticFieldTypeArr), valueArr)
	}
	return abi.EncodePacked(SchemaTypesToStringTypes([]schematype.SchemaType{fieldType}), []interface{}{value})
}
