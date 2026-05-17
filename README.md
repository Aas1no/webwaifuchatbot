# PersonaChat MVP

一个轻量 AI 自定义角色聊天网页骨架。当前版本是零依赖 Node 版，前端页面由本地服务提供，后端代理 OpenAI-compatible 聊天接口，并支持账号注册、登录和服务端状态保存。

当前部署标识：`0.2.0-login-gated`。部署成功后，页面左侧品牌下方会显示“登录部署版 v0.2.0”，并且 `/api/health` 会返回 `"version":"0.2.0-login-gated"`。

## 运行

```powershell
.\start-server.ps1
```

然后打开 `http://localhost:8787`。

首次进入需要先注册或登录账号。登录后才能使用聊天、设置、角色编辑和头像上传；配置、角色、头像和对话会自动保存到服务器。

在右侧“生成设置”里填写：

- API 供应商：DeepSeek
- API Key：你的 DeepSeek API Key
- 模型：`deepseek-v4-flash` 或 `deepseek-v4-pro`

应用会按供应商自动识别接口来源。只有选择“自定义兼容接口”时才需要手动填写 API 地址。API Key 会保存到当前账号数据中并随账号同步，不会写入项目源码；请妥善保护服务器数据目录。

可选环境变量：

- `PORT`：服务端口，默认 `8787`
- `OPENAI_BASE_URL`：OpenAI-compatible API 地址，默认 `https://api.openai.com/v1`
- `OPENAI_API_KEY`：OpenAI-compatible API Key；也可以在网页里填写
- `DEEPSEEK_API_KEY`：DeepSeek API Key；也可以在网页里填写
- `QWEN_API_KEY`：通义千问 API Key；也可以在网页里填写
- `LOCAL_PROXY_BASE_URL`：本地代理地址，默认 `http://localhost:11434/v1`
- `LOCAL_PROXY_API_KEY`：本地代理需要鉴权时使用
- `PERSONACHAT_DATA_DIR`：账号、会话和配置保存目录，默认 `runtime/data`

账号数据默认保存在项目下的 `runtime/data`，已加入 `.gitignore`。如果旧目录 `.personachat-data` 已经存在，服务会继续读取旧目录，避免本地历史数据丢失。部署服务器时请持久化并保护正式数据目录，否则重启或重新部署后用户数据会丢失。API Key 会随账号数据保存；多人生产环境也可以继续用环境变量配置供应商 Key。

本地用 `start-server.ps1` 启动时，会把测试账号、测试对话和日志写到 `runtime/local/`：

- `runtime/local/data`：本地测试账号、配置和对话
- `runtime/local/logs`：本地运行日志
- `runtime/local/previews`：本地预览截图

`runtime/` 不需要上传服务器。线上部署时建议把正式数据目录放到独立持久化路径，例如 `PERSONACHAT_DATA_DIR=/data/personachat`。

如果要交给云端部署助手，直接使用仓库最新源码或 `server-github-webhook/` 里的自动部署脚本，不再保留旧的 `upload-package/` 生成目录。

如果云端部署后仍然看到旧界面，请检查：

1. 是否部署的是当前仓库最新源码，而不是旧压缩包或旧生成目录。
2. 是否真的运行了 Node 服务 `node server.js`，而不是静态网站托管。
3. 服务是否重启成功，旧 Node 进程是否还在占用端口。
4. 浏览器或 CDN 是否缓存了旧的 `index.html`、`app.js`、`styles.css`。
5. 打开 `/api/health`，确认返回的 `version` 是 `0.2.0-login-gated`。

## 部署更新

本项目已包含一套从 Windows 本地发布到 Linux 服务器的 SSH 部署脚本。

首次使用：

```powershell
Copy-Item .\deploy.config.example.ps1 .\deploy.config.ps1
notepad .\deploy.config.ps1
```

填好服务器地址、用户名、端口和部署目录后，每次更新运行：

```powershell
.\deploy.ps1
```

详细说明见 `DEPLOYMENT.md`。正式数据会保存在服务器 `shared/data`，每次更新只替换代码，不覆盖用户账号和会话数据。

## 当前包含

- 聊天软件式三栏布局
- 会话列表和新建会话
- 聊天气泡和真实 OpenAI-compatible 回复
- 账号注册、登录、退出
- 必须登录后才能使用聊天和设置
- 登录后自动保存配置、角色、头像和对话到服务端
- 自定义角色切换
- 自定义角色新建、删除、导入、导出和头像上传
- 角色档案、背景关系、说话风格、世界信息、长期记忆、示例对话和行为规则
- 输入“记住：……”可把内容追加到当前角色长期记忆，并随账号数据保存
- AI 人设编辑
- 用户身份编辑
- 模型与生成参数设置
- 本地持久化、服务端持久化、Markdown、复制消息、重新生成
- 移动端基础适配

## 借鉴方向

- AstrBot：会话、角色、人设和模型配置分层
- SillyTavern：角色字段、用户身份、场景和开场白
- MoeChat：核心记忆和长期记忆分层、可编辑记忆条目

没有复制二者代码，只保留适合 MVP 的产品结构。

## 下一步

1. 需要更大规模部署时，将 `runtime/data` 或服务器正式数据目录迁移到 SQLite 或 PostgreSQL
2. 增加全量导入/导出和重置本地数据
3. 增强移动端会话/自定义角色切换
4. 支持更完整的 SillyTavern 角色字段导入
