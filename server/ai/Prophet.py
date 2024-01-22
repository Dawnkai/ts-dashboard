import pandas as pd

from datetime import datetime, timedelta
from prophet import Prophet

class TimeSeriesProphet(Prophet):
    """
    Time series regressor using Prophet.
    Implemented with the help of the official docs: https://facebook.github.io/prophet/docs/quick_start.html
    """
    def __init__(
            self,
            *args,
            **kwargs
        ):
        super().__init__(*args, **kwargs)

    def process_data(self, X: list[str], y: list[str]) -> pd.DataFrame:
        """
        Convert API response data into format accepted by Prophet.
        """
        parsed_X = []
        parsed_y = []
        for idx, label in enumerate(y):
            # Skip measurements without value
            if label is not None:
                parsed_X.append(datetime.strptime(X[idx], "%Y-%m-%dT%H:%M:%SZ").strftime("%Y-%m-%d %H:%M:%S"))
                parsed_y.append(float(label))
        return pd.DataFrame({
            "ds": parsed_X,
            "y": parsed_y
        })

    def initial_processing(self, json_data: list[dict], device_id: int) -> [list[str], list[str]]:
        X = []
        y = []
        for entry in json_data:
            X.append(entry['created_at'])
            y.append(entry[f'field{device_id}'])
        return X, y

    def fit2(self, X: list[str] | list[datetime], y: list[str] | list[float], process_data: bool, *args, **kwargs) -> None:
        """
        Fit the regressor with provided data.

        process_data: should the X and y be processed to fit Prophet model.
        """
        if process_data:
            df = self.process_data(X, y)

        self.fit(df=df, *args, **kwargs)
        
    def extract_result(self, result) -> list[list, list]:
        X_result = result[['ds']].values.astype('datetime64[us]').tolist()
        y_result = result[['yhat']].values.tolist()
        X_result = [item for row in X_result for item in row]
        y_result = [item for row in y_result for item in row]
        return [X_result, y_result]

    def predict2(self, start_date: datetime, end_date: datetime, interval: timedelta, *args, **kwargs) -> pd.DataFrame:
        """
        Make a prediction using learned data.

        end_date: end date of prediction
        interval: how often should the prediction be performed between start_date and end_date
        """
        num_datetimes = 0
        current_date = datetime.now()
        # Iterate from start_date to end_date in specified interval
        while current_date <= end_date:
            current_date += interval
            num_datetimes += 1
        # Create an array of future dates, to create predictions
        future = self.make_future_dataframe(periods=num_datetimes, freq=interval)

        return self.predict(df=future, *args, **kwargs)
