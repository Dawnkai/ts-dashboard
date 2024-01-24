from flask import Flask, jsonify, g, request
from datetime import timedelta, datetime, timezone

import requests
import sqlite3

from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    JWTManager,
    get_jwt,
    get_jwt_identity,
    set_access_cookies,
    unset_jwt_cookies,
)

from utils import (
    authenticate_user,
    user_exists,
    fetch_overview,
    convert_sensor_data,
    flatten,
    generate_csv_file,
    update_database,
    get_db_measurements,
)

from ai.CatBoost import TimeSeriesCatBoost
from ai.KNN import TimeSeriesKNN
from ai.Prophet import TimeSeriesProphet
from ai.XGBoost import TimeSeriesXGBoost

app = Flask(__name__)
app.config["API"] = "https://api.thingspeak.com"
app.config["CHANNEL"] = 202842
app.config["DBPATH"] = "server/database.db"
# Change this key when deploying to production
app.config["SECRET_KEY"] = "asdasdasd"
# JWT tokens are going to be stored to cookies
app.config["JWT_TOKEN_LOCATION"] = ["cookies"]
# How long should the jwt token be valid for
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)
jwt = JWTManager(app)


def get_db():
    db = getattr(g, "_database", None)
    if db is None:
        db = g._database = sqlite3.connect(app.config["DBPATH"])
        db.row_factory = sqlite3.Row
    return db


@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, "_database", None)
    if db is not None:
        db.close()


@app.after_request
def refresh_expiring_jwts(response):
    try:
        expiry_time = get_jwt()["exp"]
        now = datetime.now(timezone.utc)
        target_time = datetime.timestamp(
            now + (app.config["JWT_ACCESS_TOKEN_EXPIRES"] / 2)
        )
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
        [user_data["user_login"], user_data["user_password"]],
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

    if authenticate_user(
        db.cursor(), user_data["user_login"], user_data["user_password"]
    ):
        response = jsonify({"msg": "User logged in!"})
        set_access_cookies(
            response, create_access_token(identity=user_data["user_login"])
        )
        return response, 200
    return jsonify({"msg": "Wrong login or password."}), 401


@app.route("/overview")
def get_overview():
    try:
        resp = requests.get(
            f"{app.config['API']}/channels/{app.config['CHANNEL']}/feeds.json"
        )
        if resp.status_code == 200:
            data = resp.json()
            db = get_db()
            if db:
                update_database(db, data)
            return jsonify(fetch_overview(data)), 200
    # If url does not exist (doesn't even return 404) GET will throw ConnectionError, so we ignore it and
    # fetch data from the database anyway.
    except ConnectionError:
        pass
    finally:
        db = get_db()
        if db:
            return jsonify(fetch_overview(get_db_measurements(db))), 200
        return jsonify({"msg": "Unable to fetch data"}), 500


@app.route("/sensor/<sensor_id>")
@jwt_required()
def get_sensor_data(sensor_id: int):
    try:
        resp = requests.get(
            f"{app.config['API']}/channels/{app.config['CHANNEL']}/fields/{sensor_id}.json"
        )
        if resp.status_code == 200:
            data = resp.json()
            db = get_db()
            if db:
                update_database(db, data)
            return jsonify(convert_sensor_data(data["feeds"], f"field{sensor_id}")), 200
    # If url does not exist (doesn't even return 404) GET will throw ConnectionError, so we ignore it and
    # fetch data from the database anyway.
    except ConnectionError:
        pass
    finally:
        db = get_db()
        if db:
            return (
                jsonify(
                    convert_sensor_data(
                        get_db_measurements(db, sensor_id), f"field{sensor_id}"
                    )
                ),
                200,
            )
        return jsonify({"msg": "Unable to fetch data"}), 500


