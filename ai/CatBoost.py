from catboost import CatBoostRegressor
from datetime import datetime, timedelta

import pandas as pd

class TimeSeriesCatBoost:
    """
    Time series regressor using CatBoost. It works similar to XGBoost, but creates symmetrical trees.
    Implemented with the help of this video: https://www.youtube.com/watch?v=yeU9uv7fb28

    num_estimators: number of estimators in regressor
    early_stopping_rounds: if after this value the accuracy of the model does not improve, stop training
    learning_rate: learning rate of the model
    """
    def __init__(
            self,
            num_estimators = 1000,
            early_stopping_rounds = 50,
            learning_rate = 0.001
        ):
        self.model = None
        self.num_estimators = num_estimators
        self.early_stopping_rounds = early_stopping_rounds
        self.learning_rate = learning_rate
        # Features provided to the regressor (X)
        self.feature_columns = ["hour", "minute", "second", "weekday", "month"]
        # The name of the values, which will take form of a column with this name in input dataset (y)
        self.value_column = ["value"]

    def process_data(self, X: list[str], y: list[str]) -> [list[datetime], list[float]]:
        """
        Convert API response data into format accepted by CatBoost.
        """
        parsed_X = []
        parsed_y = []
        for idx, label in enumerate(y):
            # Skip measurements without value
            if label is not None:
                parsed_X.append(datetime.strptime(X[idx], "%Y-%m-%dT%H:%M:%SZ"))
                parsed_y.append(float(label))
        return parsed_X, parsed_y

    def create_features(self, X: list[datetime], y: list[float]) -> pd.DataFrame:
        """
        Get features that will be fed to the model, along with y values.
        Result will be converted into pandas DataFrame.
        """
        # Notice that variables correspond to self.feature_columns
        hours = [ val.time().hour for val in X ]
        minutes = [ val.time().minute for val in X ]
        seconds = [ val.time().second for val in X ]
        weekdays = [ val.weekday() for val in X ]
        months = [ val.month for val in X ]

        return pd.DataFrame({
            # y
            "value": y,
            # X
            "hour": hours,
            "minute": minutes,
            "second": seconds,
            "weekday": weekdays,
            "month": months
        })

    def fit(self, X: list[str] | list[datetime], y: list[str] | list[float], process_data = False) -> None:
        """
        Fit the regressor with provided data.
        """
        if process_data:
            X, y = self.process_data(X, y)

        features = self.create_features(X, y)

        X_train = features[self.feature_columns]
        y_train = features[self.value_column]

        self.model = CatBoostRegressor(
            learning_rate=self.learning_rate,
            n_estimators=self.num_estimators,
            early_stopping_rounds=self.early_stopping_rounds,
        )

        self.model.fit(X_train, y_train)
        

    def predict(self, start_date: datetime, end_date: datetime, interval = timedelta(minutes=1)) -> [list[datetime], list[float]]:
        """
        Make a prediction using learned data.
        start_date: start date of prediction
        end_date: end date of prediction
        interval: how often should the prediction be performed between start_date and end_date
        """
        datetimes = []
        values = []
        current_date = start_date
        # Iterate from start_date to end_date in specified interval
        while current_date <= end_date:
            datetimes.append(current_date)
            values.append(0)
            current_date += interval
        
        predict_features = self.create_features(datetimes, values)

        return datetimes, self.model.predict(predict_features[self.feature_columns]).tolist()