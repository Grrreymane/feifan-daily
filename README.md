# 非凡像素 · 每日简报 & 深度文章

纯静态网站，Markdown 驱动，零依赖部署。

## 目录结构

```
feifan-daily/
├── content/            # 内容目录（Markdown + frontmatter）
│   ├── briefings/      # 每日简报
│   ├── articles/       # 深度文章
│   └── summaries/      # 视频笔记
├── static/             # 静态资源
│   ├── css/
│   ├── js/
│   └── images/
├── scripts/
│   ├── build.js        # 构建脚本：Markdown → HTML
│   ├── serve.js        # 本地预览服务器
│   └── import.js       # 从其他目录导入已有内容
├── dist/               # 构建输出（可直接部署）
└── package.json
```

## 快速开始

```bash
# 安装依赖
npm install

# 构建网站
npm run build

# 本地预览
npm run serve

# 构建 + 预览
npm run dev
```

## 添加新内容

在 `content/` 对应子目录下创建 `.md` 文件，格式：

```markdown
---
title: "文章标题"
date: "2026-03-29"
tags: ["AI", "游戏"]
description: "简短描述"
---

正文内容...
```

然后运行 `npm run build` 重新构建。

## 部署

`dist/` 目录是纯静态文件，可部署到：

- GitHub Pages
- 云存储静态网站托管
- Cloudflare Pages
- Vercel
- 任何 Nginx/Apache 服务器

## 与每日简报工作流集成

定时任务生成简报 Markdown → 写入 `content/briefings/` → 运行构建 → 自动发布。
