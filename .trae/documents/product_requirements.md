# AI-Driven Automated Data Analysis Cloud Platform

## 1. Project Background & Goal
This project aims to develop a cloud-based full-stack application to simplify data preprocessing and visualization.
- **Core Goal:** Use Qwen AI for intelligent data cleaning and linear regression for prediction.
- **Course Compliance:** Option 1: Application Deployment (Containerization, CRUD, Cloud Resource Management).

## 2. Technology Stack
- **Frontend:** React.js + Tailwind CSS + ECharts.
- **Backend:** Python FastAPI.
- **Database:** AWS RDS (PostgreSQL).
- **Storage:** AWS S3.
- **AI/ML Engine:** Qwen API + Scikit-learn.
- **Deployment:** Docker + AWS App Runner / EC2.

## 3. Core Features
- **User Authentication:** Login with role-based access control (User/Admin).
- **Data Upload:** Upload CSV/Excel files to S3 and trigger AI processing.
- **Data Analysis:** 
  - AI-preprocessed data summary.
  - Correlation matrix heatmap (ECharts).
  - Linear regression results (R² score, prediction curve).
- **Admin Features:** 
  - View all users and their status.
  - Delete user data and reset visualizations.

## 4. UI Design
- **Dashboard:** Three-window responsive layout:
  - Window A: Data preprocessing results (Table).
  - Window B: Heatmap visualization (ECharts).
  - Window C: Model prediction results (Line Chart + Metrics).
