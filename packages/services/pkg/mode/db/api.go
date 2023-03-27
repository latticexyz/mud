package db

import (
	"database/sql"

	"github.com/jmoiron/sqlx"
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
