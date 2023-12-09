import sqlite3

def convert_sensor_data(data_json : dict, field_name : str) -> list[dict]:
    """
    Convert sensor data response from server to format readable by frontend.
    :param data_json: json with sensor data returned by the server
    :param field_name: name of the field for the sensor
    """
    result = []
    for entry in data_json:
        if entry[field_name] is not None:
            result.append(
                {
                    "timestamp": str(entry["created_at"]),
                    "value": float(entry[field_name]),
                    "id": entry["entry_id"],
                }
            )
    return result

def user_exists(db_cursor : sqlite3.Cursor, username : str) -> bool:
    """
    Check if user exists in the database.
    """
    db_cursor.execute("SELECT * FROM USER WHERE user_login = ?", [username])
    return db_cursor.fetchone() is not None

def authenticate_user(db_cursor : sqlite3.Cursor, username : str, password: str) -> bool:
    """
    Check if user's credentials exist in the database.
    """
    db_cursor.execute("SELECT * FROM USER WHERE user_login = ? AND user_password = ?", [username, password])
    return db_cursor.fetchone() is not None
