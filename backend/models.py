from sqlmodel import SQLModel, Field, Relationship
from typing import List, Optional
from datetime import datetime
from sqlalchemy import Column, Text

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(unique=True, index=True)
    hashed_password: str
    role: str = Field(default="user") # "user" or "admin"
    
    data_files: List["UserData"] = Relationship(back_populates="user")

class UserData(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    filename: str
    original_data_path: str = Field(sa_column=Column(Text, nullable=False))
    processed_data_path: Optional[str] = Field(default=None, sa_column=Column(Text, nullable=True))
    heatmap_path: Optional[str] = Field(default=None, sa_column=Column(Text, nullable=True))
    model_accuracy: Optional[float] = None
    analysis_results: Optional[str] = Field(default=None, sa_column=Column(Text))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    user: User = Relationship(back_populates="data_files")
