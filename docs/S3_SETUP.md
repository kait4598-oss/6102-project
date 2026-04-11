# S3 使用与项目接入

本项目在未配置 S3 时会把上传文件保存到后端容器的本地目录；配置后会把用户上传的原始数据保存到 S3，并在数据库里记录 `s3://bucket/key` 路径。

## 1) 创建 S3 Bucket

AWS 控制台 → S3 → Create bucket：

- Bucket name：全局唯一，例如 `6102-project-data-<你的名字>`
- Region：与 EC2 同区域（例如 `us-east-1`）
- Block Public Access：保持开启（推荐）

## 2) 给 EC2 授权访问 S3（推荐用 IAM Role，不要用 Access Key）

1. IAM → Roles → Create role
2. Trusted entity：`AWS service` → `EC2`
3. Permissions：添加一个最小权限策略（把 bucket 名替换成你的）

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:ListBucket"],
      "Resource": ["arn:aws:s3:::YOUR_BUCKET_NAME"]
    },
    {
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"],
      "Resource": ["arn:aws:s3:::YOUR_BUCKET_NAME/*"]
    }
  ]
}
```

4. 回到 EC2 控制台 → 你的实例 → Actions → Security → Modify IAM role
5. 选择你刚创建的 Role

## 3) 在 EC2 上配置项目环境变量

在项目根目录 `.env` 添加：

```bash
S3_BUCKET_NAME=YOUR_BUCKET_NAME
AWS_REGION=us-east-1
```

然后重启：

```bash
cd ~/6102-project
docker compose down
docker compose up -d --build
```

## 4) 验证是否真的写入 S3

1. 在网页上传一个 CSV/XLSX
2. S3 控制台打开 Bucket，查看是否出现 `uploads/user-*/...` 文件

如果上传失败：

```bash
docker compose logs -f --tail=200 backend
```

常见原因：

- `AccessDenied`：EC2 没有挂可访问 S3 的 Role，或 Role 不包含对该 bucket 的 `PutObject` 权限
- `NoCredentialsError`：实验账号环境无法创建/绑定 IAM Role，后端无法拿到 AWS 凭证（这时只能回退本地存储或由老师提供 Role）
