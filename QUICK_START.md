# 智学伴侣（SmartStudy）快速启动指南

> 从零开始，5 分钟运行本项目

---

## 一、环境要求

| 依赖 | 最低版本 | 推荐版本 |
|------|----------|----------|
| Node.js | 18+ | 20+ |
| npm | 8+ | 10+ |
| 操作系统 | Windows / macOS / Linux | — |

检查本地环境：

```bash
node --version
npm --version
```

> 如果没有安装 Node.js，请前往 https://nodejs.org/ 下载 LTS 版本。

---

## 二、获取项目源码

### 方式一：从 Git 仓库克隆

```bash
git clone <仓库地址>
cd 智学伴侣
```

### 方式二：直接下载压缩包

解压后进入项目根目录：

```bash
cd 智学伴侣
```

> **注意**：项目根目录下有多个子目录，前端代码在 `智学伴侣/` 子目录中（即 `智学伴侣/智学伴侣/`），后端代码在 `server/` 中。

---

## 三、启动后端服务

### 3.1 进入后端目录

```bash
cd server
```

### 3.2 安装依赖

```bash
npm install
```

> 安装完成后会看到 `node_modules` 目录生成。

### 3.3 启动后端服务器

```bash
npm run dev
```

看到以下输出即表示启动成功：

```
[Server] SmartStudy backend running at http://localhost:3001
[Server] API endpoints available at http://localhost:3001/api
```

> **注意**：此终端窗口需保持运行，请**新开一个终端**执行下一步。

---

## 四、启动前端服务

### 4.1 进入前端目录

```bash
cd 智学伴侣/智学伴侣
```

> 如果当前在项目根目录 `D:\智学伴侣`，则直接执行此命令。
> 如果当前在 `server/` 目录，需要先返回上级目录：`cd ..`

### 4.2 安装依赖

```bash
npm install
```

> `node_modules` 比较大，安装可能需要 1-3 分钟。

### 4.3 启动前端开发服务器

```bash
npm run dev
```

看到以下输出即表示启动成功：

```
VITE v6.4.1  ready in 1849 ms

➜  Local:   http://localhost:5173/
```

---

## 五、访问项目

打开浏览器，访问：**http://localhost:5173/**

### 首次使用流程：

1. **注册账号** — 点击"立即注册"，输入用户名和密码
2. **设置目标** — 登录后选择备考目标（中考/高考/考研/考公）
3. **开始使用** — 进入首页，探索四个核心模块

---

## 六、项目目录结构

```
智学伴侣/                            # 项目根目录（Git 仓库）
├── server/                          # 后端服务
│   ├── src/
│   │   ├── index.ts                 # 入口文件（端口 3001）
│   │   ├── routes/                  # API 路由
│   │   │   ├── auth.ts              # 认证接口
│   │   │   ├── dashboard.ts         # 仪表盘接口
│   │   │   ├── tasks.ts             # 任务接口
│   │   │   ├── learning.ts          # 学习舱/笔记接口
│   │   │   ├── ai.ts                # AI 接口
│   │   │   └── feeds.ts             # 资讯接口
│   │   ├── services/                # 业务逻辑
│   │   └── db/                      # JSON 数据文件（自动生成）
│   ├── package.json
│   └── tsconfig.json
│
├── 智学伴侣/                        # 前端应用
│   ├── src/
│   │   ├── App.tsx                  # 路由配置（6 个页面）
│   │   ├── main.tsx                 # 入口文件
│   │   ├── index.css                # 全局样式 + 动画
│   │   ├── pages/                   # 页面组件
│   │   │   ├── Home.tsx             # 首页（神经网络动效）
│   │   │   ├── Login/               # 登录页
│   │   │   ├── Register/            # 注册页
│   │   │   ├── LearningCabin/       # 学习舱（核心）
│   │   │   ├── Dashboard/           # 仪表盘
│   │   │   ├── TaskBoard/           # 任务看板
│   │   │   ├── Schedule/            # 艾宾浩斯背诵计划
│   │   │   └── Notes/               # 笔记管理
│   │   ├── components/              # 通用组件
│   │   │   ├── VideoPlayer/         # 视频播放器
│   │   │   ├── MarkdownEditor/      # Markdown 编辑器
│   │   │   ├── RadarChart/          # 雷达图
│   │   │   ├── HeatmapChart/        # 热力图
│   │   │   ├── TaskCard/            # 任务卡片
│   │   │   └── FeedList/            # 资讯列表
│   │   ├── services/
│   │   │   └── api.ts               # API 客户端
│   │   ├── context/
│   │   │   └── AuthContext.tsx       # 认证状态
│   │   └── mocks/                   # 模拟数据
│   ├── package.json
│   ├── vite.config.ts               # Vite 配置（含 /api 代理）
│   ├── tailwind.config.js
│   └── tsconfig.json
│
└── vercel.json                      # Vercel 部署配置
```

---

## 七、端口说明

| 服务 | 端口 | 说明 |
|------|------|------|
| 前端开发服务器 | 5173 | 浏览器访问入口 |
| 后端 API 服务器 | 3001 | 提供 RESTful API |

前端通过 Vite 代理将 `/api` 请求转发到后端 3001 端口，配置在 `vite.config.ts` 中：

```ts
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3001',
      changeOrigin: true,
    },
  },
},
```

---

## 八、常见问题

### Q1：启动报错 "port already in use"

端口被占用，检查并释放端口：

```bash
# 查看占用端口的进程
netstat -ano | findstr :5173
netstat -ano | findstr :3001

# 在任务管理器中结束对应进程，或修改 vite.config.ts 中的端口
```

### Q2：npm install 安装失败

```bash
# 尝试清空缓存后重试
npm cache clean --force
npm install
```

### Q3：后端启动报 tsx 相关错误

```bash
# 确保 tsx 已正确安装
cd server
npm install
```

### Q4：前端页面白屏 / API 请求 404

- 确认后端是否已启动（终端应有 `localhost:3001` 输出）
- 检查浏览器控制台 Network 标签，确认请求是否被代理到 3001
- 确认已登录（未登录会自动跳转到登录页）

### Q5：Windows 系统路径问题

如果使用 PowerShell 或 CMD，请使用反斜杠或双引号处理中文路径：

```powershell
cd "D:\智学伴侣\智学伴侣"
```

---

## 九、命令速查

```bash
# 启动后端（在 server/ 目录下）
cd server && npm install && npm run dev

# 启动前端（在 智学伴侣/ 目录下，新开终端）
cd 智学伴侣/智学伴侣 && npm install && npm run dev

# 浏览器访问
# http://localhost:5173/
```
