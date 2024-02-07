!/bin/bash

DB_HOST="localhost"
DB_USER="root"
DB_PASSWORD="password"
DB_NAME="book_management"

SQL_SCRIPT="./book_management_database.sql"

mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME < $SQL_SCRIPT

if [ $? -eq 0 ]; then
  echo "SQL script executed successfully"
else
  echo "Error executing SQL script"
fi
