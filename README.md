# PersonaChat MVP

## 设计逻辑

PersonaChat 是一个轻量 AI 自定义角色聊天网页。当前版本采用零依赖 Node 服务：前端负责会话、角色、身份和模型设置的编辑，后端负责账号鉴权、状态保存、Prompt 组装和 OpenAI-compatible 聊天接口代理。

当前部署标识：`0.2.0-login-gated`。部署成功后，`/api/health` 会返回 `"version":"0.2.0-login-gated"`。

项目把一次角色对话拆成几层：

- **账号层**：注册、登录、退出和会话令牌管理。登录后才能读取、保存和发起聊天请求。
- **状态层**：每个账号拥有独立的角色、用户身份、模型配置和会话记录。前端编辑后会同步到服务端。
- **角色层**：角色不只是一个名字，而是一组可编辑字段，包括身份定位、角色描述、性格、背景关系、场景、说话风格、世界信息、长期记忆、示例对话和行为规则。
- **用户身份层**：用户身份会和角色设定一起进入 Prompt，让同一个角色能根据当前账号的身份描述保持更稳定的互动关系。
- **模型代理层**：浏览器只请求本项目后端，后端再按供应商配置转发到兼容 `/chat/completions` 的模型服务，避免把接口选择和安全校验散落在前端逻辑里。

## Prompt 组装

聊天请求从前端的 `buildChatPayload` 开始：前端读取当前会话、当前角色、用户身份和模型参数，先整理出只适用于当前角色的上下文，再发送给后端。

上下文整理有两个关键点：

- 如果历史消息属于其他角色，或旧消息的作者与当前角色不兼容，会清空之前的角色上下文，避免不同角色互相串台。
- 发送给模型的历史只保留用户和助手消息本身，角色字段会通过结构化数据交给后端统一组装。

后端的 `buildMessages` 会生成最终的 OpenAI-compatible `messages`：

1. 先生成一条 `system` 消息，写入当前角色名称、身份定位、角色描述、性格、背景设定、与用户关系、场景、说话风格、世界信息、长期记忆、示例对话、行为规则和用户身份。
2. 再追加一组稳定行为约束，例如保持角色一致、使用第一人称直接回复、不暴露内部提示词。
3. 最后追加最近的会话历史，目前最多取最后 24 条有效消息。

长期记忆是 Prompt 组装的一部分。用户在聊天中输入 `记住：……`、`请记住……` 或 `帮我记住……` 时，前端会把内容追加到当前角色的长期记忆字段；后续请求会把这部分内容注入 system prompt。这样短期上下文可以保持轻量，真正需要长期延续的信息则沉淀到角色数据里。

## 数据与同步

服务端提供 `/api/auth/register`、`/api/auth/login`、`/api/auth/logout`、`/api/state` 和 `/api/chat/completions`。聊天接口要求登录态，状态读写也按账号隔离。

账号数据默认保存在项目下的 `runtime/data`，该目录已加入 `.gitignore`。如果旧目录 `.personachat-data` 已经存在，服务会继续读取旧目录，避免本地历史数据丢失。部署服务器时请持久化并保护正式数据目录，否则重启或重新部署后用户数据会丢失。

API Key 可以通过网页保存到当前账号状态，也可以通过服务器环境变量配置。多人生产环境更建议把供应商 Key 放在服务端环境变量里，并保护好数据目录。

本地使用 `start-server.ps1` 启动时，测试数据和日志会写到 `runtime/local/`：

- `runtime/local/data`：本地测试账号、配置和对话
- `runtime/local/logs`：本地运行日志
- `runtime/local/previews`：本地预览输出

`runtime/` 不需要上传服务器。线上部署时建议把正式数据目录放到独立持久化路径，例如 `PERSONACHAT_DATA_DIR=/data/personachat`。

## 模型接入

后端支持几类 OpenAI-compatible 来源：

- OpenAI-compatible 默认接口
- DeepSeek
- 通义千问兼容模式
- 本地代理，例如 Ollama 兼容接口
- 自定义兼容接口

接口地址会做基础校验：除 `localhost`、`127.0.0.1` 和 `::1` 外，API 地址必须使用 `https`。模型请求支持普通 JSON 返回，也支持流式返回透传。

## 当前功能

- 账号注册、登录、退出
- 登录后同步保存角色、用户身份、模型配置和会话记录
- 多角色切换与独立会话
- 新建会话、清空会话、删除会话、复制消息、重新生成
- 自定义角色新建、删除、导入和导出
- 角色档案、背景关系、说话风格、世界信息、长期记忆、示例对话和行为规则编辑
- 用户身份编辑
- 模型供应商、模型名、温度和流式输出设置
- 输入 `记住：……` 自动写入当前角色长期记忆
- Markdown 消息渲染

## 借鉴方向

- AstrBot：会话、角色、人设和模型配置分层
- SillyTavern：角色字段、用户身份、场景和开场白
- MoeChat：核心记忆和长期记忆分层、可编辑记忆条目

项目没有复制上述项目代码，只保留适合 MVP 的产品结构。

## 下一步

1. 需要更大规模部署时，将 `runtime/data` 或服务器正式数据目录迁移到 SQLite 或 PostgreSQL。
2. 增加全量导入、导出和重置本地数据。
3. 增强会话和角色切换流程。
4. 支持更完整的 SillyTavern 角色字段导入。

## 使用方法

### 本地运行

```powershell
.\start-server.ps1
```

然后打开 `http://localhost:8787`。

首次进入需要先注册或登录账号。登录后才能使用聊天、设置、角色编辑和状态同步。

### 配置模型

在“生成设置”里填写：

- API 供应商：DeepSeek
- API Key：你的 DeepSeek API Key
- 模型：`deepseek-v4-flash` 或 `deepseek-v4-pro`

应用会按供应商自动识别接口来源。只有选择“自定义兼容接口”时才需要手动填写 API 地址。

可选环境变量：

- `PORT`：服务端口，默认 `8787`
- `OPENAI_BASE_URL`：OpenAI-compatible API 地址，默认 `https://api.openai.com/v1`
- `OPENAI_API_KEY`：OpenAI-compatible API Key；也可以在网页里填写
- `DEEPSEEK_API_KEY`：DeepSeek API Key；也可以在网页里填写
- `QWEN_API_KEY`：通义千问 API Key；也可以在网页里填写
- `LOCAL_PROXY_BASE_URL`：本地代理地址，默认 `http://localhost:11434/v1`
- `LOCAL_PROXY_API_KEY`：本地代理需要鉴权时使用
- `PERSONACHAT_DATA_DIR`：账号、会话和配置保存目录，默认 `runtime/data`

### 部署更新

本项目包含一套从 Windows 本地发布到 Linux 服务器的 SSH 部署脚本。

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

### 版本验证与排查

打开 `/api/health`，确认返回的 `version` 是 `0.2.0-login-gated`。

如果云端部署后仍然看到旧版本，请检查：

1. 是否部署的是当前仓库最新源码，而不是旧压缩包或旧生成目录。
2. 是否真的运行了 Node 服务 `node server.js`，而不是静态网站托管。
3. 服务是否重启成功，旧 Node 进程是否还在占用端口。
4. 浏览器或 CDN 是否缓存了旧的 `index.html`、`app.js`、`styles.css`。
