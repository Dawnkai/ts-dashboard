import requests
import matplotlib.pyplot as plt

from datetime import datetime, timedelta
from KNN import TimeSeriesKNN

API_ENDPOINT = "https://api.thingspeak.com/channels/202842"
DEVICE_ID = 1
NUM_NEIGHBORS = 2
DAILY_LEARNING = False
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

knn_example = TimeSeriesKNN(n_neighbors=NUM_NEIGHBORS, daily=DAILY_LEARNING)
knn_example.fit2(X=X, y=y, process_data=True)

start = datetime.now()
end = start + timedelta(days=1)

knn_result = knn_example.predict2(start_date=start, end_date=end, interval=timedelta(minutes=1))

plt.plot(knn_result[0], knn_result[1])
step_size = len(knn_result[0]) // NUM_X_TICKS
if DAILY_LEARNING:
    plt.xticks(knn_result[0][::step_size], [ f"{val.hour}:{'0' if val.minute < 10 else ''}{val.minute}" for val in knn_result[0][::step_size] ])
else:
    plt.xticks(knn_result[0][::step_size], [ f"{val.day}.{val.month} {val.hour}:00" for val in knn_result[0][::step_size] ])
plt.title(f"KNN result for k={NUM_NEIGHBORS} and daily = {'True' if DAILY_LEARNING else 'False'} ({NUM_X_TICKS} ticks)")
plt.xlabel("Date")
plt.ylabel(Y_LABEL)
plt.show()
