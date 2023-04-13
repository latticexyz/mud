package mode

import (
	"encoding/json"
	"latticexyz/mud/packages/services/pkg/logger"
	"latticexyz/mud/packages/services/pkg/mode/db"
	"latticexyz/mud/packages/services/protobuf/go/mode"
	"time"

	abi_geth "github.com/ethereum/go-ethereum/accounts/abi"

	"github.com/umbracle/ethgo/abi"

	"github.com/jmoiron/sqlx"
	"go.uber.org/zap"
)

// PrepareForScan prepares the rows object for scanning and returns the column names, row, and rowInterface.
//
// Parameters:
//   - rows (*sqlx.Rows): The sqlx.Rows object.
//
// Returns:
//   - (colNames []string): A slice of column names.
//   - (row []interface{}): A slice of row interfaces.
//   - (rowInterface []interface{}): A slice of row interfaces.
func PrepareForScan(rows *sqlx.Rows) (colNames []string, row []interface{}, rowInterface []interface{}) {
	colNames, _ = rows.Columns()
	row = make([]interface{}, len(colNames))
	rowInterface = make([]interface{}, len(colNames))
	for i := range row {
		rowInterface[i] = &row[i]
	}
	return
}

func EncodeParameters(parameters []string, data []interface{}) ([]byte, error) {
	args := make(abi_geth.Arguments, 0)

	for _, p := range parameters {
		arg := abi_geth.Argument{}
		var err error
		arg.Type, err = abi_geth.NewType(p, "", nil)
		if err != nil {
			return nil, err
		}
		args = append(args, arg)
	}

	return args.Pack(data...)
}

// SerializeRow serializes a single row with all fields encoded and returns it as a mode.Row.
//
// Parameters:
//   - row ([]interface{}): A slice of fields for a single row.
//   - colNames ([]string): A slice of column names.
//   - colEncodingTypes ([]*abi.Type): A slice of column encoding types.
//
// Returns:
//   - (*mode.Row): A pointer to the mode.Row containing the serialized row.
//   - (error): An error, if any occurred during serialization.
func SerializeRow(row []interface{}, colNames []string, colEncodingTypes []*abi.Type) (*mode.Row, error) {
	// A single row but every field is encoded.
	values := [][]byte{}

	// Iterate columns and serialize each field for this row.
	for i, _ := range colNames {
		colEncodingType := colEncodingTypes[i]

		var encodedField []byte
		var err error
		if row[i] == nil {
			// If the field is null, we just encode it as an empty string.
			encodedField = []byte("")
		} else {
			// If the field is a map, we need to marshal it to JSON first.
			if _map, ok := row[i].(map[string]interface{}); ok {
				_mapStr, err := json.Marshal(_map)
				if err != nil {
					return nil, err
				}
				encodedField, err = colEncodingType.Encode(_mapStr)
				if err != nil {
					return nil, err
				}
			} else if colEncodingTypes[i].String() == "bytes" || colEncodingTypes[i].String() == "string" {
				// Handle bytes / string specially to avoid the offset missing issue.
				encodedField, err = EncodeParameters(
					[]string{colEncodingType.String()},
					[]interface{}{row[i]},
				)
				if err != nil {
					logger.GetLogger().Error("error while serializing with EncodeParameters", zap.Error(err))
					return nil, err
				}
			} else {
				encodedField, err = colEncodingType.Encode(row[i])
			}
			if err != nil {
				return nil, err
			}
		}

		values = append(values, encodedField)
	}

	return &mode.Row{
		Values: values,
	}, nil
}

// SerializeRows serializes multiple rows from the provided sqlx.Rows object and returns a mode.GenericTable.
//
// Parameters:
//   - rows (*sqlx.Rows): The sqlx.Rows object.
//   - tableSchema (*TableSchema): A pointer to the schema of the table.
//   - fieldProjections (map[string]string): A map of field projections.
//
// Returns:
//   - (*mode.GenericTable): A pointer to the mode.GenericTable containing the serialized rows.
//   - (error): An error, if any occurred during serialization.
func SerializeRows(rows *sqlx.Rows, tableSchema *TableSchema, fieldProjections map[string]string) (*mode.GenericTable, error) {
	tsStart := time.Now()

	colNames, row, rowInterface := PrepareForScan(rows)
	colEncodingTypes, colEncodingTypesStrings := tableSchema.GetEncodingTypes(colNames, fieldProjections)

	serializedRows := []*mode.Row{}

	for rows.Next() {
		rows.Scan(rowInterface...)
		serializedRow, err := SerializeRow(row, colNames, colEncodingTypes)
		if err != nil {
			logger.GetLogger().Warn("error while serializing", zap.Error(err), zap.String("table", tableSchema.NamespacedTableName()))
		} else {
			serializedRows = append(serializedRows, serializedRow)
		}
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	// Record how long the serialization took.
	tsElapsed := time.Since(tsStart)
	logger.GetLogger().Info("serialization finished", zap.String("time taken", tsElapsed.String()), zap.String("table", tableSchema.NamespacedTableName()))

	return &mode.GenericTable{
		Cols:  CapitalizeColNames(colNames, tableSchema),
		Rows:  serializedRows,
		Types: colEncodingTypesStrings,
	}, nil
}

// SerializeStreamEvent serializes a single stream event and returns it as a mode.GenericTable.
//
// Parameters:
//   - event (*db.StreamEvent): The stream event to serialize.
//   - tableSchema (*TableSchema): A pointer to the schema of the table.
//   - fieldProjections (map[string]string): A map of field projections.
//
// Returns:
//   - (*mode.GenericTable): A pointer to the mode.GenericTable containing the serialized stream event.
//   - (error): An error, if any occurred during serialization.
func SerializeStreamEvent(event *db.StreamEvent, tableSchema *TableSchema, fieldProjections map[string]string) (*mode.GenericTable, error) {
	colNames := []string{}
	row := []interface{}{}
	for colName := range event.Values {
		colNames = append(colNames, colName)
		row = append(row, event.Values[colName])
	}

	colEncodingTypes, colEncodingTypesStrings := tableSchema.GetEncodingTypes(colNames, fieldProjections)

	serializedRows := []*mode.Row{}
	serializedRow, err := SerializeRow(row, colNames, colEncodingTypes)
	if err != nil {
		logger.GetLogger().Warn("error while serializing", zap.Error(err))
	} else {
		serializedRows = append(serializedRows, serializedRow)
	}

	return &mode.GenericTable{
		Cols:  CapitalizeColNames(colNames, tableSchema),
		Rows:  serializedRows,
		Types: colEncodingTypesStrings,
	}, nil
}

// CapitalizeColNames capitalizes the column names and returns them in a slice.
//
// Parameters:
//   - colNames ([]string): A slice of column names.
//   - tableSchema (*TableSchema): A pointer to the schema of the table.
//
// Returns:
//   - ([]string): A slice of capitalized column names.
func CapitalizeColNames(colNames []string, tableSchema *TableSchema) []string {
	capitalizedCols := []string{}
	for _, colName := range colNames {
		originalName := tableSchema.OnChainColNames[colName]
		if originalName != "" {
			capitalizedCols = append(capitalizedCols, originalName)
		} else {
			capitalizedCols = append(capitalizedCols, colName)
		}
	}
	return capitalizedCols
}
