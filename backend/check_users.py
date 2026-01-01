import sqlite3
import os

db_path = "churn.db"

if not os.path.exists(db_path):
    print("Database not found.")
else:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        cursor.execute("SELECT id, username, role FROM users")
        users = cursor.fetchall()
        print("Logged Users:")
        for u in users:
            print(f"ID: {u[0]} | Username: {u[1]} | Role: {u[2]}")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        conn.close()
