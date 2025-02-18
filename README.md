# Fuzzy Function Visualizer

一个基于自然语言描述生成和可视化数学函数的 Web 应用。全部代码均使用[we0](https://we0.ai/wedev)和[Copilot](https://github.com/features/copilot)生成

## 功能特点

- 🎯 通过自然语言描述生成数学函数
- 📊 实时函数可视化
- 🎨 支持多函数同时展示
- 🎭 动态切换函数显示/隐藏
- 🌈 自动分配随机颜色
- 📱 响应式设计

## 技术栈

- 前端：React + Vite + Ant Design + Plotly.js
- 后端：Express + Math.js
- AI：LLaMA 3.3 70B

## 快速开始

### 环境要求

- Node.js >= 16
- npm >= 8

### 安装

```bash
git clone <repository-url>
cd fuzzy-function-visualizer
npm install
```

### 环境配置

创建 .env 文件并设置以下变量：

```env
API_KEY=<your-api-key>
API_URL=<llama-api-url>
VITE_API_URL=http://localhost:3000
```

### 运行

开发环境：
```bash
npm run dev
```

构建项目：
```bash
npm run build
```

## 使用说明

1. 在输入框中输入函数描述（如："y is approximately x squared"）
2. 点击"添加函数"按钮生成函数图像
3. 使用开关控制函数显示/隐藏
4. 使用删除按钮移除函数

## 注意事项

- 确保 API 密钥配置正确
- 建议使用现代浏览器访问
- 函数生成可能需要几秒钟时间