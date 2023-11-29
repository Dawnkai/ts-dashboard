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

    dht_temp = []

    for entry in data["feeds"]:
        if entry["field2"] is not None:
            dht_temp.append(
                {
                    "timestamp": str(entry["created_at"]),
                    "value": float(entry["field2"]),
                    "id": entry["entry_id"],
                }
            )

    return jsonify(dht_temp), 200
