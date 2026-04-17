import sqlite3
import os

db_path = os.path.join(os.path.dirname(__file__), "churn.db")
print(f"Migrating database at: {db_path}")

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Get existing columns
cursor.execute("PRAGMA table_info(predictions)")
columns = [row[1] for row in cursor.fetchall()]

# Columns to add
to_add = [
    ("tenure_months", "INTEGER"),
    ("inactive_days", "INTEGER"),
    ("sms_sent", "INTEGER"),
    ("calls_made", "INTEGER"),
    ("explanation", "TEXT")
]

for col_name, col_type in to_add:
    if col_name not in columns:
        print(f"Adding column {col_name}...")
        try:
            cursor.execute(f"ALTER TABLE predictions ADD COLUMN {col_name} {col_type}")
        except Exception as e:
            print(f"Error adding {col_name}: {e}")
    else:
        print(f"Column {col_name} already exists.")

conn.commit()
conn.close()
print("Migration completed successfully.")
