import sqlite3
import os

db_path = r"c:\Users\Sujan\Desktop\Customer_churn\churn.db"

if not os.path.exists(db_path):
    print("Database not found.")
else:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # 1. Add user_id to predictions
    try:
        cursor.execute("ALTER TABLE predictions ADD COLUMN user_id INTEGER DEFAULT 1")
        conn.commit()
        print("Successfully added 'user_id' column to 'predictions' table.")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e).lower():
            print("Column 'user_id' already exists.")
        else:
            print(f"Error user_id: {e}")

    # 2. Ensure payment_method exists (just in case)
    try:
        cursor.execute("ALTER TABLE predictions ADD COLUMN payment_method TEXT")
        conn.commit()
        print("Successfully added 'payment_method' column to 'predictions' table.")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e).lower():
            print("Column 'payment_method' already exists.")
        else:
            print(f"Error payment_method: {e}")

    # 3. Ensure explanation exists
    try:
        cursor.execute("ALTER TABLE predictions ADD COLUMN explanation TEXT")
        conn.commit()
        print("Successfully added 'explanation' column to 'predictions' table.")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e).lower():
            print("Column 'explanation' already exists.")
        else:
            print(f"Error explanation: {e}")

    conn.close()
