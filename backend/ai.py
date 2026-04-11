import dashscope
from dashscope import Generation
import pandas as pd
import json
import os

# You need to set DASHSCOPE_API_KEY environment variable
# dashscope.api_key = "your-api-key"

def preprocess_data_with_ai(data) -> dict:
    try:
        if isinstance(data, pd.DataFrame):
            df = data
        else:
            df = pd.read_csv(str(data))

        summary = f"The dataset contains {len(df)} records across {len(df.columns)} columns: {', '.join(df.columns)}."
        steps = [
            "Automatically detect and remove missing values.",
            "Normalize numerical columns for linear regression stability.",
            "Encode categorical variables to numeric for model compatibility."
        ]

        return {
            "summary": summary,
            "steps": steps,
            "preview": df.head(10).to_dict(orient='records')
        }
    except Exception as e:
        return {"error": str(e)}

def perform_ai_cleaning(df: pd.DataFrame) -> pd.DataFrame:
    # 1. Handle missing values
    df = df.dropna()
    # 2. Normalize numerical features
    numeric_cols = df.select_dtypes(include=['number']).columns
    if not numeric_cols.empty:
        df[numeric_cols] = (df[numeric_cols] - df[numeric_cols].mean()) / df[numeric_cols].std()
    # 3. Label encoding for objects
    for col in df.select_dtypes(include=['object']).columns:
        df[col] = df[col].astype('category').cat.codes
    return df
