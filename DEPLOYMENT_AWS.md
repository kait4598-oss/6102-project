# AWS 部署（Amplify + App Runner）

本文档按“一个 GitHub 仓库（前后端同仓）”来写。

## 1) 需要上传到 GitHub 的内容

把整个项目根目录作为一个仓库上传即可（推荐）：

- `backend/`
- `frontend/`
- `Dockerfile`（根目录，给 App Runner 用）
- `amplify.yml`（根目录，给 Amplify 用）
- `README.md`、`DEPLOYMENT_AWS.md` 等文档

不要上传：

- 任何密钥（例如 `DASHSCOPE_API_KEY`、数据库密码、JWT secret、AWS Key）
- `.env` 文件
- `frontend/node_modules/`、`frontend/dist/`
- `backend/app.db`、`backend/static/`（本地模拟数据）

## 2) Amplify 部署前端（从 GitHub 自动构建）

1. 打开 AWS 控制台 → Amplify
2. New app → Host web app
3. 选择 GitHub 并授权 → 选择你的仓库与分支（例如 `main`）
4. Build settings：Amplify 会自动识别根目录的 `amplify.yml`（本项目已提供）
5. 保存并部署，完成后你会得到一个前端访问域名

前端需要配置的环境变量（可选）：

- `VITE_API_BASE_URL`：你的后端 API 地址（例如 App Runner 的 URL）

## 3) App Runner 部署后端（从 GitHub 构建 Docker）

1. 打开 AWS 控制台 → App Runner
2. Create service
3. Source 选择：Source code repository
4. 连接 GitHub → 选择同一个仓库与分支
5. 选择配置：使用根目录 `Dockerfile` 构建容器
6. Service settings：
   - Port：`8000`（本项目容器默认监听 `8000`，也支持 `PORT` 环境变量）
7. Environment variables（至少建议配置）：
   - `DASHSCOPE_API_KEY`：通义千问 API Key（如不配置，AI 仍会走模拟逻辑，但建议配置）

创建完成后，你会得到一个后端 URL，例如：

- `https://xxxxxx.awsapprunner.com`

API 测试：

- `GET /` 应返回欢迎信息

## 4) 让前端指向后端

把前端的 API Base URL 指向 App Runner 的 URL。常用方式是：

- 在 Amplify 控制台给前端设置环境变量 `VITE_API_BASE_URL`，并触发重建

## 5) 费用控制建议（很重要）

- 演示完立刻停止计费：
  - App Runner：删除 Service
  - Amplify：删除 App（或至少移除 Hosting）
- 只把代码放 GitHub 不会产生 AWS 费用；一旦创建并运行 AWS 服务就会计费。

