import numpy as np

from datetime import datetime, timedelta
from sklearn.neighbors import KNeighborsRegressor

class TimeSeriesKNN:
    """
    K-Neighbors Classifier for Time Series forecasting.

    num_neighbors: number of neighbors in prediction
    weights: weights used in prediction (uniform or distance)
    algorithm: algorithm for computing neighbors (auto, ball_tree, kd_tree, brute)
    p: power number of minkowski metric
    daily: should the model learn excluding days, including only time (True) or including days (False)
    granulaity: should the predictions be split by seconds (s), minutes (min) or hours (h)
    """
    def __init__(
            self,
            num_neighbors=3,
            weights='distance',
            algorithm='auto',
            p=2,
            metric='minkowski',
            daily=False,
            granularity='min'
        ):
        self.model = KNeighborsRegressor(n_neighbors=num_neighbors, weights=weights, algorithm=algorithm, p=p, metric=metric)
        self.daily = daily
        self.granularity = granularity
    
    def date_to_ordinal(self, input_date : str | datetime) -> int:
        """
        Convert date (without year) to ordinal number
        """
        date_object = input_date
        if type(input_date) is str:
            date_object = datetime.strptime(input_date, "%Y-%m-%dT%H:%M:%SZ")
        date_part = date_object.date()
        time_part = date_object.time()
        date_to_parse = f"{date_part.month}{date_part.day}{time_part.hour}{time_part.minute}{time_part.second}"
        return int(date_to_parse)

    def process_data(self, X : list[str], y: list[str]) -> [list[int], list[float]]:
        """
        Convert API response data into format accepted by KNeighborsRegressor.
        """
        parsed_X = []
        parsed_y = []
        for idx, label in enumerate(y):
            # Skip measurements without value
            if label is not None:
                # If the learning excludes days and only focuses on time
                if self.daily:
                    time_X = datetime.strptime(X[idx], "%Y-%m-%dT%H:%M:%SZ").time()
                    if self.granularity == 's':
                        parsed_X.append([
                            time_X.hour * 3600 + time_X.minute * 60 + time_X.second
                        ])
                    elif self.granularity == 'min':
                        parsed_X.append([
                            time_X.hour * 60 + time_X.minute * 60
                        ])
                    else:
                        parsed_X.append([time_X.hour])
                # If the learning includes days and time, convert to ordinal int numbers
                else:
                    parsed_X.append([self.date_to_ordinal(X[idx])])
                parsed_y.append(float(label))
        return parsed_X, parsed_y

    def fit(self, X, y, process_data = False) -> None:
        """
        Fit the regressor with provided data.
        """
        if process_data:
            X, y = self.process_data(X, y)
        self.model.fit(X, y)

    def predict(self, start_date: datetime, end_date: datetime, interval = timedelta(minutes=1)) -> [list[datetime], list[float]]:
        """
        Make a prediction using learned data.

        start_date: start date of prediction
        end_date: end date of prediction
        interval: how often should the prediction be performed between start_date and end_date
        """
        datetimes = []
        times = []
        current_date = start_date
        # Iterate from start_date to end_date in specified interval
        while current_date <= end_date:
            current_time = current_date.time()
            # Predict on values including days
            if not self.daily:
                times.append([self.date_to_ordinal(current_date)])
            # Predict on values excluding days, only focus on time
            elif self.granularity == 's':
                times.append([current_time.hour * 3600 + current_time.minute * 60 + current_time.second])
            elif self.granularity == 'min':
                times.append([current_time.hour * 3600 + current_time.minute])
            else:
                times.append([current_time.hour])
            datetimes.append(current_date)
            current_date += interval
        
        return datetimes, self.model.predict(times)
