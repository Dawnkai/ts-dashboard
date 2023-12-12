# AI models

This folder contains AI models used for time series forecasting.

You can find here an example for every model and model wrappers that allow for handling TTN API response.

Before using the models don't forget to install required libraries:
```bash
$ pip install -r ai_requirements.txt
```

Models:
* `KNN.py` - time series wrapper for `scikit-learn`'s `KNeighborsRegressor`
* `XGBoost.py` - time series wrapper for `xgboost` model

Examples:
* `KNN_example.py` - example script for `KNN.py`, will display results in matplotlib's plot
* `XGBoost_example.py` - example script for `XGBoost.py`, will display results in matplotlib's plot

Every example script has a set of configurable parameters that will impact its performance. They are described in the wrapper constructor.

Keep in mind changing them for learning models requires retraining the model, which may take some time.
