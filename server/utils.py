import requests
import sqlite3

from datetime import datetime
from typing import Any

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
                    "id": entry["entry_id"],
                    "sensor_name": field_name,
                    "timestamp": str(entry["created_at"]),
                    "value": float(entry[field_name]),
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

def generate_csv_file(data: list[dict]):
    """
    In order to send large files back to the client without toying with tempfile or creating and removing
    files from the disk, Flask allows sending data in chunks as a stream, which will be merged by the client
    once all data is received.
    More about it here: https://flask.palletsprojects.com/en/2.3.x/patterns/streaming/

    data: list of rows, the first row (header) will contain keys of the first object in the list
    """
    def convert_to_csv(value):
        """
        Because whitespace breaks csv files without quotations around them, wrap values that are not numbers
        in quotations.
        """
        # Because isdigit() doesn't work on floats and negative numbers, remove the dot and the minus symbol
        # then check (remove only first occurence to avoid multiple dots or minuses in a string)
        if type(value) == str and value.replace('.', '', 1).replace('-', '', 1).isdigit():
            return str(value)
        return f'"{str(value)}"'

    # Adding keys of first row as headers
    if len(data) > 0 and type(data) == list:
        headers = { f"key{idx}": str(key) for idx, key in enumerate(data[0].keys()) }
        data = [headers] + data
    for row in data:
        # In overview response, the "created_at" field is a value, not a dict, so skip it
        if type(row) == dict:
            yield f"{','.join([convert_to_csv(value) for value in row.values()])}\n"

def fetch_overview(raw_data: dict) -> dict:
    """
    Helper function to parse overview response from ThingSpeak API.

    raw_data: raw response from API when accessing overview endpoint.
    """

    # value keys are as follows field{1-9}
    channel_keys = [f"field{idx}" for idx in range(1, 9)]

    overview = {}
    # Add titles of all fields with data in the channel
    for key in channel_keys:
        overview[key] = {"title": raw_data["channel"][key]}

    latest_date = None
    # ThingSpeak lists feeds in ascending dates, so we iterate backwards to get latest values
    for idx in range(len(raw_data["feeds"]) - 1, -1, -1):
        # If we went over the entire day of latest non-null value, stop iterating
        if latest_date is not None:
            current_date = datetime.strptime(raw_data["feeds"][idx]["created_at"], "%Y-%m-%dT%H:%M:%SZ")
            if current_date.date() != latest_date.date():
                break
        # Otherwise proceed as normal
        for key in channel_keys:
            if raw_data["feeds"][idx][key] is not None:
                # Set the date of the earliest non-null feed in the API response
                if latest_date is None:
                    latest_date = datetime.strptime(raw_data["feeds"][idx]["created_at"], "%Y-%m-%dT%H:%M:%SZ")
                # Remove \n, \r, \b with strip
                overview[key]["value"] = str(raw_data["feeds"][idx][key]).strip()
                # Update minimum and maximum values for each sensor
                try:
                    if "min" not in overview[key] or float(raw_data["feeds"][idx][key]) < overview[key]["min"]:
                        overview[key]["min"] = float(raw_data["feeds"][idx][key])
                    if "max" not in overview[key] or float(raw_data["feeds"][idx][key]) > overview[key]["max"]:
                        overview[key]["max"] = float(raw_data["feeds"][idx][key])
                except ValueError:
                    pass
    # Add date of the day of displayed values to overview
    overview["created_at"] = latest_date.date() if latest_date is not None else None
    return overview

def flatten(data: list[list[Any]]) -> list[Any]:
    """
    Convert list of lists into 1-D list.
    """
    flat_list = []
    for entry in data:
        flat_list.extend(entry)
    return flat_list

def parse_update_row(row_data: dict) -> list[Any]:
    """
    Convert row dict into a list with order of columns in the measurement table.

    row_data: single row values from a feed in endpoint API response
    """
    parsed_row = [None, None, None, None, None, None, None, None, None, None]
    # executemany does not support specifying column names, so we have to order them
    # according to their declaration in the schema.sql file - override this variable if you change
    # the table schema for measurements
    mapping = {"created_at": 0, "entry_id": 1, "field1": 2, "field2": 3, "field3": 4, "field4": 5, "field5": 6, "field6": 7, "field7": 8, "field8": 9}
    for key in row_data:
        parsed_row[mapping[key]] = row_data[key]
    return parsed_row

