package db

import (
	"log"

	"github.com/jmoiron/sqlx"
)

func GetAllTables(db *sqlx.DB) ([]string, error) {
	var tableNames []string

	rows, err := db.Query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")
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

	return tableNames, nil
}
