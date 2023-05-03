package mode

import (
	"encoding/json"
	"fmt"
	"reflect"
	"strings"

	dynamicstruct "github.com/ompluscator/dynamic-struct"
)

// BuildTag builds a gorm tag for a given key.
func BuildTag(key string, tableSchema *TableSchema) string {
	isKey := tableSchema.IsKey[key]
	var tag strings.Builder
	if isKey {
		tag.WriteString(`gorm:"primaryKey;`)
	} else {
		tag.WriteString(`gorm:"`)
	}
	tag.WriteString(`type:` + tableSchema.PostgresTypes[key] + `;`)
	tag.WriteString(fmt.Sprintf(`column:%s"`, strings.ToLower(key)))
	return tag.String()
}

// BuildType builds a struct type for a given record, using the table schema for metadata
// such as which key is a primary key.
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

	return reflect.StructOf(fields)
}

// BuildRecord builds a struct for a given record.
func BuildRecord(recordRaw map[string]interface{}, tableSchema *TableSchema) (interface{}, error) {
	recordType := BuildType(recordRaw, tableSchema)
	record := reflect.New(recordType).Interface()

	if err := Remarshal(&record, recordRaw); err != nil {
		return nil, fmt.Errorf("updating struct: %s", err)
	}

	return record, nil
}

// Remarshal remarshals a struct.
func Remarshal(dst, src interface{}) error {
	b, err := json.Marshal(src)
	if err != nil {
		return err
	}
	return json.Unmarshal(b, dst)
}

// BuildRecord__Instance builds a struct for a given record.
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
