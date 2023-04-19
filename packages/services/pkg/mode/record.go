package mode

import (
	"encoding/json"
	"fmt"
	"reflect"
	"strings"

	dynamicstruct "github.com/ompluscator/dynamic-struct"
)

func BuildTag(key string, tableSchema *TableSchema) string {
	isKey := tableSchema.IsKey[key]
	var tag strings.Builder
	if isKey {
		tag.WriteString(`gorm:"primaryKey;`)
	} else {
		tag.WriteString(`gorm:"`)
	}
	// if strings.Contains(tableSchema.PostgresTypes[key], "[]") {
	// 	tag.WriteString(`type:text[];`)
	// }
	tag.WriteString(fmt.Sprintf(`column:%s"`, strings.ToLower(key)))
	return tag.String()
}

func BuildType(recordRaw map[string]interface{}, tableSchema *TableSchema) reflect.Type {
	fields := make([]reflect.StructField, 0, len(recordRaw))

	// Add keys.
	for _, key := range tableSchema.KeyNames {
		// Skip if not in record.
		if _, ok := recordRaw[key]; !ok {
			continue
		}
		fields = append(fields, reflect.StructField{
			Name: strings.ToTitle(key),
			Type: reflect.TypeOf(recordRaw[key]),
			Tag:  reflect.StructTag(BuildTag(key, tableSchema)),
		})
	}
	// Add fields.
	for _, field := range tableSchema.FieldNames {
		// Skip if not in record.
		if _, ok := recordRaw[field]; !ok {
			continue
		}
		fields = append(fields, reflect.StructField{
			Name: strings.ToTitle(field),
			Type: reflect.TypeOf(recordRaw[field]),
			Tag:  reflect.StructTag(BuildTag(field, tableSchema)),
		})
	}

	// println("fields:")
	// for _, field := range fields {
	// 	println(field.Name)
	// 	println(field.Type.String())
	// }

	// for key, value := range recordRaw {
	// 	isKey := tableSchema.IsKey[key]
	// 	var tag strings.Builder
	// 	if isKey {
	// 		tag.WriteString(`gorm:"primaryKey;`)
	// 	} else {
	// 		tag.WriteString(`gorm:"`)
	// 	}
	// 	if strings.Contains(tableSchema.PostgresTypes[key], "[]") {
	// 		tag.WriteString(`type:text[];`)
	// 	}
	// 	tag.WriteString(fmt.Sprintf(`column:%s"`, strings.ToLower(key)))
	// 	fields = append(fields, reflect.StructField{
	// 		Name: strings.ToTitle(key),
	// 		Type: reflect.TypeOf(value),
	// 		Tag:  reflect.StructTag(tag.String()),
	// 	})
	// }

	return reflect.StructOf(fields)
}

func BuildRecord(recordRaw map[string]interface{}, tableSchema *TableSchema) (interface{}, error) {
	recordType := BuildType(recordRaw, tableSchema)
	record := reflect.New(recordType).Interface()

	if err := Remarshal(&record, recordRaw); err != nil {
		return nil, fmt.Errorf("updating struct: %s", err)
	}

	return record, nil
}

func Remarshal(dst, src interface{}) error {
	b, err := json.Marshal(src)
	if err != nil {
		return err
	}
	return json.Unmarshal(b, dst)
}

func BuildRecord__Instance(recordRaw map[string]interface{}, tableSchema *TableSchema) (interface{}, error) {
	instance := dynamicstruct.NewStruct()

	for _, key := range tableSchema.KeyNames {
		// Skip if not in record.
		if _, ok := recordRaw[key]; !ok {
			continue
		}
		instance = instance.AddField(strings.ToTitle(key), reflect.TypeOf(recordRaw[key]), BuildTag(key, tableSchema))
	}
	// Add fields.
	for _, field := range tableSchema.FieldNames {
		// Skip if not in record.
		if _, ok := recordRaw[field]; !ok {
			continue
		}
		instance = instance.AddField(strings.ToTitle(field), reflect.TypeOf(recordRaw[field]), BuildTag(field, tableSchema))
	}
	instanceBuilt := instance.Build().New()

	if err := Remarshal(&instanceBuilt, recordRaw); err != nil {
		return nil, err
	}
	return instance, nil
}
