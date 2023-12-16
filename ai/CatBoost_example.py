import requests
import matplotlib.pyplot as plt

from datetime import datetime, timedelta
from CatBoost import TimeSeriesCatBoost

API_ENDPOINT = "https://api.thingspeak.com/channels/202842"
DEVICE_ID = 1
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

catboost_example = TimeSeriesCatBoost(n_estimators=NUM_ESTIMATORS, learning_rate=LEARNING_RATE, verbose=VERBOSE_COUNT)
catboost_example.fit2(X=X, y=y, process_data=True)

start = datetime.now()
end = start + timedelta(days=1)

catboost_result = catboost_example.predict2(start_date=start, end_date=end, interval=timedelta(minutes=1))

plt.plot(catboost_result[0], catboost_result[1])
step_size = len(catboost_result[0]) // NUM_X_TICKS
plt.xticks(catboost_result[0][::step_size], [ f"{val.day}.{val.month} {val.hour}:00" for val in catboost_result[0][::step_size] ])
plt.title(f"CatBoost result for estimators={NUM_ESTIMATORS} ({NUM_X_TICKS} ticks)")
plt.xlabel("Date")
plt.ylabel(Y_LABEL)
plt.show()
