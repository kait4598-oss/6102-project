# Aurora / RDS（PostgreSQL）连接指引

本项目后端使用 SQLModel（SQLAlchemy）连接数据库。默认使用 SQLite；如果设置 `DATABASE_URL`，则会连接到你提供的 RDS/Aurora。

> Aurora 是 Amazon RDS 家族的一种引擎（例如 Aurora PostgreSQL）。老师说“用 Aurora 和 RDS”，通常理解为“用 RDS 托管的 Aurora”。

## 1) 在 AWS 上创建数据库（推荐 Aurora PostgreSQL；也支持 MySQL）

1. AWS 控制台 → RDS → Create database
2. Engine：
   - 推荐：`Amazon Aurora` → `Aurora PostgreSQL-Compatible`
   - 如果你恢复/已有的是 MySQL：`MySQL Community` 或 `Aurora MySQL-Compatible`
3. Templates：Dev/Test（按课程要求选择）
4. Credentials：设置主用户名/密码（保存好）
5. Connectivity：
   - 选择与你的 EC2 在同一个 VPC
   - Public access：按课程要求（建议 `No`，通过同 VPC 访问）
   - VPC security group：创建/选择一个 DB 安全组

## 2) 安全组规则（最关键）

目标：允许“运行后端的机器”（EC2 或 App Runner 出站）访问数据库端口。

- DB 安全组入站：
  - Type：PostgreSQL
  - Port：`5432`
  - Source：选择你的 EC2 的安全组（推荐），不要直接开放 0.0.0.0/0

## 3) 获取连接信息

RDS → Databases → 选择你的 Aurora Cluster/Instance：

- Endpoint（主写入端点）
- Port（通常 `5432`）
- DB name（你创建的数据库名）
- Username / Password

## 4) 在服务器上配置项目 `.env`

在 EC2 的项目根目录创建 `.env`（不要提交到 GitHub）：

PostgreSQL（Aurora/RDS）示例：

```bash
cat > .env << 'EOF'
DASHSCOPE_API_KEY=你的通义千问Key
SECRET_KEY=请换成随机长字符串
DATABASE_URL=postgresql+psycopg2://dbuser:dbpassword@your-aurora-endpoint:5432/yourdbname?sslmode=require
SQL_ECHO=false
EOF
```

MySQL（RDS/Aurora MySQL）示例：

```bash
cat > .env << 'EOF'
DASHSCOPE_API_KEY=你的通义千问Key
SECRET_KEY=请换成随机长字符串
DATABASE_URL=mysql+pymysql://dbuser:dbpassword@your-mysql-endpoint:3306/yourdbname
SQL_ECHO=false
EOF
```

然后重启服务：

```bash
docker compose down
docker compose up -d --build
```

## 5) 验证连接是否成功

查看后端日志：

```bash
docker compose logs -f --tail=200 backend
```

如果能正常启动且不再创建 SQLite 的 `app.db`（或日志/行为符合预期），说明已连上 RDS/Aurora。
