#!/usr/bin/env node
/**
 * 导入已有内容到 feifan-daily 网站
 * 自动为没有 frontmatter 的 Markdown 文件添加元数据
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const ROOT = path.resolve(__dirname, '..');
const CONTENT_DIR = path.join(ROOT, 'content');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// Article metadata mapping
const ARTICLE_META = {
  '2026-03-27_netflix-director-career-review.md': {
    title: 'Netflix前工程总监36年职业复盘：LeetCode刷得好≠工程做得好',
    date: '2026-03-27',
    tags: ['科技', '职业'],
    description: '基于前Netflix/Meta工程总监David Ronca的深度访谈，讲述36年工程师生涯的核心洞察。',
  },
  '2026-03-27_ai-fatigue-is-real.md': {
    title: 'AI让我写了史上最多的代码，也让我史上最累',
    date: '2026-03-27',
    tags: ['AI', '开发者'],
    description: 'AI疲劳是真实的，但没人谈论它。一位AI基础设施工程师的自白，加上HN社区471+赞讨论精选。',
  },
  '2026-03-28_ai-art-industry-impact.md': {
    title: '一张插画从三万砍到一万，不是因为你画得差了',
    date: '2026-03-28',
    tags: ['AI', '美术', '原创'],
    description: 'AI来了，你就该降价——不管你用不用AI。一位外包公司老板的账单，和一整个行业正在经历的阵痛。',
  },
  '2026-03-28_bitm-artists-losing-work.md': {
    title: 'AI杀死了我的工作：14位美术人的真实故事',
    date: '2026-03-28',
    tags: ['AI', '美术', '编译'],
    description: '编译自Blood in the Machine专栏，14位视觉艺术从业者的亲身经历。',
  },
};

const SUMMARY_META = {
  '2025-12-21_agent-building-pitfalls-v2.md': {
    title: 'AI Agent搭建的6个陷阱：那些神文没告诉你的事',
    date: '2025-12-21',
    tags: ['AI', 'Agent', '技术'],
    description: '视频总结：数字黑魔法频道分享AI Agent设计与传统软件设计的根本区别，以及开发过程中容易踩的六大坑。',
  },
};

function importFiles(srcDir, destCategory, metaMap) {
  const destDir = path.join(CONTENT_DIR, destCategory);
  ensureDir(destDir);
  
  if (!fs.existsSync(srcDir)) {
    console.log(`  ⚠️  目录不存在: ${srcDir}`);
    return 0;
  }
  
  let count = 0;
  for (const file of fs.readdirSync(srcDir).filter(f => f.endsWith('.md'))) {
    const raw = fs.readFileSync(path.join(srcDir, file), 'utf-8');
    const { data, content } = matter(raw);
    
    // Merge existing frontmatter with our metadata
    const meta = metaMap[file] || {};
    const merged = { ...meta, ...data };
    
    // If no metadata at all, try to extract from content
    if (!merged.title) {
      const titleMatch = content.match(/^#\s+(.+)$/m);
      if (titleMatch) merged.title = titleMatch[1];
    }
    
    // Write with frontmatter
    const output = matter.stringify(content, merged);
    fs.writeFileSync(path.join(destDir, file), output);
    count++;
    console.log(`  📄 ${file} → ${destCategory}/`);
  }
  return count;
}

console.log('📥 导入文章...');
const articleCount = importFiles(
  '/data/workspace/.agent/skills/wechat-article/archive',
  'articles',
  ARTICLE_META
);

console.log('\n📥 导入视频笔记...');
const summaryCount = importFiles(
  '/data/workspace/summaries',
  'summaries',
  SUMMARY_META
);

console.log(`\n✅ 导入完成：${articleCount} 篇文章，${summaryCount} 篇视频笔记`);
