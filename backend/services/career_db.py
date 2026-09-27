import os
import csv
import sqlite3
import time
from typing import List, Dict, Any, Optional

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")
DB_PATH = os.path.join(DATA_DIR, "campus.db")

CSV_FILES = {
    "course_catalog": "course_catalog.csv",
    "students_current": "students_current.csv",
    "alumni": "alumni.csv",
    "employment_history": "employment_history.csv",
    "student_experience": "student_experience.csv",
    "transcripts": "transcripts.csv"
}


def get_db_connection() -> sqlite3.Connection:
    """Return a connection with dictionary-like row factory and pragmas enabled."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_campus_db(force_reload: bool = False):
    """
    Load all CSV files from /backend/data into SQLite (campus.db).
    Skips reloading if database already exists and force_reload is False.
    """
    if os.path.exists(DB_PATH) and not force_reload:
        # Check if tables exist
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT count(name) FROM sqlite_master WHERE type='table' AND name='alumni'")
        count = cursor.fetchone()[0]
        conn.close()
        if count > 0:
            print(f"[CareerDB] campus.db already exists with data at {DB_PATH}.")
            return

    print(f"[CareerDB] Initializing campus.db from CSVs in {DATA_DIR}...")
    start_time = time.time()
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Fast insertion settings
    cursor.execute("PRAGMA synchronous = OFF")
    cursor.execute("PRAGMA journal_mode = MEMORY")

    for table_name, csv_filename in CSV_FILES.items():
        file_path = os.path.join(DATA_DIR, csv_filename)
        if not os.path.exists(file_path):
            print(f"[CareerDB] Warning: {file_path} not found. Skipping.")
            continue

        print(f"[CareerDB] Ingesting {csv_filename} into table '{table_name}'...")
        with open(file_path, mode="r", encoding="utf-8") as f:
            reader = csv.reader(f)
            header = next(reader)
            
            # Clean headers: sanitize column names
            clean_headers = [col.strip().replace(" ", "_").replace("-", "_") for col in header]
            
            # Drop and create table
            cursor.execute(f"DROP TABLE IF EXISTS {table_name}")
            col_definitions = ", ".join([f'"{col}" TEXT' for col in clean_headers])
            cursor.execute(f"CREATE TABLE {table_name} ({col_definitions})")
            
            placeholders = ", ".join(["?"] * len(clean_headers))
            insert_query = f"INSERT INTO {table_name} VALUES ({placeholders})"
            
            batch = []
            for row in reader:
                batch.append(row)
                if len(batch) >= 10000:
                    cursor.executemany(insert_query, batch)
                    batch = []
            if batch:
                cursor.executemany(insert_query, batch)

    # Create key indexes for ultra-fast joining
    print("[CareerDB] Creating indexes on campus_id and course_id...")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_alumni_cid ON alumni (campus_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_curr_cid ON students_current (campus_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_emp_cid ON employment_history (campus_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_exp_cid ON student_experience (campus_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_trans_cid ON transcripts (campus_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_trans_course ON transcripts (course_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_catalog_id ON course_catalog (course_id)")

    conn.commit()
    conn.close()
    elapsed = time.time() - start_time
    print(f"[CareerDB] Successfully loaded all tables into campus.db in {elapsed:.2f}s!")


# Helper query functions for easy consumption across the app
def query_db(query: str, args: tuple = ()) -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(query, args)
    rows = cursor.fetchall()
    results = [dict(row) for row in rows]
    conn.close()
    return results


def query_db_one(query: str, args: tuple = ()) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(query, args)
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None


if __name__ == "__main__":
    init_campus_db(force_reload=True)
    # Test query
    sample = query_db("SELECT major, degree_level, count(*) as count FROM alumni GROUP BY major, degree_level")
    print("\nSample Alumni Breakdown:")
    for row in sample:
        print(row)
