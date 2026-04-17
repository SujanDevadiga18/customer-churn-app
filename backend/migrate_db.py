import sqlite3

paths = ["churn.db", "database/churn.db"]

for db_path in paths:
    print(f"\n--- Migrating: {db_path} ---")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = [row[0] for row in cursor.fetchall()]
    print("Tables found:", tables)

    if "users" not in tables:
        print("SKIP: No users table in this db")
        conn.close()
        continue

    cursor.execute("PRAGMA table_info(users)")
    cols = [row[1] for row in cursor.fetchall()]
    print("Current columns:", cols)

    if "is_verified" not in cols:
        cursor.execute("ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT 0")
        print("Added: is_verified")
    if "otp_code" not in cols:
        cursor.execute("ALTER TABLE users ADD COLUMN otp_code TEXT")
        print("Added: otp_code")
    if "otp_expiry" not in cols:
        cursor.execute("ALTER TABLE users ADD COLUMN otp_expiry DATETIME")
        print("Added: otp_expiry")

    # Mark all existing users as verified so they can still log in
    cursor.execute("UPDATE users SET is_verified = 1")
    print(f"Marked all existing users as verified: {cursor.rowcount} rows")

    conn.commit()
    conn.close()
    print("Done.")

print("\nMigration complete.")
