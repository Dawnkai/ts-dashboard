from flask import Flask, jsonify, g, request
from datetime import timedelta, datetime, timezone

import requests
import sqlite3

from flask_jwt_extended import create_access_token, jwt_required, JWTManager, \
    get_jwt, get_jwt_identity, set_access_cookies, unset_jwt_cookies

from utils import authenticate_user, convert_sensor_data, user_exists

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
    resp = requests.get(
        f"{app.config['API']}/channels/{app.config['CHANNEL']}/feeds.json"
    )
    data = resp.json()

    # value keys are as follows field{1-9}
    channel_keys = [f"field{idx}" for idx in range(1, 9)]

    overview = {}
    # Add titles of all fields with data in the channel
    for key in channel_keys:
        overview[key] = {"title": data["channel"][key]}

    # Iterate over latest values for fields and choose latest non-null values
    for feed in data["feeds"]:
        for key in channel_keys:
            if feed[key] is not None:
                # Some fields have \n or \r appended to them, this removes them
                overview[key]["value"] = str(feed[key]).strip()

    return jsonify(overview), 200


@app.route("/sensor/dht/temp")
@jwt_required()
def get_dht_temp():
    resp = requests.get(
        f"{app.config['API']}/channels/{app.config['CHANNEL']}/fields/1.json"
    )
    data = resp.json()
    return jsonify(convert_sensor_data(data["feeds"], "field1")), 200


@app.route("/sensor/dht/humidity")
@jwt_required()
def get_dht_humidity():
    resp = requests.get(
        f"{app.config['API']}/channels/{app.config['CHANNEL']}/fields/2.json"
    )
    data = resp.json()
    return jsonify(convert_sensor_data(data["feeds"], "field2")), 200


@app.route("/sensor/bh/luminosity")
@jwt_required()
def get_bh_luminosity():
    resp = requests.get(
        f"{app.config['API']}/channels/{app.config['CHANNEL']}/fields/3.json"
    )
    data = resp.json()
    return jsonify(convert_sensor_data(data["feeds"], "field3")), 200


@app.route("/sensor/bmp/pressure")
@jwt_required()
def get_bmp_pressure():
    resp = requests.get(
        f"{app.config['API']}/channels/{app.config['CHANNEL']}/fields/4.json"
    )
    data = resp.json()
    return jsonify(convert_sensor_data(data["feeds"], "field4")), 200


@app.route("/sensor/ds/heater-temp")
@jwt_required()
def get_ds_heater_temp():
    resp = requests.get(
        f"{app.config['API']}/channels/{app.config['CHANNEL']}/fields/5.json"
    )
    data = resp.json()
    return jsonify(convert_sensor_data(data["feeds"], "field5")), 200


@app.route("/sensor/ds/temp")
@jwt_required()
def get_ds_temp():
    resp = requests.get(
        f"{app.config['API']}/channels/{app.config['CHANNEL']}/fields/6.json"
    )
    data = resp.json()
    return jsonify(convert_sensor_data(data["feeds"], "field6")), 200


@app.route("/sensor/pir/movement")
@jwt_required()
def get_pir_movement():
    resp = requests.get(
        f"{app.config['API']}/channels/{app.config['CHANNEL']}/fields/7.json"
    )
    data = resp.json()
    return jsonify(convert_sensor_data(data["feeds"], "field7")), 200


@app.route("/sensor/bmp/temp")
@jwt_required()
def get_bmp_temp():
    resp = requests.get(
        f"{app.config['API']}/channels/{app.config['CHANNEL']}/fields/8.json"
    )
    data = resp.json()
    return jsonify(convert_sensor_data(data["feeds"], "field8")), 200
