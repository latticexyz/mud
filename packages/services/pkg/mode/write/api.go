package write

import (
	"latticexyz/mud/packages/services/pkg/mode"
	"latticexyz/mud/packages/services/pkg/mode/ops/create"
	"latticexyz/mud/packages/services/pkg/mode/ops/insert"
	"latticexyz/mud/packages/services/pkg/mode/ops/update"
	pb_mode "latticexyz/mud/packages/services/protobuf/go/mode"
	"strings"

	"go.uber.org/zap"
)

// CreateNamespace creates a new database schema with the specified name,
// if it does not already exist. The function uses the Exec() method of the
// database connection to execute a SQL statement that creates a new schema
// with the specified name. If the schema already exists, no action is taken.
// If any error occurs while executing the SQL statement, it is returned as
// an error object. Otherwise, nil is returned to indicate success.
//
// Parameters:
// - namespace (string): represents the name of the schema to create.
//
// Returns:
//   - (error): if any error occurs while executing the SQL statement, it is
//     returned as an error object. Otherwise, nil is returned.
func (wl *Layer) CreateNamespace(namespace string) error {
	_, err := wl.dl.Exec("CREATE SCHEMA IF NOT EXISTS " + namespace + ";")
	if err != nil {
		wl.logger.Error("failed to create namespace", zap.Error(err))
		return err
	}
	wl.logger.Info("created namespace", zap.String("namespace", namespace))

	return nil
}

// DeleteNamespace deletes a database schema with the specified name.
// The function uses the Exec() method of the database connection to execute
// a SQL statement that deletes the schema with the specified name. If the
// schema does not exist, no action is taken. If any error occurs while
// executing the SQL statement, it is returned as an error object.
// Otherwise, nil is returned to indicate success.
//
// Parameters:
// - namespace (string): represents the name of the schema to delete.
//
// Returns:
//   - (error): if any error occurs while executing the SQL statement, it is
//     returned as an error object. Otherwise, nil is returned.
func (wl *Layer) DeleteNamespace(namespace string) error {
	_, err := wl.dl.Exec("DROP SCHEMA IF EXISTS " + namespace + " CASCADE;")
	if err != nil {
		wl.logger.Error("failed to delete namespace", zap.Error(err))
		return err
	}
	wl.logger.Info("deleted namespace", zap.String("namespace", namespace))

	return nil
}

// CreateTable creates a new table in the database with the specified
// schema and name, and also creates indexes on the table if specified.
// The function first creates the namespace where this table is being
// created (if it does not already exist), and then uses the create.NewCreateBuilder()
// method to generate a CREATE TABLE statement for the table schema. It then uses
// the builder's ToSQLQueries() method to generate the SQL queries for creating
// the table and indexes, and executes them using the Exec() method of the database
// connection. If any error occurs while executing the SQL statement or building
// the queries, it is returned as an error object. Otherwise, nil is returned to
// indicate success.
//
// Parameters:
//   - tableSchema (*mode.TableSchema): a pointer to a TableSchema object that
//     represents the schema of the table to create.
//
// Returns:
//   - (error): if any error occurs while executing the SQL statement or building
//     the queries, it is returned as an error object. Otherwise, nil is
//     returned to indicate success.
func (wl *Layer) CreateTable(table *mode.Table) error {
	// Create the namespace where this table is being created (if it does not already exist).
	err := wl.CreateNamespace(table.Namespace)
	if err != nil {
		wl.logger.Error("failed to create namespace", zap.Error(err))
		return err
	}

	// Create a table creator builder.
	createBuilder := create.NewBuilder(&pb_mode.CreateRequest{
		Name: table.NamespacedName(),
	}, table)

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
	wl.logger.Info("created table", zap.String("table", table.NamespacedName()))

	// Execute the query to create indexes.
	_, err = wl.dl.Exec(createIndexQueries)
	if err != nil {
		wl.logger.Error("failed to create indexes on table", zap.Error(err), zap.String("query", createIndexQueries))
		return err
	}
	wl.logger.Info("created indexes on table", zap.String("table", table.NamespacedName()))

	// We set the replica identity to FULL for WAL.
	_, execErr := wl.dl.Exec(createBuilder.BuildIndentityFullModifier())
	if execErr != nil {
		wl.logger.Error("failed to set replica identity to FULL", zap.Error(err))
		return err
	}

	return nil
}

