CREATE TABLE IF NOT EXISTS USER (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_login TEXT NOT NULL,
    user_password TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS MEASUREMENT (
    measurement_created_at TEXT NOT NULL,
    measurement_id INTEGER PRIMARY KEY UNIQUE,
    measurement_field1 TEXT NULL,
    measurement_field2 TEXT NULL,
    measurement_field3 TEXT NULL,
    measurement_field4 TEXT NULL,
    measurement_field5 TEXT NULL,
    measurement_field6 TEXT NULL,
    measurement_field7 TEXT NULL,
    measurement_field8 TEXT NULL
);
