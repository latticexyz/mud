package mode

import (
	"latticexyz/mud/packages/services/pkg/logger"
	"latticexyz/mud/packages/services/pkg/mode/db"
	"latticexyz/mud/packages/services/protobuf/go/mode"
	"time"

	"github.com/umbracle/ethgo/abi"

	"github.com/jmoiron/sqlx"
	"go.uber.org/zap"
)

func PrepareForScan(rows *sqlx.Rows) (colNames []string, row []interface{}, rowInterface []interface{}) {
	colNames, _ = rows.Columns()
	row = make([]interface{}, len(colNames))
	rowInterface = make([]interface{}, len(colNames))
	for i := range row {
		rowInterface[i] = &row[i]
	}
	return
}

func SerializeRow(row []interface{}, colNames []string, colEncodingTypes []*abi.Type) (*mode.Row, error) {
	// A single row but every field is encoded.
	values := [][]byte{}

	// Iterate columns and serialize each field for this row.
	for i, colName := range colNames {
		colEncodingType := colEncodingTypes[i]

		println(colEncodingType.String())
		println(colName + ":")
		println(row[i])

		encodedField, err := colEncodingType.Encode(row[i])
		if err != nil {
			return nil, err
		}

		values = append(values, encodedField)
	}

	return &mode.Row{
		Values: values,
	}, nil
}

func SerializeRows(rows *sqlx.Rows, tableSchema *TableSchema, fieldProjections map[string]string) (*mode.GenericTable, error) {
	tsStart := time.Now()

	colNames, row, rowInterface := PrepareForScan(rows)
	colEncodingTypes, colEncodingTypesStrings := tableSchema.GetEncodingTypes(colNames, fieldProjections)

	serializedRows := []*mode.Row{}

	if rows.Next() {
		rows.Scan(rowInterface...)
		serializedRow, err := SerializeRow(row, colNames, colEncodingTypes)
		if err != nil {
			logger.GetLogger().Warn("error while serializing", zap.Error(err))
		} else {
			serializedRows = append(serializedRows, serializedRow)
		}
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	// Record how long the serialization took.
	tsElapsed := time.Since(tsStart)
	logger.GetLogger().Info("serialization finished", zap.String("time taken", tsElapsed.String()), zap.String("table", tableSchema.TableName))

	return &mode.GenericTable{
		Cols:  colNames,
		Rows:  serializedRows,
		Types: colEncodingTypesStrings,
	}, nil
}

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
		Cols:  colNames,
		Rows:  serializedRows,
		Types: colEncodingTypesStrings,
	}, nil
}
