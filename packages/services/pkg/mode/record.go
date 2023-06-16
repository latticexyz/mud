package mode

import (
	"encoding/json"
	"fmt"
	"reflect"
	"strings"

	dynamicstruct "github.com/ompluscator/dynamic-struct"
)

// BuildTag builds a gorm tag for a given key.
func (table *Table) BuildTag(key string) string {
	isKey := table.IsKey[key]
	var tag strings.Builder
	if isKey {
		tag.WriteString(`gorm:"primaryKey;`)
	} else {
		tag.WriteString(`gorm:"`)
	}
	tag.WriteString(`type:` + table.PostgresTypes[key] + `;`)
	tag.WriteString(fmt.Sprintf(`column:%s"`, strings.ToLower(key)))
	return tag.String()
}

// BuildType builds a struct type for a given record, using the table for metadata
// such as which key is a primary key.
func (table *Table) BuildType(recordRaw map[string]interface{}) reflect.Type {
	fields := make([]reflect.StructField, 0, len(recordRaw))

	// Add keys.
	for _, key := range table.KeyNames {
		// Skip if not in record.
		if _, ok := recordRaw[key]; !ok {
			continue
		}
		fields = append(fields, reflect.StructField{
			Name: strings.ToTitle(key),
			Type: reflect.TypeOf(recordRaw[key]),
			Tag:  reflect.StructTag(table.BuildTag(key)),
		})
	}
	// Add fields.
	for _, field := range table.FieldNames {
		// Skip if not in record.
		if _, ok := recordRaw[field]; !ok {
			continue
		}
		fields = append(fields, reflect.StructField{
			Name: strings.ToTitle(field),
			Type: reflect.TypeOf(recordRaw[field]),
			Tag:  reflect.StructTag(table.BuildTag(field)),
		})
	}

	return reflect.StructOf(fields)
}

// BuildRecord builds a struct for a given record.
func (table *Table) BuildRecord(recordRaw map[string]interface{}) (interface{}, error) {
	recordType := table.BuildType(recordRaw)
	record := reflect.New(recordType).Interface()

	if err := Remarshal(&record, recordRaw); err != nil {
		return nil, fmt.Errorf("updating struct: %w", err)
	}

	return record, nil
}

// BuildRecord__Instance builds a struct for a given record.
func (table *Table) BuildRecord__Instance(recordRaw map[string]interface{}) (interface{}, error) {
	instance := dynamicstruct.NewStruct()

	for _, key := range table.KeyNames {
		// Skip if not in record.
		if _, ok := recordRaw[key]; !ok {
			continue
		}
		instance = instance.AddField(strings.ToTitle(key), reflect.TypeOf(recordRaw[key]), table.BuildTag(key))
	}
	// Add fields.
	for _, field := range table.FieldNames {
		// Skip if not in record.
		if _, ok := recordRaw[field]; !ok {
			continue
		}
		instance = instance.AddField(strings.ToTitle(field), reflect.TypeOf(recordRaw[field]), table.BuildTag(field))
	}
	instanceBuilt := instance.Build().New()

	if err := Remarshal(&instanceBuilt, recordRaw); err != nil {
		return nil, err
	}
	return instance, nil
}

// Remarshal remarshals a struct.
func Remarshal(dst, src interface{}) error {
	b, err := json.Marshal(src)
	if err != nil {
		return err
	}
	return json.Unmarshal(b, dst)
}
