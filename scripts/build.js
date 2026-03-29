#!/usr/bin/env node
/**
 * 非凡像素 - 静态站点构建器
 * 
 * 读取 content/ 目录下的 Markdown 文件，生成静态 HTML 网站到 dist/ 目录。
 * 
 * 用法：node scripts/build.js
 * 
 * content 目录结构：
 *   content/briefings/  - 每日简报
 *   content/articles/   - 公众号文章
 *   content/summaries/  - 视频总结
 * 
 * Markdown frontmatter 格式：
 *   ---
 *   title: 文章标题
 *   date: 2026-03-28
 *   tags: [AI, 美术]
 *   description: 简短描述
 *   ---
 */

const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const matter = require('gray-matter');

const ROOT = path.resolve(__dirname, '..');
const CONTENT_DIR = path.join(ROOT, 'content');
const DIST_DIR = path.join(ROOT, 'dist');
const STATIC_DIR = path.join(ROOT, 'static');

// Base path for deployment (e.g. '/feifan-daily' for GitHub Pages)
// Set via env var or defaults to '' for root deployment
const BASE_PATH = (process.env.BASE_PATH || '').replace(/\/+$/, '');

// ===== Category config =====
const CATEGORIES = {
  briefings: { name: '每日简报', emoji: '📡', slug: 'briefings', description: '科技 · 游戏 · AI 每日精选' },
  articles:  { name: '深度文章', emoji: '📝', slug: 'articles',  description: '原创观察与编译精选' },
  summaries: { name: '视频笔记', emoji: '🎬', slug: 'summaries', description: '播客 · 视频内容总结' },
};

