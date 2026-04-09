# 使用 EC2 运行项目（Docker Compose 方式）

该方式不依赖 App Runner 的 GitHub 连接器，适合 AWS Academy/Lab 环境。

## 1) 创建 EC2

- 系统：Ubuntu 22.04 LTS（推荐）
- 规格：尽量选 Free Tier（如可用）
- 存储：8–16GB 即可
- 安全组入站规则（至少）：
  - SSH：TCP `22`（来源建议选你的 IP）
  - HTTP：TCP `80`（来源 `0.0.0.0/0`）

强烈建议：根卷 EBS 至少 30GB（8GB 构建时很容易出现 `no space left on device`）。

## 2) 连接 EC2 并安装 Docker

SSH 进入后执行：

```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo \"$VERSION_CODENAME\") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker $USER
newgrp docker
```

验证：

```bash
docker --version
docker compose version
```

## 3) 拉取 GitHub 代码

```bash
sudo apt-get install -y git
git clone https://github.com/kait4598-oss/6102-project.git
cd 6102-project
```

## 4) 配置环境变量（不要写进仓库）

在 EC2 的项目根目录创建 `.env`（只在服务器上保存，不要提交到 GitHub）：

```bash
nano .env
```

内容示例：

```bash
DASHSCOPE_API_KEY=你的通义千问Key
```

可选（推荐）：增加 2GB Swap，避免前端 build 内存不够卡死：

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
free -h
```

## 5) 启动（前后端一起）

```bash
docker compose up -d --build
```

查看状态：

```bash
docker compose ps
docker compose logs -f --tail=200
```

## 6) 访问

- 在 EC2 控制台找到实例的 Public IPv4
- 浏览器打开：`http://<你的EC2公网IP>/`

说明：

- 前端由 Nginx 在 `80` 端口提供
- 前端请求会走同域名的 `/api/*`，再由 Nginx 反代到后端 `8000`

## 7) 停止与省钱

- 停止服务：

```bash
docker compose down
```

- 最省钱：演示结束后在 EC2 控制台 **Stop/Terminate** 实例（Terminate 会删除实例）。

## 附：一键运行清单

如果你想复制粘贴一套完整命令，请看根目录 `RUN_EC2.txt`。
