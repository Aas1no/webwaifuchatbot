# PersonaChat 部署更新说明

这套脚本适合你现在的情况：本地是 Windows，服务器是 Linux，通过 SSH 上传并更新。

## 第一次配置

在本地复制配置文件：

```powershell
Copy-Item .\deploy.config.example.ps1 .\deploy.config.ps1
notepad .\deploy.config.ps1
```

把里面的服务器地址、用户名、端口、部署目录改成你的真实信息。`deploy.config.ps1` 不会被提交，因为里面可能有服务器信息。

服务器建议准备一个独立目录：

```bash
sudo mkdir -p /opt/personachat/shared/data
sudo chown -R "$USER":"$USER" /opt/personachat
npm install -g pm2
```

如果你想把 API Key 放在服务器环境变量里，可以创建：

```bash
nano /opt/personachat/shared/.env
```

示例内容：

```bash
DEEPSEEK_API_KEY=你的_key
PORT=8787
PERSONACHAT_DATA_DIR=/opt/personachat/shared/data
```

## 每次更新

本地改完功能并测试后，运行：

```powershell
.\deploy.ps1
```

脚本会自动完成这些事：

- 打包当前项目源码到 `dist/`
- 上传压缩包到服务器 `/tmp`
- 解压到服务器的新版本目录
- 保留账号、会话等数据在 `shared/data`
- 切换 `/opt/personachat/current` 到新版本
- 用 PM2 重启服务
- 请求 `/api/health` 检查是否更新成功

## 服务器目录结构

默认会变成这样：

```text
/opt/personachat/
  current -> releases/某个版本
  releases/
  shared/
    data/
    .env
```

`shared/data` 是正式数据目录，不要删除。以后每次更新只替换代码，不会覆盖用户数据。

## 如果你使用 systemd

把 `deploy.config.ps1` 里的配置改成：

```powershell
$RestartMode = "systemd"
$SystemdService = "personachat"
```

确保你的 systemd 服务工作目录指向：

```text
/opt/personachat/current
```

## 如果暂时不想自动重启

把配置改成：

```powershell
$RestartMode = "none"
```

脚本只负责上传和切换文件，你再手动登录服务器重启。
