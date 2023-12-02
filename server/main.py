from flask import Flask, jsonify
import requests

app = Flask(__name__)
app.config["API"] = "https://api.thingspeak.com"
app.config["CHANNEL"] = 202842


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
def get_dht_temp():
    resp = requests.get(
        f"{app.config['API']}/channels/{app.config['CHANNEL']}/fields/1.json"
    )
    data = resp.json()

    dht_temp = []

    for entry in data["feeds"]:
        if entry["field1"] is not None:
            dht_temp.append(
                {
                    "timestamp": str(entry["created_at"]),
                    "value": float(entry["field1"]),
                    "id": entry["entry_id"],
                }
            )

    return jsonify(dht_temp), 200


@app.route("/sensor/dht/humidity")
def get_dht_humidity():
    resp = requests.get(
        f"{app.config['API']}/channels/{app.config['CHANNEL']}/fields/2.json"
    )
    data = resp.json()

    dht_humidity = []

    for entry in data["feeds"]:
        if entry["field2"] is not None:
            dht_humidity.append(
                {
                    "timestamp": str(entry["created_at"]),
                    "value": float(entry["field2"]),
                    "id": entry["entry_id"],
                }
            )

    return jsonify(dht_humidity), 200


@app.route("/sensor/bh/luminosity")
def get_bh_luminosity():
    resp = requests.get(
        f"{app.config['API']}/channels/{app.config['CHANNEL']}/fields/3.json"
    )
    data = resp.json()

    luminosity = []

    for entry in data["feeds"]:
        if entry["field3"] is not None:
            luminosity.append(
                {
                    "timestamp": str(entry["created_at"]),
                    "value": float(entry["field3"]),
                    "id": entry["entry_id"],
                }
            )

    return jsonify(luminosity), 200


@app.route("/sensor/bmp/pressure")
def get_bmp_pressure():
    resp = requests.get(
        f"{app.config['API']}/channels/{app.config['CHANNEL']}/fields/4.json"
    )
    data = resp.json()

    pressure = []

    for entry in data["feeds"]:
        if entry["field4"] is not None:
            pressure.append(
                {
                    "timestamp": str(entry["created_at"]),
                    "value": float(entry["field4"]),
                    "id": entry["entry_id"],
                }
            )

    return jsonify(pressure), 200


@app.route("/sensor/ds/heater-temp")
def get_ds_heater_temp():
    resp = requests.get(
        f"{app.config['API']}/channels/{app.config['CHANNEL']}/fields/5.json"
    )
    data = resp.json()

    ds_heater_temp = []

    for entry in data["feeds"]:
        if entry["field5"] is not None:
            ds_heater_temp.append(
                {
                    "timestamp": str(entry["created_at"]),
                    "value": float(entry["field5"]),
                    "id": entry["entry_id"],
                }
            )

    return jsonify(ds_heater_temp), 200


@app.route("/sensor/ds/temp")
def get_ds_temp():
    resp = requests.get(
        f"{app.config['API']}/channels/{app.config['CHANNEL']}/fields/6.json"
    )
    data = resp.json()

    ds_temp = []

    for entry in data["feeds"]:
        if entry["field6"] is not None:
            ds_temp.append(
                {
                    "timestamp": str(entry["created_at"]),
                    "value": float(entry["field6"]),
                    "id": entry["entry_id"],
                }
            )

    return jsonify(ds_temp), 200


@app.route("/sensor/pir/movement")
def get_pir_movement():
    resp = requests.get(
        f"{app.config['API']}/channels/{app.config['CHANNEL']}/fields/7.json"
    )
    data = resp.json()

    pir_movement = []

    for entry in data["feeds"]:
        if entry["field7"] is not None:
            pir_movement.append(
                {
                    "timestamp": str(entry["created_at"]),
                    "value": float(entry["field7"]),
                    "id": entry["entry_id"],
                }
            )

    return jsonify(pir_movement), 200


@app.route("/sensor/bmp/temp")
def get_bmp_temp():
    resp = requests.get(
        f"{app.config['API']}/channels/{app.config['CHANNEL']}/fields/8.json"
    )
    data = resp.json()

    bmp_temp = []

    for entry in data["feeds"]:
        if entry["field8"] is not None:
            bmp_temp.append(
                {
                    "timestamp": str(entry["created_at"]),
                    "value": float(entry["field8"]),
                    "id": entry["entry_id"],
                }
            )

    return jsonify(bmp_temp), 200
