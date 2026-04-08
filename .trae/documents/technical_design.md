# Technical Design Documentation

## 1. System Architecture
- **Frontend:** Single Page Application (SPA) using React.
- **Backend:** RESTful API service using FastAPI.
- **Database:** Relational database (PostgreSQL) for user data and metadata.
- **Storage:** Object storage (S3) for raw and processed datasets.

## 2. API Specification
- `POST /auth/login`: Authentication with role returning (`user` or `admin`).
- `POST /data/upload`: Upload file to storage and initiate processing.
- `GET /data/analysis/{id}`: Fetch aggregated analysis results.
- `GET /admin/users`: List all users (Admin only).
- `DELETE /admin/data/{id}`: Remove dataset and associated results (Admin only).

## 3. Data Flow
1. User uploads CSV file.
2. Backend uploads file to S3.
3. AI Engine (Qwen) analyzes data and suggests/performs cleaning.
4. Scikit-learn trains a linear regression model.
5. Heatmap and model metrics are generated.
6. Frontend retrieves all results via a single analysis endpoint.

## 4. Database Schema (Logical)
- **Users:** `id`, `username`, `hashed_password`, `role`.
- **UserData:** `id`, `user_id`, `filename`, `s3_url`, `analysis_results` (JSON).
