#!/bin/bash

service postgresql start
export PGPASSWORD=$DB_PASSWORD
psql -h localhost -U $DB_USER -d $DB_NAME -f ./schema.sql
export PGPASSWORD=

npm start