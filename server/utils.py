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

def fetch_overview(overview_url: str) -> dict:
    """
    Helper function to fetch latest values for every sensor from ThingSpeak API.

    overview_url: full path to the channel endpoint API
    """
    resp = requests.get(overview_url)
    data = resp.json()

    # value keys are as follows field{1-9}
    channel_keys = [f"field{idx}" for idx in range(1, 9)]

    overview = {}
    # Add titles of all fields with data in the channel
    for key in channel_keys:
        overview[key] = {"title": data["channel"][key]}

    latest_date = None
    # ThingSpeak lists feeds in ascending dates, so we iterate backwards to get latest values
    for idx in range(len(data["feeds"]) - 1, -1, -1):
        # If we went over the entire day of latest non-null value, stop iterating
        if latest_date is not None:
            current_date = datetime.strptime(data["feeds"][idx]["created_at"], "%Y-%m-%dT%H:%M:%SZ")
            if current_date.date() != latest_date.date():
                break
        # Otherwise proceed as normal
        for key in channel_keys:
            if data["feeds"][idx][key] is not None:
                # Set the date of the earliest non-null feed in the API response
                if latest_date is None:
                    latest_date = datetime.strptime(data["feeds"][idx]["created_at"], "%Y-%m-%dT%H:%M:%SZ")
                # Remove \n, \r, \b with strip
                overview[key]["value"] = str(data["feeds"][idx][key]).strip()
                # Update minimum and maximum values for each sensor
                try:
                    if "min" not in overview[key] or float(data["feeds"][idx][key]) < overview[key]["min"]:
                        overview[key]["min"] = float(data["feeds"][idx][key])
                    if "max" not in overview[key] or float(data["feeds"][idx][key]) > overview[key]["max"]:
                        overview[key]["max"] = float(data["feeds"][idx][key])
                except ValueError:
                    pass
    # Add date of the day of displayed values to overview
    overview["created_at"] = latest_date.date() if latest_date is not None else None
    return overview

def fetch_sensor_data(sensor_url: str, sensor_id: int) -> list[dict]:
    """
    Helper function to fetch values for specific sensor from ThingSpeak API.

    sensor_url: full path to the API endpoint of requested sensor
    sensor_id: id of the sensor (only the digit part, not the "field")
    """
    resp = requests.get(sensor_url)
    data = resp.json()
    return convert_sensor_data(data["feeds"], f"field{sensor_id}")

def flatten(data: list[list[Any]]) -> list[Any]:
    """
    Convert list of lists into 1-D list.
    """
    flat_list = []
    for entry in data:
        flat_list.extend(entry)
    return flat_list
