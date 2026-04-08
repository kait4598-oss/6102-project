import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, r2_score
import os

# Create a folder for static files
STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")
HEATMAP_DIR = os.path.join(STATIC_DIR, "heatmaps")
os.makedirs(HEATMAP_DIR, exist_ok=True)

def generate_heatmap_data(df: pd.DataFrame) -> dict:
    """
    Generates a correlation matrix data for ECharts.
    """
    numeric_df = df.select_dtypes(include=['number'])
    if numeric_df.empty:
        return {"columns": [], "data": []}
    
    corr_matrix = numeric_df.corr().round(2)
    columns = corr_matrix.columns.tolist()
    data = []
    for i, col1 in enumerate(columns):
        for j, col2 in enumerate(columns):
            data.append([i, j, float(corr_matrix.loc[col1, col2])])
    
    return {"columns": columns, "data": data}

def train_linear_model_results(df: pd.DataFrame):
    """
    Trains a basic linear regression model and returns data for plotting.
    """
    try:
        numeric_df = df.select_dtypes(include=['number'])
        if numeric_df.shape[1] < 2:
            return None, "Need at least two numeric columns (features and target)"
        
        X = numeric_df.iloc[:, :-1]
        y = numeric_df.iloc[:, -1]
        
        model = LinearRegression()
        model.fit(X, y)
        
        accuracy = r2_score(y, model.predict(X))
        
        # Prediction line (for the first feature if multiple)
        feature_name = X.columns[0]
        x_vals = X.iloc[:, 0].tolist()
        y_vals = y.tolist()
        
        return {
            "accuracy": float(accuracy),
            "feature": feature_name,
            "target": y.name,
            "x": x_vals,
            "y": y_vals,
            "r2": float(accuracy)
        }, None
    except Exception as e:
        return None, str(e)
