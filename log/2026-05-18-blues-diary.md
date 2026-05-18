# 开发日志 2026-05-18

## 今日完成

### 1. 优化：已完成待办不再提醒
- 代码已有 `!t.isDone` 过滤条件（5/17 已实现），无需额外改动

### 2. Bug 修复：待办提醒重复发送
- **根因**: `updateTodoReminder()` API 每次写入都硬编码 `reminded: false`，页面切换重载数据后本地状态被覆盖，第二轮 30 秒轮询再次发送
- **修复**: API 新增可选参数 `reminded`，提醒发送成功后持久化 `reminded: true`
- **改动文件**: `src/api/todo.ts`、`src/store/todo.ts`

### 3. Bug 修复：纪念日日期计算偏差
- **根因**: `dayjs.diff()` 截断取整，非零点时间差导致少算天数（如 2.54 天 → 显示 2 天）
- **修复**: 统一使用 `dayjs().startOf('day')` 从零点开始计算
- **改动文件**: `src/store/anniversary.ts`、`src/pages/anniversary/anniversary.vue`

### 4. Bug 修复：纪念日/标签输入框无法显示已输入文字
- **根因**: 微信原生 `<input>` 在真机上需显式 `height` 属性渲染文本区域；标签输入框 CSS 仅有 `flex: 1` 无 `height`/`border`/`background`，纪念日输入框用 `padding` 撑高无 `height`
- **修复**: 统一添加 `height: 72rpx`、`padding: 0 24rpx`、`border`、`background`、`font-size`、`color` 等样式
- **改动文件**: `src/pages/tags/tags.vue`、`src/pages/anniversary/anniversary.vue`

### 5. Bug 修复：昵称编辑后重导入消失
- **根因**: `updateProfile()` 仅存本地缓存 (`uni.setStorageSync`)，未写入云数据库；`nicknameInput` 初始值为 `''`，`onShow` 未从 userStore 同步
- **修复**: `updateProfile()` 新增 `syncProfileToCloud()` 同步昵称到云数据库；`onShow` 中填充 `nicknameInput`
- **改动文件**: `src/store/user.ts`、`src/pages/mine/mine.vue`

### 6. Bug 修复：日历中纪念日跨年误匹配
- **根因**: `getAnniversariesForDate()` 中条件 `ld === monthDay` 仅比较 MM-DD 未检查年份。2027 年阴历 4 月 13 碰巧落在 05-18，误匹配到 2026-05-18
- **修复**: 移除 `ld === monthDay`，仅使用完整日期 `YYYY-MM-DD` 比较
- **改动文件**: `src/pages/calendar/calendar.vue`

### 7. 方向一收尾验证
- 构建体验版：`npm run build:mp-weixin`
- 部署 `sendReminder` 云函数
- 真机测试通过

## 明日计划

参考 5/17 日志未完成项：

### 方向二：微信小程序正式上线
- 待方向一测试稳定后，评估整体功能完备性
- 注册微信小程序账号、完善基本信息
- 提交代码审核、正式发布

### 方向三：网页版同步
- 构建 H5 版本（`dev:h5` / `build:h5`）
- 将云数据库替换为可跨端访问的后端方案
- 实现 PC 端浏览器与小程序端数据同步

## 待规划的新功能

### 日记搜索（主界面）
- 在主界面（首页）添加搜索框，输入关键词检索日记内容
- 支持按日期、标签、内容模糊匹配
- 搜索结果列表展示，点击跳转到对应日记详情/编辑页

## 构建命令
```bash
npm run build:mp-weixin
# 输出目录: dist/build/mp-weixin/
```
