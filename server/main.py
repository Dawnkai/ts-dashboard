from flask import Flask, jsonify, g, request
from datetime import timedelta, datetime, timezone

import sqlite3

from flask_jwt_extended import create_access_token, jwt_required, JWTManager, \
    get_jwt, get_jwt_identity, set_access_cookies, unset_jwt_cookies

from utils import authenticate_user, user_exists, fetch_overview, fetch_sensor_data, \
    flatten, generate_csv_file

app = Flask(__name__)
app.config["API"] = "https://api.thingspeak.com"
app.config["CHANNEL"] = 202842
app.config["DBPATH"] = "server/database.db"
# Change this key when deploying to production
app.config['SECRET_KEY'] = "asdasdasd"
# JWT tokens are going to be stored to cookies
app.config["JWT_TOKEN_LOCATION"] = ["cookies"]
# How long should the jwt token be valid for
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)
jwt = JWTManager(app)


def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(app.config["DBPATH"])
        db.row_factory = sqlite3.Row
    return db


@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()


@app.after_request
def refresh_expiring_jwts(response):
    try:
        expiry_time = get_jwt()["exp"]
        now = datetime.now(timezone.utc)
        target_time = datetime.timestamp(now + (app.config["JWT_ACCESS_TOKEN_EXPIRES"] / 2))
        # If token expires in less than half it's max age, refresh token
        if target_time > expiry_time:
            access_token = create_access_token(identity=get_jwt_identity())
            set_access_cookies(response, access_token)
        return response
    except (RuntimeError, KeyError):
        # Case where there is not a valid JWT. Just return the original response
        return response


@app.route("/logout", methods=["HEAD"])
@jwt_required()
def logout():
    # HEAD request ignores the body, so the content doesn't matter
    response = jsonify({"msg": "Logged out."})
    unset_jwt_cookies(response)
    return response, 200


# Register needs to have separate API, because in GET requests using fetch does not support body
# There is actually a pretty funny thread about this, I recommend checking it out
# https://github.com/whatwg/fetch/issues/551
@app.route("/register", methods=["POST"])
def register():
    if not request.is_json:
        return jsonify({"msg": "Request is not a json"}), 400
    db = get_db()
    user_data = request.get_json()

    if "user_login" not in user_data or "user_password" not in user_data:
        return jsonify({"msg": "Request json has missing fields!"}), 400
    
    if user_exists(db.cursor(), user_data["user_login"]):
        return jsonify({"msg": "User already exists!"}), 400
    db.cursor().execute(
        f"INSERT INTO USER (user_login, user_password) VALUES (?, ?)",
        [user_data["user_login"], user_data["user_password"]]
    )
    db.commit()
    
    response = jsonify({"msg": "User created!"})
    set_access_cookies(response, create_access_token(identity=user_data["user_login"]))
    return response, 201


@app.route("/login", methods=["POST"])
def login():
    if not request.is_json:
        return jsonify({"msg": "Request is not a json"}), 400
    db = get_db()
    user_data = request.get_json()

    if "user_login" not in user_data or "user_password" not in user_data:
        return jsonify({"msg": "Request json has missing fields!"}), 400

    if authenticate_user(db.cursor(), user_data["user_login"], user_data["user_password"]):
        response = jsonify({"msg": "User logged in!"})
        set_access_cookies(response, create_access_token(identity=user_data["user_login"]))
        return response, 200
    return jsonify({"msg": "Wrong login or password."}), 401


@app.route("/overview")
def get_overview():
    return jsonify(
        fetch_overview(
            f"{app.config['API']}/channels/{app.config['CHANNEL']}/feeds.json"
        )
    ), 200


@app.route("/sensor/<sensor_id>")
@jwt_required()
def get_sensor_data(sensor_id: int):
    return jsonify(
        fetch_sensor_data(
            f"{app.config['API']}/channels/{app.config['CHANNEL']}/fields/{sensor_id}.json",
            sensor_id
        )
    ), 200


# The last part of the url is the name of the returned file
# I tried searching for how to change the name of a file stream in Flask
# but I was not able to find anything, so I set the name in here
# We could check if setting filename in Content-Disposition will work
# https://stackoverflow.com/questions/41543951/how-to-change-downloading-name-in-flask
@app.route("/export/export.csv", methods=["POST"])
def export_csv():
    if not request.is_json:
        return jsonify({"msg": "Request is not a json"}), 400

    export_params = request.get_json()
    sensor_data = []
    # So uhh, the code below could use some refactoring, because it looks very sophisticated to me,
    # but it will probably be rewritten when we add database values to API response, so I'll leave it be
    # for now.

    # sensors in request json contain ids of sensors to fetch data for
    if "sensors" in export_params:
        sensor_ids = export_params["sensors"]
        for sensor_id in sensor_ids:
            sensor_data.append(
                fetch_sensor_data(
                    f"{app.config['API']}/channels/{app.config['CHANNEL']}/fields/{sensor_id}.json",
                    sensor_id
                )
            )
        sensor_data = flatten(sensor_data)
    else:
        # If no sensor ids are provided, send back overview
        overview = fetch_overview(
            f"{app.config['API']}/channels/{app.config['CHANNEL']}/feeds.json"
        )
        sensor_data = [
            overview[key] for key in overview
        ]
    if len(sensor_data) > 0:
        return generate_csv_file(sensor_data), {"Content-Type": "text/csv"}
    return jsonify({"msg": "Unable to create csv export"}), 500