// RenameTable renames a table in the database from the old table name
// to the new table name. The function first constructs an SQL statement
// to set the search path to the namespace of the table, and then renames
// the table using the ALTER TABLE RENAME statement. If any error occurs
// while executing the SQL statement, it is returned as an error object.
// Otherwise, nil is returned to indicate success.
//
// Parameters:
//   - tableSchema (*mode.TableSchema): a pointer to a TableSchema object that
//     represents the schema of the table to rename.
//   - oldTableName (string): the name of the table to be renamed.
//   - newTableName (string): the new name for the table.
//
// Returns:
//   - (error): if any error occurs while executing the SQL statement, it is
//     returned as an error object. Otherwise, nil is returned to
//     indicate success
func (wl *Layer) RenameTable(table *mode.Table, oldTableName string, newTableName string) error {
	// Build the SQL statement to rename the table
	var sqlStmt strings.Builder
	sqlStmt.WriteString("SET search_path TO " + table.Namespace + ";")
	sqlStmt.WriteString("ALTER TABLE " + oldTableName + " RENAME TO " + newTableName + ";")

	// Execute the SQL statement
	_, err := wl.dl.Exec(sqlStmt.String())
	if err != nil {
		wl.logger.Error("failed to rename table", zap.Error(err))
		return err
	}

	return nil
}

// RenameTableFields renames one or more columns in a table from the old
// column names to the new column names. The function constructs an SQL
// statement to rename each column using the ALTER TABLE RENAME COLUMN
// statement, and executes the statement using the Exec() method of the
// database connection. If any error occurs while executing the SQL statement,
// it is returned as an error object. Otherwise, nil is returned to indicate
// success.
//
// Parameters:
//   - tableSchema (*mode.TableSchema): a pointer to a TableSchema object that
//     represents the schema of the table to rename.
//   - oldTableFieldNames ([]string): a slice of strings that represent the old
//     column names that need to be renamed.
//   - newTableFieldNames ([]string): a slice of strings that represent the new
//     column names to which the old column names
//     need to be renamed.
//
// Returns:
//   - (error): if any error occurs while executing the SQL statement, it is
//     returned as an error object. Otherwise, nil is returned to
//     indicate success.
func (wl *Layer) RenameTableFields(
	table *mode.Table,
	oldTableFieldNames []string,
	newTableFieldNames []string,
) error {
	// Build the SQL statement to rename the columns
	var sqlStmt strings.Builder
	for i := 0; i < len(oldTableFieldNames); i++ {
		sqlStmt.WriteString(
			"ALTER TABLE " + table.NamespacedName() +
				" RENAME COLUMN " + oldTableFieldNames[i] +
				" TO " + newTableFieldNames[i] + ";",
		)
	}

	// Execute the SQL statement
	_, err := wl.dl.Exec(sqlStmt.String())
	if err != nil {
		wl.logger.Error("failed to rename table fields", zap.String("query", sqlStmt.String()), zap.Error(err))
		return err
	}

	wl.logger.Info("renamed table fields", zap.String("sql", sqlStmt.String()))

	return nil
}

// InsertRow inserts a new row into a table in the database. The function
// constructs an SQL statement using the InsertBuilder, which includes the
// table name, column names, and values of the new row. The SQL statement
// is executed using the Exec() method of the database connection. If any
// error occurs while executing the SQL statement, it is returned as an
// error object. Otherwise, nil is returned to indicate success.
//
// Parameters:
//   - tableSchema (*mode.TableSchema): a pointer to a TableSchema object that
//     represents the schema of the table to insert into.
//   - row (RowKV): a map of string key-value pairs that represent the column
//     names and values of the new row to be inserted.
//
// Returns:
//   - (error): if any error occurs while executing the SQL statement, it is
//     returned as an error object. Otherwise, nil is returned to
//     indicate success.
func (wl *Layer) InsertRow(table *mode.Table, row mode.TableRow) error {
	// Create an insert builder.
	insertBuilder := insert.NewBuilder(&insert.Request{
		Into: table.NamespacedName(),
		Row:  row,
	}, table)

	recordToInsert, err := insertBuilder.BuildRecord()
	if err != nil {
		wl.logger.Error("failed to build record to insert", zap.Error(err))
		return err
	}
	err = wl.dl.Create(insertBuilder.Into(), recordToInsert)
	if err != nil {
		wl.logger.Error("failed to insert row", zap.String("table", insertBuilder.Into()), zap.Error(err))
		return err
	}
	wl.logger.Info("inserted row", zap.String("table", insertBuilder.Into()), zap.Any("record", recordToInsert))

	return nil
}

