#!/bin/bash
# backup-db.sh

DATE=$(date +"%Y-%m-%d_%H-%M-%S")
DB_PATH="./yoga.db"
BACKUP_DIR="../backups"
cp "$DB_PATH" "$BACKUP_DIR/yoga_$DATE.db"


# crontab -e
# # Add line
# 0 3 * * * /path/to/backup-db.sh