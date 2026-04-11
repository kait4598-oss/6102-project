from fastapi import FastAPI, Depends, HTTPException, status, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.staticfiles import StaticFiles
from sqlmodel import Session, select
from typing import List, Optional
import os
import shutil
import pandas as pd
import json
from pydantic import BaseModel
import io
import uuid
from sqlalchemy import text
from json import JSONDecodeError
from .models import User, UserData
from .database import get_session, init_db, engine
from .auth import (
    get_password_hash, 
    verify_password, 
    create_access_token, 
    get_current_user, 
    get_current_admin,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from .ai import preprocess_data_with_ai, perform_ai_cleaning
from .ml import generate_heatmap_data, train_linear_model_results
from datetime import timedelta
from .s3_utils import get_s3_bucket_name, get_s3_client, make_object_key, to_s3_url, parse_s3_url

app = FastAPI(title="AI Data Analytics Project")


class RegisterRequest(BaseModel):
    username: str
    password: str

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Local storage fallback (when S3_BUCKET_NAME not set)
STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")
S3_SIM_DIR = os.path.join(STATIC_DIR, "s3_storage")
os.makedirs(S3_SIM_DIR, exist_ok=True)

@app.on_event("startup")
def on_startup():
    init_db()

    try:
        if engine.dialect.name == "mysql":
            with engine.begin() as conn:
                conn.execute(text("ALTER TABLE userdata MODIFY COLUMN analysis_results LONGTEXT"))
                conn.execute(text("ALTER TABLE userdata MODIFY COLUMN original_data_path TEXT"))
                conn.execute(text("ALTER TABLE userdata MODIFY COLUMN processed_data_path TEXT"))
                conn.execute(text("ALTER TABLE userdata MODIFY COLUMN heatmap_path TEXT"))
    except Exception:
        pass

    # Create an admin user if not exists
    with Session(engine) as session:
        statement = select(User).where(User.username == "admin")
        admin = session.exec(statement).first()
        if not admin:
            hashed_password = get_password_hash("admin123")
            admin = User(username="admin", hashed_password=hashed_password, role="admin")
            session.add(admin)
            session.commit()

@app.get("/")
def read_root():
    return {"message": "Welcome to AI Data Analytics API"}

@app.post("/auth/login")
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    session: Session = Depends(get_session)
):
    statement = select(User).where(User.username == form_data.username)
    user = session.exec(statement).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {
        "access_token": access_token, 
        "token_type": "bearer", 
        "role": user.role,
        "username": user.username
    }


@app.post("/auth/register")
async def register_user(payload: RegisterRequest, session: Session = Depends(get_session)):
    existing = session.exec(select(User).where(User.username == payload.username)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")

    user = User(
        username=payload.username,
        hashed_password=get_password_hash(payload.password),
        role="user",
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return {"message": "User registered successfully", "username": user.username}

@app.post("/data/upload")
async def upload_file(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    if not (file.filename.endswith(".csv") or file.filename.endswith(".xlsx")):
        raise HTTPException(status_code=400, detail="Only CSV or Excel files are supported")

    try:
        content = await file.read()
        if not content:
            raise HTTPException(status_code=400, detail="Empty file")

        if file.filename.endswith(".csv"):
            df = pd.read_csv(io.BytesIO(content))
        else:
            df = pd.read_excel(io.BytesIO(content))
    except HTTPException:
        raise
    except Exception as e:
        msg = str(e)
        raise HTTPException(status_code=400, detail=f"Failed to parse file: {msg[:200]}")

    bucket = get_s3_bucket_name()
    stored_path = None
    if bucket:
        try:
            client = get_s3_client()
            key = make_object_key(current_user.id, file.filename)
            client.put_object(Bucket=bucket, Key=key, Body=content)
            stored_path = to_s3_url(bucket, key)
        except Exception as e:
            msg = str(e)
            raise HTTPException(status_code=500, detail=f"S3 upload failed: {msg[:200]}")
    else:
        local_path = os.path.join(S3_SIM_DIR, f"{current_user.id}_{uuid.uuid4().hex}_{file.filename}")
        with open(local_path, "wb") as buffer:
            buffer.write(content)
        stored_path = local_path
    
    # AI Preprocessing & ML Analysis
    try:
        ai_results = preprocess_data_with_ai(df)
        cleaned_df = perform_ai_cleaning(df)

        heatmap_data = generate_heatmap_data(cleaned_df)
        ml_results, error = train_linear_model_results(cleaned_df)
    except Exception as e:
        msg = str(e)
        raise HTTPException(status_code=500, detail=f"Analysis failed: {msg[:200]}")
    
    # Aggregate analysis results
    analysis_results = {
        "ai": ai_results,
        "heatmap": heatmap_data,
        "ml": ml_results,
        "error": error
    }
    
    # Store in database
    try:
        user_data = UserData(
            user_id=current_user.id,
            filename=file.filename,
            original_data_path=stored_path,
            model_accuracy=ml_results["accuracy"] if ml_results else 0.0,
            analysis_results=json.dumps(analysis_results)
        )
        session.add(user_data)
        session.commit()
        session.refresh(user_data)
    except Exception as e:
        msg = str(e)
        raise HTTPException(status_code=500, detail=f"Failed to save results: {msg[:200]}")
    
    return {"id": user_data.id, "message": "File uploaded and processed successfully"}

@app.get("/data/analysis/{data_id}")
async def get_data_analysis(
    data_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    user_data = session.get(UserData, data_id)
    if not user_data or (user_data.user_id != current_user.id and current_user.role != "admin"):
        raise HTTPException(status_code=404, detail="Data not found")
    
    if not user_data.analysis_results:
        return {}

    try:
        return json.loads(user_data.analysis_results)
    except JSONDecodeError:
        return {"error": "Invalid analysis_results"}

@app.get("/my-data")
async def get_my_data(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    statement = select(UserData).where(UserData.user_id == current_user.id)
    return session.exec(statement).all()

# --- Admin Endpoints ---

@app.get("/admin/users")
async def get_all_users(
    admin: User = Depends(get_current_admin),
    session: Session = Depends(get_session)
):
    statement = select(User)
    return session.exec(statement).all()

@app.get("/admin/data")
async def get_all_data(
    admin: User = Depends(get_current_admin),
    session: Session = Depends(get_session)
):
    statement = select(UserData)
    return session.exec(statement).all()

@app.delete("/admin/data/{data_id}")
async def delete_user_data(
    data_id: int,
    admin: User = Depends(get_current_admin),
    session: Session = Depends(get_session)
):
    user_data = session.get(UserData, data_id)
    if not user_data:
        raise HTTPException(status_code=404, detail="Data not found")
    
    s3_loc = parse_s3_url(user_data.original_data_path)
    if s3_loc:
        client = get_s3_client()
        client.delete_object(Bucket=s3_loc.bucket, Key=s3_loc.key)
    else:
        if os.path.exists(user_data.original_data_path):
            os.remove(user_data.original_data_path)
    
    session.delete(user_data)
    session.commit()
    return {"message": "Data deleted successfully"}
