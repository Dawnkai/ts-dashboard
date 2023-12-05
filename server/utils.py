import sqlite3

def convert_sensor_data(data_json : dict, field_name : str) -> list[dict]:
    result = []
    for entry in data_json:
        if entry["field1"] is not None:
            result.append(
                {
                    "timestamp": str(entry["created_at"]),
                    "value": float(entry["field1"]),
                    "id": entry["entry_id"],
                }
            )
    return result

def user_exists(db_cursor : sqlite3.Cursor, username : str) -> bool:
    db_cursor.execute("SELECT * FROM USER WHERE user_login = ?", [username])
    return db_cursor.fetchone() is not None

def authenticate_user(db_cursor : sqlite3.Cursor, username : str, password: str) -> bool:
    db_cursor.execute("SELECT * FROM USER WHERE user_login = ? AND user_password = ?", [username, password])
    return db_cursor.fetchone() is not None
