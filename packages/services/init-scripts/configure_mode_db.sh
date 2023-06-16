#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
	ALTER SYSTEM SET wal_level = logical;
  ALTER SYSTEM SET max_replication_slots = 1;
  ALTER SYSTEM SET max_wal_senders = 3;
EOSQL