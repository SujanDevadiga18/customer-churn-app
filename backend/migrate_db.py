import sqlite3
import os

db_path = "churn.db"

if not os.path.exists(db_path):
    print("Database not found.")
else:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        cursor.execute("ALTER TABLE predictions ADD COLUMN explanation TEXT")
        conn.commit()
        print("Successfully added 'explanation' column to 'predictions' table.")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e).lower():
            print("Column 'explanation' already exists.")
        else:
            print(f"Error: {e}")
    finally:
        conn.close()
