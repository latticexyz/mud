package db

import (
	"database/sql"

	"github.com/jmoiron/sqlx"
)

func (dl *DatabaseLayer) Get(result interface{}, sql string) error {
	return dl.db.Get(result, sql)
}

func (dl *DatabaseLayer) Exec(sql string) (sql.Result, error) {
	return dl.db.Exec(sql)
}

func (dl *DatabaseLayer) Query(sql string) (*sqlx.Rows, error) {
	return dl.db.Queryx(sql)
}

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
