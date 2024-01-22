import requests
import matplotlib.pyplot as plt

from datetime import datetime, timedelta
from Prophet import TimeSeriesProphet

API_ENDPOINT = "https://api.thingspeak.com/channels/202842"
DEVICE_ID = 1
PROPHET_GROWTH = 'linear'
PROPHET_NUM_CHANGEPOINTS = 25
Y_LABEL = "Temperature"
NUM_X_TICKS = 5

def get_data(endpoint: str, device_id: int, query_params: list[str]) -> list[dict]:
    result = []

    try:
        response = requests.get(f"{endpoint}/fields/{device_id}.json?{'&'.join(query_params)}").json()
        result = [ val for val in response["feeds"] if val[f"field{device_id}"] is not None ]
    except Exception as err:
        print(err)

    return result

def process_data(json_data: list[dict], device_id: int) -> [list[str], list[str]]:
    X = []
    y = []
    for entry in json_data:
        X.append(entry['created_at'])
        y.append(entry[f'field{device_id}'])
    return X, y

input_data = get_data(API_ENDPOINT, DEVICE_ID, ["days=2"])
X, y = process_data(input_data, DEVICE_ID)

prophet_example = TimeSeriesProphet(growth=PROPHET_GROWTH, n_changepoints=PROPHET_NUM_CHANGEPOINTS)
prophet_example.fit2(X, y, True)

start = datetime.now()
end = start + timedelta(days=1)

prophet_result = prophet_example.predict2(datetime.now(), end, timedelta(minutes=1))

X_result = prophet_result[['ds']].values.astype('datetime64[us]').tolist()
y_result = prophet_result[['yhat']].values.tolist()
X_result = [item for row in X_result for item in row]
y_result = [item for row in y_result for item in row]

plt.plot(X_result, y_result)
step_size = len(X_result) // NUM_X_TICKS
plt.xticks(X_result[::step_size], [ f"{val.day}.{val.month} {val.hour}:00" for val in X_result[::step_size] ])
plt.title(f"Prophet result for growth={PROPHET_GROWTH} ({NUM_X_TICKS} ticks)")
plt.xlabel("Date")
plt.ylabel(Y_LABEL)
plt.show()
