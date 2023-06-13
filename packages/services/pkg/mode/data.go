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
func PrepareForScan(rows *sqlx.Rows) ([]string, []interface{}, []interface{}) {
	colNames, _ := rows.Columns()
	row := make([]interface{}, len(colNames))
	rowInterface := make([]interface{}, len(colNames))
	for i := range row {
		rowInterface[i] = &row[i]
	}
	return colNames, row, rowInterface
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

func FieldIsNil(field interface{}) bool {
	return field == nil
}

func FieldIsMap(field interface{}) bool {
	_, ok := field.(map[string]interface{})
	return ok
}

func FieldIsBytes(t *abi.Type) bool {
	return t.String() == "bytes"
}

func FieldIsString(t *abi.Type) bool {
	return t.String() == "string"
}

func HandleFieldMap(t *abi.Type, field interface{}) ([]byte, error) {
	// If the field is a map, we marshal it to JSON.
	_mapStr, err := json.Marshal(field)
	if err != nil {
		return nil, err
	}

	encoding, err := t.Encode(_mapStr)
	if err != nil {
		return nil, err
	}
	return encoding, nil
}

func HandleFieldBytes(t *abi.Type, field interface{}) ([]byte, error) {
	return EncodeParameters(
		[]string{t.String()},
		[]interface{}{field},
	)
}

func HandleFieldString(t *abi.Type, field interface{}) ([]byte, error) {
	return EncodeParameters(
		[]string{t.String()},
		[]interface{}{field},
	)
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
	for i := range colNames {
		field := row[i]
		fieldABIType := colEncodingTypes[i]

		var encodedField []byte
		var encodingErr error

		if FieldIsNil(field) {
			// If the field is null, we just encode it as an empty string.
			encodedField = []byte("")
		} else if FieldIsMap(field) {
			encodedField, encodingErr = HandleFieldMap(fieldABIType, field)
		} else if FieldIsBytes(fieldABIType) {
			encodedField, encodingErr = HandleFieldBytes(fieldABIType, field)
		} else if FieldIsString(fieldABIType) {
			encodedField, encodingErr = HandleFieldString(fieldABIType, field)
		} else {
			encodedField, encodingErr = fieldABIType.Encode(field)
		}
		if encodingErr != nil {
			return nil, encodingErr
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
func (table *Table) SerializeRows(rows *sqlx.Rows, fieldProjections map[string]string) (*mode.TableData, error) {
	tsStart := time.Now()

	colNames, row, rowInterface := PrepareForScan(rows)
	colEncodingTypes, colEncodingTypesStrings := table.GetEncodingTypes(colNames, fieldProjections)

	serializedRows := []*mode.Row{}

	for rows.Next() {
		err := rows.Scan(rowInterface...)
		if err != nil {
			logger.GetLogger().Warn("error while scanning", zap.Error(err), zap.String("table", table.NamespacedName()))
			continue
		}
		serializedRow, err := SerializeRow(row, colNames, colEncodingTypes)
		if err != nil {
			logger.GetLogger().Warn("error while serializing", zap.Error(err), zap.String("table", table.NamespacedName()))
		} else {
			serializedRows = append(serializedRows, serializedRow)
		}
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	// Record how long the serialization took.
	tsElapsed := time.Since(tsStart)
	logger.GetLogger().Info("serialization finished",
		zap.String("time taken", tsElapsed.String()),
		zap.String("table", table.NamespacedName()),
	)

	return &mode.TableData{
		Cols:  table.ToOnChainColNames(colNames),
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
func (table *Table) SerializeStreamEvent(
	event *db.StreamEvent,
	fieldProjections map[string]string,
) (*mode.TableData, error) {
	colNames := []string{}
	row := []interface{}{}
	for colName := range event.Values {
		colNames = append(colNames, colName)
		row = append(row, event.Values[colName])
	}

	colEncodingTypes, colEncodingTypesStrings := table.GetEncodingTypes(colNames, fieldProjections)

	serializedRows := []*mode.Row{}
	serializedRow, err := SerializeRow(row, colNames, colEncodingTypes)
	if err != nil {
		logger.GetLogger().Warn("error while serializing", zap.Error(err))
	} else {
		serializedRows = append(serializedRows, serializedRow)
	}

	return &mode.TableData{
		Cols:  table.ToOnChainColNames(colNames),
		Rows:  serializedRows,
		Types: colEncodingTypesStrings,
	}, nil
}

// ToOnChainColNames converts the column names to their on-chain format.
//
// Parameters:
//   - colNames ([]string): A slice of column names.
//
// Returns:
//   - ([]string): A slice of converted column names.
func (table *Table) ToOnChainColNames(colNames []string) []string {
	onChainColNames := []string{}
	for _, colName := range colNames {
		originalName := table.OnChainColNames[colName]
		if originalName != "" {
			onChainColNames = append(onChainColNames, originalName)
		} else {
			onChainColNames = append(onChainColNames, colName)
		}
	}
	return onChainColNames
}
