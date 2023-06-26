package mode

import (
	"encoding/json"
	"fmt"
	"reflect"
	"strings"
)

// BuildTag builds a gorm tag for a given column.
func (table *Table) BuildTag(col string) string {
	isKey := table.GetIsKey(col)
	var tag strings.Builder
	if isKey {
		tag.WriteString(`gorm:"primaryKey;`)
	} else {
		tag.WriteString(`gorm:"`)
	}
	tag.WriteString(`type:` + table.GetPostgresType(col) + `;`)
	tag.WriteString(fmt.Sprintf(`column:%s"`, strings.ToLower(col)))
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

// Remarshal remarshals a struct.
func Remarshal(dst, src interface{}) error {
	b, err := json.Marshal(src)
	if err != nil {
		return err
	}
	return json.Unmarshal(b, dst)
}
