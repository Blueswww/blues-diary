# Blues Diary

跨平台个人日记应用 — 支持 **微信小程序** + **Web 端**，基于 uni-app + 微信云开发。

## 功能

- 每日日记记录（支持心情、标签）
- 标签系统（创建标签、按标签筛选日记）
- 日历视图（日期标记、节假日显示）
- 待办事项（每日待办、完成进度）
- 纪念日管理（倒计时）
- 微信登录/数据云同步

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置微信云开发

1. 前往 [微信公众平台](https://mp.weixin.qq.com/) 注册小程序，获取 AppID
2. 在微信开发者工具中开通云开发，获取云环境 ID
3. 创建数据库集合：

```
users        — 用户表
diaries      — 日记表
tags         — 标签表
todos        — 待办事项表
anniversaries — 纪念日表
```

4. 修改 `src/manifest.json` 中的 `appid`
5. 修改 `cloudbaserc.json` 中的 `envId`
6. 修改 `src/utils/constants.ts` 中的配置

### 3. 本地开发

```bash
# 启动 H5（浏览器）
npm run dev:h5

# 启动微信小程序（需在微信开发者工具中打开 dist/dev/mp-weixin）
npm run dev:mp-weixin
```

### 4. 部署云函数

```bash
# 安装 cloudbase cli
npm i -g @cloudbase/cli

# 登录
cloudbase login

# 部署
node deploy.js cloud
```

### 5. 部署到 Vercel（Web 端）

1. 将代码推送到 GitHub
2. 在 Vercel 中导入项目
3. 构建命令和输出目录已配置在 `vercel.json` 中
4. 部署后需配置云函数的 HTTP 触发路径

## 项目结构

```
src/
├── pages/
│   ├── index/        # 首页 - 日记列表
│   ├── diary/        # 写/编辑日记
│   ├── calendar/     # 日历视图
│   ├── tags/         # 标签管理
│   ├── todo/         # 待办事项
│   ├── anniversary/  # 纪念日
│   └── mine/         # 个人中心
├── components/       # 公共组件
├── store/            # Pinia 状态管理
├── api/              # 云函数 API 封装
├── utils/            # 工具函数
└── static/           # 静态资源
cloudfunctions/       # 微信云函数
```

## 零成本说明

- **微信云开发免费版**：1GB 数据库、1GB 存储、10 万次/天调用
- **Vercel Hobby 免费版**：自动构建部署 H5 页面
- 个人使用无需发布小程序，开发版/体验版即可使用
- 如要正式发布，需支付 300 元/年微信小程序认证费

## 技术栈

- uni-app (Vue 3 + TypeScript)
- Pinia 状态管理
- 微信云开发（云函数 + 云数据库 + 云存储）
- Vercel (H5 部署)