// UpdateRow updates an existing row in a table in the database. The function
// constructs an SQL statement using the UpdateBuilder, which includes the
// table name, column names and new values of the row to be updated, and a
// filter that identifies the row to be updated. The SQL statement is executed
// using the Exec() method of the database connection. The function returns a
// Result object and an error object. If any error occurs while executing the
// SQL statement, the error object is returned. Otherwise, the Result object is
// returned, which contains information about the number of rows affected by
// the update operation.
//
// Parameters:
//   - tableSchema (*mode.TableSchema): a pointer to a TableSchema object that
//     represents the schema of the table to update.
//   - row (RowKV): a map of string key-value pairs that represent the column
//     names and values of the row to be updated.
//   - filter ([]*pb_mode.Filter): a slice of Filter objects that identify the row
//     to be updated. The Filters are combined to form
//     a WHERE clause in the SQL statement.
//
// Returns:
//   - (sql.Result): a Result object that contains information about the number
//     of rows affected by the update operation.
//   - (error): if any error occurs while executing the SQL statement, it is
//     returned as an error object. Otherwise, nil is returned to
//     indicate success.
func (wl *Layer) UpdateRow(table *mode.Table, row mode.TableRow, filter map[string]interface{}) (bool, error) {
	// Create an update builder.
	updateBuilder := update.NewBuilder(&update.Request{
		Table:  table.NamespacedName(),
		Row:    row,
		Filter: filter,
	}, table)

	recordToUpdate, err := updateBuilder.BuildRecord()
	if err != nil {
		wl.logger.Error("failed to build record to update", zap.Error(err))
		return false, err
	}
	updates, err := wl.dl.Updates(updateBuilder.Table(), recordToUpdate, filter)
	if err != nil {
		wl.logger.Error("failed to update row", zap.Error(err), zap.String("table", updateBuilder.Table()))
		return false, err
	}
	updated := updates.RowsAffected > 0
	if updated {
		wl.logger.Info("updated row", zap.String("table", table.NamespacedName()), zap.Any("record", recordToUpdate))
	} else {
		wl.logger.Info("did not update row",
			zap.String("table", table.NamespacedName()),
			zap.Any("record", recordToUpdate),
			zap.Any("filter", filter),
		)
	}
	return updated, nil
}

// UpdateOrInsertRow tries to update the row that satisfies the filter in the given table schema
// with the given row data. If no row exists that satisfies the filter, a new row is inserted with
// the given row data. Returns an error if the update or insert operation fails.
//
// Parameters:
// - tableSchema (*mode.TableSchema): the table schema to operate on
// - row (RowKV): the row data to update or insert
// - filter ([]*pb_mode.Filter): a list of filters to use to identify the row to update
//
// Returns:
// - (error): An error if the operation fails, or nil if the operation succeeds.
func (wl *Layer) UpdateOrInsertRow(table *mode.Table, row mode.TableRow, filter map[string]interface{}) error {
	// First try to update.
	updated, err := wl.UpdateRow(table, row, filter)
	if err != nil {
		wl.logger.Error("failed to update row", zap.Error(err))
		return err
	}
	if updated {
		wl.logger.Info("updated row", zap.String("table", table.NamespacedName()))
		return nil
	}

	// Otherwise, insert a new row.
	err = wl.InsertRow(table, row)
	if err != nil {
		wl.logger.Error("failed to insert row", zap.Error(err))
		return err
	}
	wl.logger.Info("inserted row", zap.String("table", table.NamespacedName()))

	return nil
}

// DeleteRow deletes rows from the table specified by tableSchema that match the given filter criteria.
// Returns an error if the deletion fails.
//
// Parameters:
// - tableSchema (*mode.TableSchema): A pointer to a TableSchema that specifies the table to delete from.
// - filter ([]*pb_mode.Filter): An array of Filter objects that specify the criteria for rows to be deleted.
//
// Returns:
// - (error): An error if the deletion fails, otherwise nil.
func (wl *Layer) DeleteRow(table *mode.Table, filter map[string]interface{}) error {
	// Use the database layer to delete the row.
	_, err := wl.dl.Delete(table.NamespacedName(), filter)
	if err != nil {
		wl.logger.Error("failed to delete row", zap.Error(err), zap.String("table", table.NamespacedName()))
		return err
	}
	wl.logger.Info("deleted row", zap.String("table", table.NamespacedName()))

	return nil
}
