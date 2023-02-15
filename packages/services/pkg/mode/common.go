package mode

import "latticexyz/mud/packages/services/protobuf/go/mode"

func FieldToString(field *mode.Field) string {
	return field.TableName + "." + field.TableField
}
