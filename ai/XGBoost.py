import xgboost as xgb
import pandas as pd

from datetime import datetime, timedelta

class TimeSeriesXGBoost(xgb.XGBRegressor):
    """
    Time series regressor using XGBoost.
    Implemented with the help of this video: https://www.youtube.com/watch?v=vV12dGe_Fho

    test_size: size of the test dataset (<0, 1>)
    params: parameters for the XGBRegressor constructor
    """
    def __init__(
            self,
            test_size = 0.2,
            params: dict = {}
        ):
        self.test_size = test_size
        # Features provided to the regressor (X)
        self.feature_columns = ["hour", "minute", "second", "weekday", "month"]
        # The name of the values, which will take form of a column with this name in input dataset (y)
        self.value_column = ["value"]
        # Because fit of XGBoost depends on params, set them here (otherwise it will crash)
        self.params = params
        # XGboost is based on scikit-learn, so, again, we cannot use *args nor **kwargs here
        # 💀 bruh imagine not allowing to copy constructor signature
        # cringe
        super().__init__()
        # Instead of copying arguments from original constructor, pass them using set_params
        self.set_params(**params)


    def train_test_split(self, X: list[datetime], y: list[float], test_size: float = 0.2) -> [[list[datetime], list[float]], [list[datetime], list[float]]]:
        """
        Split input dataset (X, y) into a set of training dataset and test dataset.
        """
        test_split = [X[:int(len(X) * test_size)], y[:int(len(X) * test_size)]]
        train_split = [X[int(len(X) * test_size):], y[int(len(X) * test_size):]]
        return [train_split, test_split]

    def process_data(self, X: list[str], y: list[str]) -> [list[datetime], list[float]]:
        """
        Convert API response data into format accepted by XGBoost.
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

    def fit2(self, X: list[str] | list[datetime], y: list[str] | list[float], process_data: bool, *args, **kwargs) -> None:
        """
        Fit the regressor with provided data.
        """
        if process_data:
            X, y = self.process_data(X, y)

        data_split = self.train_test_split(X, y, self.test_size)
        train_features = self.create_features(data_split[0][0], data_split[0][1])
        test_features = self.create_features(data_split[1][0], data_split[1][1])

        X_train = train_features[self.feature_columns]
        y_train = train_features[self.value_column]

        X_test = test_features[self.feature_columns]
        y_test = test_features[self.value_column]

        self.fit(X=X_train, y=y_train, eval_set=[(X_train, y_train), (X_test, y_test)], *args, **kwargs)
        

    def predict2(self, start_date: datetime, end_date: datetime, interval: timedelta, *args, **kwargs) -> [list[datetime], list[float]]:
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

        return datetimes, self.predict(X=predict_features[self.feature_columns], *args, **kwargs).tolist()
