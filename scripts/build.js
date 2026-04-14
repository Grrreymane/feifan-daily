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
  briefings:  { name: '每日简报', emoji: '📡', slug: 'briefings',  description: '科技 · 游戏 · AI 每日精选' },
  articles:   { name: '深度文章', emoji: '📝', slug: 'articles',   description: '原创观察与编译精选' },
  summaries:  { name: '笔记', emoji: '📒', slug: 'summaries',  description: '视频 · 播客 · 文章 · 学习笔记' },
  'ta-notes': { name: 'TA学习笔记', emoji: '🎨', slug: 'ta-notes', description: '技术美术 · 图形学 · 渲染 · 管线工具' },
  gallery:    { name: '福瑞画廊', emoji: '🐾', slug: 'gallery',    description: '每日精选兽人艺术' },
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
  // Protect LaTeX math blocks from marked processing
  const mathBlocks = [];
  // Protect display math ($$...$$) first
  let protected = md.replace(/\$\$([\s\S]*?)\$\$/g, (match) => {
    const idx = mathBlocks.length;
    mathBlocks.push(match);
    return `%%MATH_BLOCK_${idx}%%`;
  });
  // Protect inline math ($...$) — avoid matching $ used in code
  protected = protected.replace(/(?<!\$)\$(?!\$)(.+?)(?<!\$)\$(?!\$)/g, (match) => {
    const idx = mathBlocks.length;
    mathBlocks.push(match);
    return `%%MATH_BLOCK_${idx}%%`;
  });

  let html = marked(protected, {
    breaks: true,
    gfm: true,
  });

  // Restore math blocks
  html = html.replace(/%%MATH_BLOCK_(\d+)%%/g, (_, idx) => mathBlocks[parseInt(idx)]);
  return html;
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
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,100..900&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="${B}/css/style.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/highlight.js@11.9.0/styles/github-dark.min.css" crossorigin="anonymous">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css" crossorigin="anonymous">
</head>
<body>
  <header class="site-header">
    <div class="site-title"><a href="${B}/">非凡<span class="pixel">像素</span></a></div>
    <div class="site-subtitle">科技 · 游戏 · 美术 · 世界在变，人更需要思考</div>
    <nav class="site-nav">
      <a href="${B}/"${activeNav === 'home' ? ' class="active"' : ''}>首页</a>
      <a href="${B}/briefings/"${activeNav === 'briefings' ? ' class="active"' : ''}>每日简报</a>
      <a href="${B}/articles/"${activeNav === 'articles' ? ' class="active"' : ''}>深度文章</a>
      <a href="${B}/summaries/"${activeNav === 'summaries' ? ' class="active"' : ''}>笔记</a>
      <a href="${B}/ta-notes/"${activeNav === 'ta-notes' ? ' class="active"' : ''}>TA学习笔记</a>
      <a href="${B}/gallery/"${activeNav === 'gallery' ? ' class="active"' : ''}>福瑞画廊</a>
      <a href="${B}/game/"${activeNav === 'game' ? ' class="active"' : ''}>🐭 鼠鼠修仙</a>
    </nav>
  </header>
  <main class="container">
    ${body}
  </main>
  <footer class="site-footer">
    非凡像素 © ${new Date().getFullYear()} · 用理解代替恐惧
  </footer>
  <script defer src="https://cdn.jsdelivr.net/npm/highlight.js@11.9.0/highlight.min.js" crossorigin="anonymous"
    onload="hljs.highlightAll();"></script>
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js" crossorigin="anonymous"></script>
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js" crossorigin="anonymous"
    onload="renderMathInElement(document.body,{delimiters:[{left:'$$',right:'$$',display:true},{left:'$',right:'$',display:false}],throwOnError:false});"></script>
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

function galleryCardHtml(post) {
  const tags = (post.tags || []).map(t => `<span class="post-tag">${t}</span>`).join('');
  const imgSrc = post.image ? `${BASE_PATH}/images/gallery/${post.image}` : '';
  const twitterBadge = post.twitter_url ? '<span class="twitter-badge">𝕏</span>' : '';
  let imgBlock = '';
  if (imgSrc) {
    imgBlock = `<div class="gallery-img-wrap"><img src="${imgSrc}" alt="${post.title || ''}" loading="lazy">${twitterBadge}</div>`;
  } else if (post.twitter_url) {
    imgBlock = `<div class="gallery-img-wrap gallery-twitter-placeholder"><span class="twitter-placeholder-icon">𝕏</span></div>`;
  }
  // 纯推特条目（无本地图片+有推特链接）直接跳转到推特，不绕详情页
  const isTwitterOnly = !post.image && post.twitter_url;
  const cardHref = isTwitterOnly ? post.twitter_url : `${BASE_PATH}/gallery/${post.slug}.html`;
  const targetAttr = isTwitterOnly ? ' target="_blank" rel="noopener noreferrer"' : '';
  return `<a class="gallery-card" href="${cardHref}"${targetAttr}>
  ${imgBlock}
  <div class="gallery-info">
    <div class="post-title">${post.title || '无标题'}</div>
    <div class="post-meta">
      <span class="post-date">${formatDate(post.date)}</span>
      ${tags}
    </div>
    ${post.artist ? `<div class="gallery-artist">🎨 ${post.artist}</div>` : ''}
  </div>
</a>`;
}

