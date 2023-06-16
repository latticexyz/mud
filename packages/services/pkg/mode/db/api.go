package db

import (
	"database/sql"
	"fmt"

	"github.com/jmoiron/sqlx"
	"gorm.io/gorm"
)

// Get retrieves a single row from the database using the provided SQL statement and assigns the result to the given
// destination struct.
func (dl *DatabaseLayer) Get(result interface{}, sql string) error {
	return dl.sqlxDB.Get(result, sql)
}

// Exec executes the provided SQL statement on the database and returns the result of the operation.
func (dl *DatabaseLayer) Exec(sql string) (sql.Result, error) {
	return dl.sqlxDB.Exec(sql)
}

// Query executes the provided SQL query on the database and returns the results as a sqlx.Rows object.
func (dl *DatabaseLayer) Query(sql string) (*sqlx.Rows, error) {
	return dl.sqlxDB.Queryx(sql)
}

// Stream returns a channel that streams all of the events that are published to the database layer's message
// multiplexer. The returned channel includes a transformation from the native database message format to a custom
// stream event format.
// TODO: add support for per-table streams via specification of SQL query.
func (dl *DatabaseLayer) Stream() <-chan *StreamEvent {
	msgChannel := dl.multiplexer.Subscribe()

	transformed := make(chan *StreamEvent)
	go func() {
		defer close(transformed)
		for data := range msgChannel {
			if values, ok := data.(*StreamEvent); ok {
				transformed <- values
			}
		}
	}()
	return transformed
}

// TableExists returns true if the given table exists in the database.
func (dl *DatabaseLayer) TableExists(table string) bool {
	var exists bool
	err := dl.gormDB.Table(table).
		Select("count(*) > 0").
		Find(&exists).
		Error

	if err != nil {
		panic(fmt.Errorf("error checking if table exists: %w", err))
	}
	return exists
}

// Exists returns true if a row exists in the specified table using the provided filter criteria.
func (dl *DatabaseLayer) Exists(table string, filter map[string]interface{}) (bool, error) {
	var exists bool
	err := dl.gormDB.Table(table).
		Select("count(*) > 0").
		Where(filter).
		Find(&exists).
		Error

	if err != nil {
		panic(fmt.Errorf("error checking if table exists: %w", err))
	}
	return exists, nil
}

// Create inserts a new record into the specified table using the provided record struct.
func (dl *DatabaseLayer) Create(table string, record interface{}) error {
	if err := dl.gormDB.Table(table).Create(record).Error; err != nil {
		panic(err)
	}
	return nil
}

// Updates updates a record in the specified table using the provided record struct and filter criteria.
func (dl *DatabaseLayer) Updates(table string, record interface{}, filter map[string]interface{}) (*gorm.DB, error) {
	var updates *gorm.DB
	if len(filter) == 0 {
		// If the WHERE clause is empty, then update all records in the table.
		// This is to handle the case where the filter is not provided due to a singleton table.
		updates = dl.gormDB.Table(table).Select("*").Where("true").Updates(record)
	} else {
		updates = dl.gormDB.Table(table).Select("*").Where(filter).Updates(record)
	}
	if err := updates.Error; err != nil {
		panic(err)
	}

	return updates, nil
}

// Delete deletes a record from the specified table using the provided filter criteria.
func (dl *DatabaseLayer) Delete(table string, filter map[string]interface{}) (*gorm.DB, error) {
	deletes := dl.gormDB.Table(table).Where(filter).Delete(nil)
	if err := deletes.Error; err != nil {
		panic(err)
	}

	return deletes, nil
}

// RenameColumn renames a column in the specified table.
func (dl *DatabaseLayer) RenameColumn(table string, oldName string, newName string) error {
	err := dl.gormDB.Migrator().RenameColumn(dl.gormDB.Table(table), oldName, newName)
	if err != nil {
		panic(err)
	}
	return nil
}

// Select returns a query object that can be used to retrieve records from the specified table using the provided
// filter criteria.
func (dl *DatabaseLayer) Select(table string, filter map[string]interface{}) (*gorm.DB, error) {
	query := dl.gormDB.Table(table).Where(filter)
	if err := query.Error; err != nil {
		panic(err)
	}

	return query, nil
}
