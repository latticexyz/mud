package write

import (
	"database/sql"
	"latticexyz/mud/packages/services/pkg/mode"
	pb_mode "latticexyz/mud/packages/services/protobuf/go/mode"
	"strings"

	"go.uber.org/zap"
)

func (wl *WriteLayer) CreateTable(tableSchema *mode.TableSchema) error {
	// Create a table creator builder.
	createBuilder := mode.NewCreateBuilder(&pb_mode.CreateRequest{
		Name: tableSchema.TableName,
	}, tableSchema)

	// Get the table creation + index creation SQL queries.
	createTableQuery, createIndexQueries, err := createBuilder.ToSQLQueries()
	if err != nil {
		wl.logger.Error("failed to build queries", zap.Error(err))
		return err
	}

	// Execute the query to create a table.
	_, err = wl.dl.Exec(createTableQuery)
	if err != nil {
		wl.logger.Error("failed to create table", zap.String("query", createTableQuery), zap.Error(err))
		return err
	}
	wl.logger.Info("created table", zap.String("table", tableSchema.TableName))

	// Execute the query to create indexes.
	_, err = wl.dl.Exec(createIndexQueries)
	if err != nil {
		wl.logger.Error("failed to create indexes on table", zap.Error(err))
		return err
	}
	wl.logger.Info("created indexes on table", zap.String("table", tableSchema.TableName))

	if tableSchema.PrimaryKey == "" {
		// If the table does not have a primary key, then we need to set the replica identity to FULL.
		wl.dl.Exec(createBuilder.BuildIndentityFullModifier())
	}

	return nil
}

func (wl *WriteLayer) RenameTableFields(tableSchema *mode.TableSchema, oldTableFieldNames []string, newTableFieldNames []string) error {
	// Build the SQL statement to rename the columns
	var sqlStmt strings.Builder
	for i := 0; i < len(oldTableFieldNames); i++ {
		sqlStmt.WriteString("ALTER TABLE " + tableSchema.TableName + " RENAME COLUMN " + oldTableFieldNames[i] + " TO " + newTableFieldNames[i] + ";")
	}

	// Execute the SQL statement
	_, err := wl.dl.Exec(sqlStmt.String())
	if err != nil {
		wl.logger.Error("failed to rename table fields", zap.Error(err))
		return err
	}

	return nil
}

func (wl *WriteLayer) InsertRow(tableSchema *mode.TableSchema, row RowKV) error {
	// Create an insert builder.
	insertBuilder := mode.NewInsertBuilder(&pb_mode.InsertRequest{
		Into: tableSchema.TableName,
		Row:  row,
	}, tableSchema)
	insertRowQuery := insertBuilder.ToSQLQuery()

	_, err := wl.dl.Exec(insertRowQuery)
	if err != nil {
		wl.logger.Error("failed to insert row", zap.Error(err), zap.String("query", insertRowQuery))
		return err
	}

	wl.logger.Info("inserted row", zap.String("table", tableSchema.TableName))

	return nil
}

func (wl *WriteLayer) UpdateRow(tableSchema *mode.TableSchema, row RowKV, filter []*pb_mode.Filter) (sql.Result, error) {
	// Create an update builder.
	updateBuilder := mode.NewUpdateBuilder(&pb_mode.UpdateRequest{
		Target: tableSchema.TableName,
		Filter: filter,
		Row:    row,
	}, tableSchema)

	updateRowQuery := updateBuilder.ToSQLQuery()

	result, err := wl.dl.Exec(updateRowQuery)
	if err != nil {
		wl.logger.Error("failed to update row", zap.Error(err), zap.String("query", updateRowQuery))
		return nil, err
	}

	wl.logger.Info("updated row", zap.String("table", tableSchema.TableName))

	return result, nil
}

func (wl *WriteLayer) UpdateOrInsertRow(tableSchema *mode.TableSchema, row RowKV, filter []*pb_mode.Filter) error {
	// First try to update.
	updateResult, err := wl.UpdateRow(tableSchema, row, filter)
	if err != nil {
		wl.logger.Error("failed to update row", zap.Error(err))
		return err
	}

	rowsAffected, err := updateResult.RowsAffected()
	if err != nil {
		wl.logger.Error("failed to get rows affected", zap.Error(err))
		return err
	}
	if rowsAffected > 0 {
		wl.logger.Info("updated row", zap.String("table", tableSchema.TableName))
		return nil
	}

	// Otherwise, insert a new row.
	err = wl.InsertRow(tableSchema, row)
	if err != nil {
		wl.logger.Error("failed to insert row", zap.Error(err))
		return err
	}
	wl.logger.Info("inserted row", zap.String("table", tableSchema.TableName))

	return nil
}

func (wl *WriteLayer) DeleteRow(tableSchema *mode.TableSchema, filter []*pb_mode.Filter) error {
	// Create a delete builder.
	deleteBuilder := mode.NewDeleteBuilder(&pb_mode.DeleteRequest{
		From:   tableSchema.TableName,
		Filter: filter,
	}, tableSchema)

	deleteRowQuery := deleteBuilder.ToSQLQuery()

	_, err := wl.dl.Exec(deleteRowQuery)
	if err != nil {
		wl.logger.Error("failed to delete row", zap.Error(err), zap.String("query", deleteRowQuery))
		return err
	}
	wl.logger.Info("deleted row", zap.String("table", tableSchema.TableName))

	return nil
}
