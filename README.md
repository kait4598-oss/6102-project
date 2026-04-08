# AI Data Analytics Web Project

这是一个包含前后端的 AI 数据分析小项目。

## 项目结构
- `backend/`: 使用 FastAPI 编写的后端 API
- `frontend/`: 使用 React + Vite + Tailwind CSS 编写的前端页面

## 功能特点
1. **多角色登录**: 支持用户和管理员登录。
2. **用户功能**:
   - 上传 CSV 数据文件。
   - 后端接入模拟 AI (Qwen) 进行数据预处理分析。
   - 前端展示三个窗口：
     - 数据热力图 (Heatmap)
     - 基础线性回归模型训练准确率 (R²)
     - 预处理后的数据预览
3. **管理员功能**:
   - 查看所有用户信息（包含账号和加密后的密码）。
   - 查看所有用户上传的数据及其模型准确率。
   - 删除用户的热力图文件（管理存储）。

## 运行步骤

### 后端 (Backend)
1. 进入 `backend` 目录。
2. 安装依赖: `pip install -r requirements.txt`
3. 在项目根目录启动服务: `uvicorn backend.main:app --reload`
4. 默认 API 地址: `http://localhost:8000`

### 前端 (Frontend)
1. 进入 `frontend` 目录。
2. 安装依赖: `npm install`
3. 启动开发服务器: `npm run dev`
4. 默认访问地址: `http://localhost:5173`

## 默认账号
- **管理员**: 用户名 `admin`, 密码 `admin123`
- **普通用户**: 可通过页面注册

## AWS 部署

使用 Amplify（前端）+ App Runner（后端）的部署说明见 [DEPLOYMENT_AWS.md](file:///e:/school/2-5/project/6102/DEPLOYMENT_AWS.md)。

如果你的 AWS 环境无法使用 App Runner 的 GitHub 连接（常见于 Academy/Lab），可使用 EC2 部署，见 [DEPLOYMENT_EC2.md](file:///e:/school/2-5/project/6102/DEPLOYMENT_EC2.md)。

## 注意事项
- 本项目中的 AI 预处理使用了模拟逻辑，若要接入真实的千问 AI，请在 `backend/ai.py` 中填入您的 `DASHSCOPE_API_KEY`。
- 数据分析假定 CSV 文件的最后一列为预测目标值。