def update_database(db_conn : sqlite3.Connection, raw_data: dict) -> None:
    """
    Insert API response data into the database if it doesn't exist or update null values if non-null value is provided.
    Basically, a bulk upsert with coalesce to remove nulls.

    raw_data: entire response from the endpoint API
    """
    data_to_insert = []
    for feed in raw_data["feeds"]:
        row_to_insert = parse_update_row(feed)
        if any(row_to_insert[2:]):
            data_to_insert.append(row_to_insert)
    # Bulk upsert operation, using connection as context manager executes code as a single transaction
    # https://docs.python.org/3/library/sqlite3.html#sqlite3-connection-context-manager
    with db_conn:
        cur = db_conn.cursor()
        # Create empty temporary table that will have the same schema as the original table (and no rows, since 1=0 is always false)
        cur.execute('CREATE TEMPORARY TABLE temp_table AS SELECT * FROM measurement WHERE 1=0')
        cur = db_conn.cursor()
        db_conn.executemany('INSERT INTO temp_table VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', data_to_insert)
        # Update existing rows if existing row value is None
        cur.execute('''
            UPDATE measurement
            SET
                measurement_field1 = COALESCE(measurement.measurement_field1, temp_table.measurement_field1),
                measurement_field2 = COALESCE(measurement.measurement_field2, temp_table.measurement_field2),
                measurement_field2 = COALESCE(measurement.measurement_field3, temp_table.measurement_field3),
                measurement_field2 = COALESCE(measurement.measurement_field4, temp_table.measurement_field4),
                measurement_field2 = COALESCE(measurement.measurement_field5, temp_table.measurement_field5),
                measurement_field2 = COALESCE(measurement.measurement_field6, temp_table.measurement_field6),
                measurement_field2 = COALESCE(measurement.measurement_field7, temp_table.measurement_field7),
                measurement_field2 = COALESCE(measurement.measurement_field8, temp_table.measurement_field8)
            FROM temp_table
            WHERE measurement.measurement_id = temp_table.measurement_id
        ''')

        # Insert rows that did not exist in the original table
        cur.execute('INSERT OR IGNORE INTO measurement SELECT * FROM temp_table')
    db_conn.commit()

def get_db_measurements(db_conn : sqlite3.Connection, sensor_id : int | None = None, size_limit : int = 99) -> list[dict]:
    """
    Get measurements from the database. Used when network or endpoint is unavailable. It will match the format of the
    endpoint for fetch_overview (if sensor_id is None), or convert_sensor_data (is sensor_id is not None).
    If sensor is specified, it will fetch only non-null values.

    sensor_id: fetch data for specific sensor or for all sensors if None
    size_limit: how much data to fetch from database
    """
    cur = db_conn.cursor()
    keys = ["created_at", "entry_id", "field1", "field2", "field3", "field4", "field5", "field6", "field7", "field8"]
    if not sensor_id:
        # For overview
        cur.execute(f"SELECT * FROM measurement ORDER BY measurement_id DESC LIMIT {size_limit}")
        return dict(
            # This could be improved by creating a table in database with titles for each field, but I am skipping it here
            # by hard-coding values (man, do I love to be pressured by time)
            channel={
                "field1": "Temperatura (DHT-22) [°C]",
                "field2": "Wilgotność względna (DHT-22) [%]",
                "field3": "Natężenie światła (BH-1750) [lx]",
                "field4": "Ciśnienie atm. (BMP-180) [hPa]",
                "field5": "Temp. grzejnika (DS18B20) [°C]",
                "field6": "Temperatura (DS18B20) [°C]",
                "field7": "Ruch (PIR)",
                "field8": "Temperatura  (BMP-180) [°C]",
            },
            # This could be replaced by https://www.adamsmith.haus/python/examples/3884/sqlite3-use-a-row-factory-to-access-values-by-column-name
            # but then we would have to remap the keys to the ones accepted by fetch_overview anyway, so I am not doing it
            feeds=[dict(zip(keys, values)) for values in cur.fetchall()]
        )
    # For specific sensor
    cur.execute(f"SELECT * FROM measurement WHERE measurement_field{sensor_id} IS NOT NULL ORDER BY measurement_id DESC LIMIT {size_limit}")
    return [dict(zip(keys, values)) for values in cur.fetchall()]
