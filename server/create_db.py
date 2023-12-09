import os
import sqlite3
import sys

def init_db():
    if len(sys.argv) < 2:
        print("No dbpath provided!")
        return
    db = sqlite3.connect(sys.argv[1])
    with open(f"{os.path.dirname(os.path.realpath(__file__))}/schema.sql", encoding="utf-8") as db_schema:
        db.cursor().executescript(db_schema.read())
    db.commit()
    db.close()

if __name__ == "__main__":
    init_db()
