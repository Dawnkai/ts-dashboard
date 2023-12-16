import numpy as np

from datetime import datetime, timedelta
from sklearn.neighbors import KNeighborsRegressor
from typing import Callable

class TimeSeriesKNN(KNeighborsRegressor):
    """
    K-Neighbors Classifier for Time Series forecasting.

    daily: should the model learn excluding days, including only time (True) or including days (False)
    granulaity: should the predictions be split by seconds (s), minutes (min) or hours (h)
    """
    def __init__(
            self,
            daily: bool = False,
            granularity: str = "min",
            n_neighbors: int = 5,
            weights: str = "uniform",
            algorithm: str = "auto",
            leaf_size: int = 30,
            p: float = 2,
            metric: str | Callable = 'minkowski',
            metric_params: dict = None,
            n_jobs: int = None
        ):
        self.daily = daily
        self.granularity = granularity
        # Unfortunately, KNeighborsRegressor does not support inheritance, so we have to copy entire
        # constructor parameters signature.
        # More about it here: https://github.com/scikit-learn/scikit-learn/issues/13555
        super().__init__(
            n_neighbors=n_neighbors,
            weights=weights,
            algorithm=algorithm,
            leaf_size=leaf_size,
            p=p,
            metric=metric,
            metric_params=metric_params,
            n_jobs=n_jobs
        )
    
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

    def fit2(self, X: list[str] | list[int], y: list[str] | list[float], process_data: bool, *args, **kwargs) -> None:
        """
        Fit the regressor with provided data.
        """
        if process_data:
            X, y = self.process_data(X, y)
        self.fit(X=X, y=y, *args, **kwargs)

    def predict2(self, start_date: datetime, end_date: datetime, interval: timedelta) -> [list[datetime], list[float]]:
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
        
        return datetimes, self.predict(times)
