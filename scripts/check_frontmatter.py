#!/usr/bin/env python3
"""
check_frontmatter.py — feifan-daily 内容 frontmatter 预检查
================================================================
背景：2026-06-05 简报因 description 字段未转义双引号，导致 GitHub Pages
构建（gray-matter + js-yaml.safeLoad）解析整站 frontmatter 时整体 fail，
连带 6/6 简报也无法部署。

本脚本在 push 之前用 PyYAML 用同样严格的 safe_load 模式扫描所有
content/**/*.md，把 frontmatter 解析错误拦在本地。

用法：
    python3 scripts/check_frontmatter.py
    python3 scripts/check_frontmatter.py --dir content/briefings   # 限定目录
    python3 scripts/check_frontmatter.py --fix-suggest             # 给修复建议

退出码：0 = 全通过；1 = 有解析错误。
"""
from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

try:
    import yaml
except ImportError:
    print("❌ 缺少 PyYAML，请先：pip install pyyaml", file=sys.stderr)
    sys.exit(2)

ROOT = Path(__file__).resolve().parent.parent
FRONTMATTER_RE = re.compile(r"^---\s*\n(.*?\n)---\s*\n", re.DOTALL)

# 易错字段：值里若含双引号、冒号、井号等，YAML 在 double-quoted 标量中必须转义
SUSPICIOUS_CHARS = ['"', ':', '#', '\\']


def extract_frontmatter(text: str) -> tuple[str | None, int]:
    """返回 (frontmatter 字符串, 起始行号)。若无则 (None, 0)。"""
    m = FRONTMATTER_RE.match(text)
    if not m:
        return None, 0
    return m.group(1), 1  # frontmatter 从第 1 行开始


def fix_suggest(yaml_body: str) -> list[str]:
    """对每行 key: value，若 value 用双引号包裹但内部又含未转义双引号，给建议。"""
    hints = []
    for i, line in enumerate(yaml_body.splitlines(), start=2):  # +2 是因为 --- 占第 1 行
        m = re.match(r'^(\s*\w[\w\-_]*\s*:\s*)"(.*)"\s*$', line)
        if not m:
            continue
        key_part, value = m.group(1), m.group(2)
        # value 里若有未转义的 "，YAML 会断在这里
        # 简单启发：去掉 \\" 后还含 " 即认为有问题
        if re.search(r'(?<!\\)"', value):
            escaped = value.replace('"', r'\"')
            hints.append(
                f"  行 {i}: 双引号未转义 → 建议改为：{key_part}\"{escaped}\""
            )
    return hints


def check_file(p: Path, show_fix: bool) -> tuple[bool, str]:
    text = p.read_text(encoding="utf-8")
    fm, _ = extract_frontmatter(text)
    if fm is None:
        return True, "(无 frontmatter，跳过)"
    try:
        yaml.safe_load(fm)
        return True, "OK"
    except yaml.YAMLError as e:
        msg = f"YAML 解析失败：{e}"
        if show_fix:
            hints = fix_suggest(fm)
            if hints:
                msg += "\n  💡 修复建议：\n" + "\n".join(hints)
        return False, msg


def main() -> int:
    parser = argparse.ArgumentParser(description="feifan-daily frontmatter 预检查")
    parser.add_argument("--dir", default="content",
                        help="扫描目录（默认 content）")
    parser.add_argument("--fix-suggest", action="store_true",
                        help="对失败的文件输出修复建议")
    args = parser.parse_args()

    target_dir = (ROOT / args.dir).resolve()
    if not target_dir.exists():
        print(f"❌ 目录不存在：{target_dir}", file=sys.stderr)
        return 2

    md_files = sorted(target_dir.rglob("*.md"))
    print(f"🔍 扫描 {len(md_files)} 个 md 文件 @ {target_dir.relative_to(ROOT)}")

    failed: list[tuple[Path, str]] = []
    for p in md_files:
        ok, msg = check_file(p, args.fix_suggest)
        if not ok:
            failed.append((p, msg))

    print()
    if not failed:
        print(f"✅ 全部 {len(md_files)} 个文件 frontmatter 解析通过")
        return 0

    print(f"❌ {len(failed)} 个文件 frontmatter 解析失败：\n")
    for p, msg in failed:
        rel = p.relative_to(ROOT)
        print(f"  • {rel}")
        for line in msg.splitlines():
            print(f"    {line}")
        print()
    print("🚫 请修复后再 push。常见坑：description/title 等字段值里含未转义的双引号。")
    print("   在双引号包裹的字符串里，内部双引号必须写成 \\\"，或整体改用单引号包裹。")
    return 1


if __name__ == "__main__":
    sys.exit(main())
