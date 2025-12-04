# PicTalk 图片管理系统

PicTalk 是一个基于 Vue 3 + TypeScript 的图片管理系统，支持图片存储、分享、编辑等功能。

## 功能特性

- 用户认证与权限管理
- 图片上传与管理
- 团队空间与个人空间管理
- 图片在线编辑（裁剪、缩放、旋转）
- 图片分类与标签管理
- 社区论坛功能
- 数据统计与分析
- 空间成员邀请

## 技术栈

- Vue 3 (Composition API)
- TypeScript
- Vite
- Ant Design Vue
- Element Plus
- Vue Router
- Pinia (状态管理)

## 项目结构

```
src/
├── api          # 后端接口定义
├── components   # 公共组件
├── constant     # 常量定义
├── layouts      # 页面布局
├── router       # 路由配置
├── stores       # 状态管理
├── utils        # 工具函数
├── views        # 页面视图
│   ├── admin    # 管理员功能模块
│   ├── forum    # 社区论坛模块
│   ├── picture  # 图片管理模块
│   ├── space    # 空间管理模块
│   └── user     # 用户管理模块
└── App.vue      # 根组件
```

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发环境运行

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 代码格式化

```bash
npm run format
```

### 代码检查

```bash
npm run lint
```

## 主要页面

- `/` - 首页（图片浏览）
- `/user/login` - 用户登录
- `/user/register` - 用户注册
- `/add_picture` - 上传图片
- `/user/mySpace` - 我的空间
- `/user/teamSpace` - 团队空间
- `/user/spaceAnalyse` - 空间分析
- `/forum` - 社区论坛
- `/admin/manage` - 管理员后台

## 环境要求

- Node.js >= 16.0
- npm >= 8.0

## 配置说明

项目使用 Vite 构建工具，默认配置位于 [vite.config.ts](file:///d:/aiPicturesStoreUi/vite.config.ts) 文件中。