// ===== Helpers =====
function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function readMarkdownFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.md'))
    .map(f => {
      const raw = fs.readFileSync(path.join(dir, f), 'utf-8');
      const { data, content } = matter(raw);
      
      // Try to extract date from filename if not in frontmatter
      if (!data.date) {
        const dateMatch = f.match(/^(\d{4}-\d{2}-\d{2})/);
        if (dateMatch) data.date = dateMatch[1];
      }
      
      // Try to extract title from first heading if not in frontmatter
      if (!data.title) {
        const titleMatch = content.match(/^#\s+(.+)$/m);
        if (titleMatch) data.title = titleMatch[1];
      }
      
      // Generate slug from filename
      const slug = f.replace(/\.md$/, '');
      
      // Generate excerpt from content (strip markdown)
      if (!data.description) {
        const plain = content
          .replace(/^#.*$/gm, '')
          .replace(/[*_`~\[\]()>]/g, '')
          .replace(/\n+/g, ' ')
          .trim();
        data.description = plain.substring(0, 200) + (plain.length > 200 ? '...' : '');
      }
      
      return { ...data, slug, content, filename: f };
    })
    .sort((a, b) => {
      if (!a.date && !b.date) return 0;
      if (!a.date) return 1;
      if (!b.date) return -1;
      return b.date.localeCompare(a.date);
    });
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function renderMarkdown(md) {
  return marked(md, {
    breaks: true,
    gfm: true,
  });
}

// ===== HTML Templates =====
function htmlShell(title, body, activeNav = '') {
  const B = BASE_PATH;
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - 非凡像素</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="${B}/css/style.css">
</head>
<body>
  <header class="site-header">
    <div class="site-title"><a href="${B}/">非凡<span class="pixel">像素</span></a></div>
    <div class="site-subtitle">科技 · 游戏 · 美术 · 世界在变，人更需要思考</div>
    <nav class="site-nav">
      <a href="${B}/"${activeNav === 'home' ? ' class="active"' : ''}>首页</a>
      <a href="${B}/briefings/"${activeNav === 'briefings' ? ' class="active"' : ''}>每日简报</a>
      <a href="${B}/articles/"${activeNav === 'articles' ? ' class="active"' : ''}>深度文章</a>
      <a href="${B}/summaries/"${activeNav === 'summaries' ? ' class="active"' : ''}>视频笔记</a>
    </nav>
  </header>
  <main class="container">
    ${body}
  </main>
  <footer class="site-footer">
    非凡像素 © ${new Date().getFullYear()} · 用理解代替恐惧
  </footer>
</body>
</html>`;
}

function postCardHtml(post, category) {
  const tags = (post.tags || []).map(t => `<span class="post-tag">${t}</span>`).join('');
  return `<a class="post-card" href="${BASE_PATH}/${category}/${post.slug}.html">
  <div class="post-meta">
    <span class="post-date">${formatDate(post.date)}</span>
    ${tags}
  </div>
  <div class="post-title">${post.title || '无标题'}</div>
  <div class="post-excerpt">${post.description || ''}</div>
</a>`;
}

function postListPageHtml(cat, posts) {
  const catInfo = CATEGORIES[cat];
  const cards = posts.map(p => postCardHtml(p, cat)).join('\n');
  const body = `
    <div class="page-header">
      <h1>${catInfo.emoji} ${catInfo.name}</h1>
      <p>${catInfo.description}</p>
    </div>
    <div class="post-list">
      ${cards || '<p style="color:var(--text-dim)">暂无内容，敬请期待 ✨</p>'}
    </div>`;
  return htmlShell(catInfo.name, body, cat);
}

function postDetailPageHtml(post, category) {
  const catInfo = CATEGORIES[category];
  const tags = (post.tags || []).map(t => `<span class="post-tag">${t}</span>`).join('');
  // Remove the first h1 heading from content (already shown in article header)
  const contentWithoutTitle = post.content.replace(/^#\s+.+\n*/m, '');
  const htmlContent = renderMarkdown(contentWithoutTitle);
  const body = `
    <a class="back-link" href="${BASE_PATH}/${category}/">← ${catInfo.name}</a>
    <article>
      <div class="article-header">
        <div class="post-meta">
          <span class="post-date">${formatDate(post.date)}</span>
          ${tags}
        </div>
        <h1 class="article-title">${post.title || '无标题'}</h1>
        ${post.description ? `<p class="article-desc">${post.description}</p>` : ''}
      </div>
      <div class="article-content">
        ${htmlContent}
      </div>
    </article>`;
  return htmlShell(post.title || '无标题', body, category);
}

function homePageHtml(allPosts) {
  // Show latest posts across all categories
  const latest = allPosts
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
    .slice(0, 15);
  
  const cards = latest.map(p => postCardHtml(p, p._category)).join('\n');
  
  const body = `
    <div class="page-header">
      <h1>最新更新</h1>
      <p>科技、游戏、美术。记录行业深度思考。</p>
    </div>
    <div class="post-list">
      ${cards || '<p style="color:var(--text-dim)">暂无内容，敬请期待 ✨</p>'}
    </div>`;
  return htmlShell('首页', body, 'home');
}

// ===== Build =====
function build() {
  console.log('🔨 开始构建...');
  
  // Clean dist
  if (fs.existsSync(DIST_DIR)) {
    fs.rmSync(DIST_DIR, { recursive: true });
  }
  ensureDir(DIST_DIR);
  
  // Copy static files
  copyDirSync(STATIC_DIR, DIST_DIR);
  console.log('  ✅ 静态文件已复制');
  
  // Read all content
  const allPosts = [];
  
  for (const [cat, info] of Object.entries(CATEGORIES)) {
    const dir = path.join(CONTENT_DIR, cat);
    const posts = readMarkdownFiles(dir);
    posts.forEach(p => p._category = cat);
    allPosts.push(...posts);
    
    // Generate list page
    const listDir = path.join(DIST_DIR, cat);
    ensureDir(listDir);
    fs.writeFileSync(
      path.join(listDir, 'index.html'),
      postListPageHtml(cat, posts)
    );
    
    // Generate detail pages
    for (const post of posts) {
      fs.writeFileSync(
        path.join(listDir, `${post.slug}.html`),
        postDetailPageHtml(post, cat)
      );
    }
    
    console.log(`  ✅ ${info.name}：${posts.length} 篇`);
  }
  
  // Generate home page
  fs.writeFileSync(
    path.join(DIST_DIR, 'index.html'),
    homePageHtml(allPosts)
  );
  console.log('  ✅ 首页已生成');
  
  console.log(`\n🎉 构建完成！共 ${allPosts.length} 篇文章`);
  console.log(`📁 输出目录：${DIST_DIR}`);
}

function copyDirSync(src, dest) {
  if (!fs.existsSync(src)) return;
  ensureDir(dest);
  for (const item of fs.readdirSync(src)) {
    const s = path.join(src, item);
    const d = path.join(dest, item);
    if (fs.statSync(s).isDirectory()) {
      copyDirSync(s, d);
    } else {
      fs.copyFileSync(s, d);
    }
  }
}

// Run
build();