function galleryListPageHtml(posts) {
  const catInfo = CATEGORIES.gallery;
  const cards = posts.map(p => galleryCardHtml(p)).join('\n');
  const body = `
    <div class="page-header">
      <h1>${catInfo.emoji} ${catInfo.name}</h1>
      <p>${catInfo.description}</p>
    </div>
    <div class="gallery-grid">
      ${cards || '<p style="color:var(--text-dim)">暂无内容，敬请期待 ✨</p>'}
    </div>`;
  return htmlShell(catInfo.name, body, 'gallery');
}

function twitterEmbedHtml(twitterUrl) {
  if (!twitterUrl) return '';
  // 从URL中提取用户名
  const match = twitterUrl.match(/x\.com\/([^\/]+)/);
  const username = match ? `@${match[1]}` : 'X/Twitter';
  // 判断是否是具体帖子还是主页
  const isPost = /\/status\/\d+/.test(twitterUrl);
  const linkText = isPost ? '查看推文 →' : '访问主页 →';
  return `
    <div class="twitter-link-card">
      <a href="${twitterUrl}" target="_blank" rel="noopener noreferrer" class="twitter-card-inner">
        <div class="twitter-card-icon">𝕏</div>
        <div class="twitter-card-info">
          <div class="twitter-card-username">${username}</div>
          <div class="twitter-card-action">${linkText}</div>
        </div>
        <div class="twitter-card-arrow">↗</div>
      </a>
    </div>`;
}

function galleryDetailPageHtml(post) {
  const catInfo = CATEGORIES.gallery;
  const tags = (post.tags || []).map(t => `<span class="post-tag">${t}</span>`).join('');
  const imgSrc = post.image ? `${BASE_PATH}/images/gallery/${post.image}` : '';
  const twitterSection = post.twitter_url ? twitterEmbedHtml(post.twitter_url) : '';
  const body = `
    <a class="back-link" href="${BASE_PATH}/gallery/">← ${catInfo.name}</a>
    <article class="gallery-detail">
      ${imgSrc ? `<div class="gallery-detail-img"><img src="${imgSrc}" alt="${post.title || ''}"></div>` : ''}
      <div class="article-header">
        <div class="post-meta">
          <span class="post-date">${formatDate(post.date)}</span>
          ${tags}
        </div>
        <h1 class="article-title">${post.title || '无标题'}</h1>
        ${post.description ? `<p class="article-desc">${post.description}</p>` : ''}
        ${post.artist ? `<p class="gallery-artist-detail">🎨 ${post.artist}</p>` : ''}
      </div>
      ${twitterSection}
    </article>`;
  return htmlShell(post.title || '无标题', body, 'gallery');
}

function postDetailPageHtml(post, category) {
  const catInfo = CATEGORIES[category];
  const tags = (post.tags || []).map(t => `<span class="post-tag">${t}</span>`).join('');
  // Remove the first h1 heading from content (already shown in article header)
  const contentWithoutTitle = post.content.replace(/^#\s+.+\n*/m, '');
  let htmlContent = renderMarkdown(contentWithoutTitle);
  // Add BASE_PATH prefix to relative image src paths (e.g. /images/...)
  if (BASE_PATH) {
    htmlContent = htmlContent.replace(/(<img[^>]+src=")\/(?!\/)/g, `$1${BASE_PATH}/`);
  }
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
  // Show latest posts across all categories (except gallery)
  const latest = allPosts
    .filter(p => p._category !== 'gallery')
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
    .slice(0, 15);
  
  const cards = latest.map(p => postCardHtml(p, p._category)).join('\n');
  
  // Show latest gallery items
  const galleryPosts = allPosts
    .filter(p => p._category === 'gallery')
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
    .slice(0, 6);
  
  const galleryCards = galleryPosts.map(p => galleryCardHtml(p)).join('\n');
  const gallerySection = galleryPosts.length > 0 ? `
    <div class="section-divider"></div>
    <div class="page-header">
      <h1>🐾 福瑞画廊</h1>
      <p>每日精选兽人艺术 · <a href="${BASE_PATH}/gallery/" style="color:var(--accent)">查看全部 →</a></p>
    </div>
    <div class="gallery-grid">
      ${galleryCards}
    </div>` : '';
  
  const body = `
    <div class="page-header">
      <h1>最新更新</h1>
      <p>科技、游戏、美术。记录行业深度思考。</p>
    </div>
    <div class="post-list">
      ${cards || '<p style="color:var(--text-dim)">暂无内容，敬请期待 ✨</p>'}
    </div>
    ${gallerySection}`;
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
    
    if (cat === 'gallery') {
      // Gallery uses its own grid layout
      fs.writeFileSync(
        path.join(listDir, 'index.html'),
        galleryListPageHtml(posts)
      );
      for (const post of posts) {
        fs.writeFileSync(
          path.join(listDir, `${post.slug}.html`),
          galleryDetailPageHtml(post)
        );
      }
    } else {
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
