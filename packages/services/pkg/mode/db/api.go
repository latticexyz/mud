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
	return dl.db.Get(result, sql)
}

// Exec executes the provided SQL statement on the database and returns the result of the operation.
func (dl *DatabaseLayer) Exec(sql string) (sql.Result, error) {
	return dl.db.Exec(sql)
}

// Query executes the provided SQL query on the database and returns the results as a sqlx.Rows object.
func (dl *DatabaseLayer) Query(sql string) (*sqlx.Rows, error) {
	return dl.db.Queryx(sql)
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
		for {
			select {
			case data := <-msgChannel:
				if values, ok := data.(*StreamEvent); ok {
					transformed <- values
				}
			}
		}
	}()
	return transformed
}

// Exists returns true if a row exists in the specified table using the provided filter criteria.
func (dl *DatabaseLayer) Exists(table string, filter map[string]interface{}) (bool, error) {
	var exists bool
	err := dl.gorm__db.Table(table).
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
	if err := dl.gorm__db.Table(table).Create(record).Error; err != nil {
		panic(err)
	}

	fmt.Printf("%#+v\n", record)
	return nil
}

// Updates updates a record in the specified table using the provided record struct and filter criteria.
func (dl *DatabaseLayer) Updates(table string, record interface{}, filter map[string]interface{}) (*gorm.DB, error) {
	updates := dl.gorm__db.Table(table).Where(filter).Updates(record)
	if err := updates.Error; err != nil {
		panic(err)
	}

	fmt.Printf("%#+v\n", record)
	return updates, nil
}

// Delete deletes a record from the specified table using the provided filter criteria.
func (dl *DatabaseLayer) Delete(table string, filter map[string]interface{}) (*gorm.DB, error) {
	deletes := dl.gorm__db.Table(table).Where(filter).Delete(nil)
	if err := deletes.Error; err != nil {
		panic(err)
	}

	return deletes, nil
}

// RenameColumn renames a column in the specified table.
func (dl *DatabaseLayer) RenameColumn(table string, old string, new string) error {
	err := dl.gorm__db.Migrator().RenameColumn(dl.gorm__db.Table(table), old, new)
	if err != nil {
		panic(err)
	}
	return nil
}

// Select returns a query object that can be used to retrieve records from the specified table using the provided
// filter criteria.
func (dl *DatabaseLayer) Select(table string, filter map[string]interface{}) (*gorm.DB, error) {
	query := dl.gorm__db.Table(table).Where(filter)
	if err := query.Error; err != nil {
		panic(err)
	}

	return query, nil
}
