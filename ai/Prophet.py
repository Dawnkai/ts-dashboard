import pandas as pd

from prophet import Prophet

import pandas as pd

from datetime import datetime, timedelta

class TimeSeriesProphet:
    """
    Time series regressor using Prophet.
    Implemented with the help of the official docs: https://facebook.github.io/prophet/docs/quick_start.html

    growth: trend, can be 'linear', 'logistic' or 'flat'
    n_changepoints: number of potential changepoints to include
    """
    def __init__(
            self,
            growth = 'linear',
            n_changepoints = 25
        ):
        self.model = None
        self.growth = growth
        self.n_changepoints = n_changepoints

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

    def fit(self, X: list[str] | list[datetime], y: list[str] | list[float], process_data = False) -> None:
        """
        Fit the regressor with provided data.
        """
        if process_data:
            df = self.process_data(X, y)

        self.model = Prophet(changepoint_prior_scale=0.1, daily_seasonality=True, growth=self.growth, n_changepoints=self.n_changepoints)
        self.model.fit(df)
        

    def predict(self, end_date: datetime, interval = timedelta(minutes=1)) -> pd.DataFrame:
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
        future = self.model.make_future_dataframe(periods=num_datetimes, freq=interval)

        return self.model.predict(future)