@app.route("/sensor/<sensor_id>/predict", methods=["POST"])
# @jwt_required
def get_sensor_data_prediction(sensor_id: int):
    if not request.is_json:
        return jsonify({"msg": "Request is not a json"}), 400

    predict_params = request.get_json()
    if "startDate" not in predict_params:
        return (
            jsonify({"msg": "Start date of prediction source data not specified"}),
            400,
        )

    query_params = f"?start={predict_params['startDate']}"
    if "endDate" in query_params:
        query_params += f"&end={query_params['endDate']}"

    algorithm = "CatBoost"
    if "algorithm" in predict_params:
        algorithm = predict_params["algorithm"]

    model = None
    if algorithm == "CatBoost":
        model = TimeSeriesCatBoost(
            n_estimators=1000, learning_rate=0.001, verbose=False
        )
    elif algorithm == "KNN":
        model = TimeSeriesKNN(n_neighbors=3, daily=True)
    elif algorithm == "Prophet":
        model = TimeSeriesProphet(growth="linear", n_changepoints=25)
    elif algorithm == "XGBoost":
        model = TimeSeriesXGBoost(
            test_size=0.2, params={"n_estimators": 1000, "learning_rate": 0.001}
        )
    if not model:
        return jsonify({"msg": "Unsupported model selected"}), 400

    api_resp = requests.get(
        f"{app.config['API']}/channels/{app.config['CHANNEL']}/fields/{sensor_id}.json{query_params}"
    )
    prediction_data = [
        val for val in api_resp.json()["feeds"] if val[f"field{sensor_id}"] is not None
    ]
    X, y = model.initial_processing(prediction_data, sensor_id)

    model.fit2(X, y, process_data=True)
    result = model.predict2(
        start_date=datetime.strptime(predict_params["startDate"], "%Y-%m-%dT%H:%M:%SZ"),
        end_date=datetime.strptime(predict_params["endDate"], "%Y-%m-%dT%H:%M:%SZ")
        if "endDate" in predict_params
        else datetime.now(),
        interval=timedelta(minutes=1),
    )

    return jsonify(model.extract_result(result)), 200


# The last part of the url is the name of the returned file (export.csv)
# I tried searching for how to change the name of a file stream in Flask
# but I was not able to find anything, so I set the name in here
# We could check if setting filename in Content-Disposition will work
# https://stackoverflow.com/questions/41543951/how-to-change-downloading-name-in-flask
@app.route("/export/export.csv", methods=["POST"])
def export_csv():
    if not request.is_json:
        return jsonify({"msg": "Request is not a json"}), 400

    export_params = request.get_json()
    if "source" not in export_params:
        return jsonify({"msg": "Source not specified"}), 400

    result = []
    sensor_ids = None

    if "sensors" in export_params:
        sensor_ids = export_params["sensors"]
    db = get_db()
    if not db:
        return jsonify({"msg": "Unable to contact database"}), 500

    query_params = ""
    if "startDate" in export_params:
        query_params += f"?start={export_params['startDate']}"
        if "endDate" in export_params:
            query_params += f"&end={export_params['endDate']}"
    elif "endDate" in export_params:
        query_params += f"?end={export_params['endDate']}"

    if sensor_ids:
        for sensor_id in sensor_ids:
            sensor_data = None
            if export_params["source"] == "api":
                # Fetch csv data from API
                api_resp = requests.get(
                    f"{app.config['API']}/channels/{app.config['CHANNEL']}/fields/{sensor_id}.json{query_params}"
                )
                if api_resp.status_code == 200:
                    sensor_resp = api_resp.json()
                    sensor_data = convert_sensor_data(
                        sensor_resp["feeds"], f"field{sensor_id}"
                    )
            else:
                # Fetch csv data from database
                if "startDate" in export_params or "endDate" in export_params:
                    sensor_data = get_db_measurements(
                        db,
                        sensor_id,
                        999,
                        export_params["startDate"],
                        export_params["endDate"],
                    )
                else:
                    sensor_data = get_db_measurements(db, sensor_id, 999)
            if sensor_data:
                result.append(sensor_data)
        # Merge data for selected sensors
        result = flatten(result)
    # Get export for overview
    else:
        overview_data = None
        if export_params["source"] == "api":
            # Fetch csv data from API
            api_resp = requests.get(
                f"{app.config['API']}/channels/{app.config['CHANNEL']}/feeds.json{query_params}"
            )
            if api_resp.status_code == 200:
                overview_data = fetch_overview(api_resp.json())
        else:
            # Fetch csv data from database
            if "startDate" in export_params or "endDate" in export_params:
                overview_data = fetch_overview(
                    get_db_measurements(
                        db,
                        size_limit=999,
                        start_date=export_params["startDate"],
                        end_date=export_params["endDate"],
                    )
                )
            else:
                overview_data = fetch_overview(get_db_measurements(db, size_limit=999))
        if overview_data:
            # Extract latest overview data from response
            result = [overview_data[key] for key in overview_data]
    if len(result) > 0:
        return generate_csv_file(result), {"Content-Type": "text/csv"}
    return jsonify({"msg": "Unable to create csv export"}), 500
