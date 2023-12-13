import requests
import matplotlib.pyplot as plt

from datetime import datetime, timedelta
from XGBoost import TimeSeriesXGBoost

API_ENDPOINT = "https://api.thingspeak.com/channels/202842"
DEVICE_ID = 1
TEST_SIZE = 0.2
NUM_ESTIMATORS = 1000
# Stop after this many iterations if there is no accuracy improvement
STOPPING_ROUNDS = 50
LEARNING_RATE = 0.001
# True - display all stages of learning
VERBOSE_COUNT = 100
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

xgboost_example = TimeSeriesXGBoost(TEST_SIZE, NUM_ESTIMATORS, NUM_ESTIMATORS, LEARNING_RATE, VERBOSE_COUNT)
xgboost_example.fit(X, y, True)

start = datetime.now()
end = start + timedelta(days=1)

xgb_result = xgboost_example.predict(start, end, timedelta(minutes=1))

plt.plot(xgb_result[0], xgb_result[1])
step_size = len(xgb_result[0]) // NUM_X_TICKS
plt.xticks(xgb_result[0][::step_size], [ f"{val.day}.{val.month} {val.hour}:00" for val in xgb_result[0][::step_size] ])
plt.title(f"XGBoost result for estimators={NUM_ESTIMATORS} ({NUM_X_TICKS} ticks)")
plt.xlabel("Date")
plt.ylabel(Y_LABEL)
plt.show()