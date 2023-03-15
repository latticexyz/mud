package db

import (
	"database/sql"
	"log"

	"github.com/jmoiron/sqlx"
)

func (dl *DatabaseLayer) GetAllTables(namespace string) ([]string, error) {
	var tableNames []string

	query := "SELECT tablename FROM pg_tables WHERE schemaname = '" + namespace + "'"
	rows, err := dl.db.Query(query)
	if err != nil {
		return tableNames, err
	}
	defer rows.Close()

	for rows.Next() {
		var tableName string
		err := rows.Scan(&tableName)
		if err != nil {
			log.Fatal(err)
		}
		tableNames = append(tableNames, tableName)
	}
	if err := rows.Err(); err != nil {
		return tableNames, err
	}

	println("GOT TABLE NAMES:")
	for _, tableName := range tableNames {
		println(tableName)
	}
	println("QUERY:")
	println(query)

	return tableNames, nil
}

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
