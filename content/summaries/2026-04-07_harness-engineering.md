---
title: Harness Engineering 精准总结 — 让 AI 不再离经叛道的工程学科
date: '2026-04-07'
tags:
  - AI
  - Agent
  - Harness Engineering
  - 工程实践
  - 软件工程
description: 从14篇核心英文文献中提炼的 Harness Engineering 精准定义、三层架构、四根支柱、关键实验数据和实用建议。
---

# Harness Engineering 精准总结 — 让 AI 不再离经叛道的工程学科

> **类型**：知识笔记 · 概念精炼
> **来源**：基于 14 篇英文核心文献整理
> **关键词**：Harness Engineering · AI Agent · 约束工程 · 反馈闭环

---

## 一句话定义

> **Harness Engineering = 为 AI Agent 系统性地构建「约束、工具、文档和反馈闭环」的工程学科，让 Agent 的每一次犯错都变成永久性的改进。**

---

## 隐喻

这个词来自马具（harness）的隐喻：AI 模型是一匹强壮但不知方向的马，你不是去训练马本身，而是给它套上缰绳、鞍具和护栏，**在不削弱它力量的前提下引导它的方向**。

模型是引擎，Harness 是整辆车。你不改引擎，你造车身、方向盘、刹车和安全带。

---

## 概念来源

- **命名者**：Mitchell Hashimoto（HashiCorp 创始人）
- **时间**：2026 年 2 月 5 日，博文 *My AI Adoption Journey*
- **原话**：*"Anytime you find an agent makes a mistake, you take the time to engineer a solution such that the agent never makes that mistake again."*
- **引爆点**：OpenAI 随后发布用 Codex 写 100 万行代码（0 行人工）的工程报告，标题直接用了 "Harness Engineering"；LangChain 发布实验数据证明不换模型只改 Harness 就能让 benchmark 从 52.8% 提升到 66.5%

---

## 三层核心架构

```
┌─────────────────────────────────────────┐
│  第三层：验证与评估                        │
│  → 独立的评估器对抗生成器                   │
│  → 沙盒隔离，防止 Agent 篡改测试           │
│  → 解决：Agent "盲目自信"的问题             │
├─────────────────────────────────────────┤
│  第二层：并发控制                          │
│  → 多 Agent 协作的资源分配和状态管理        │
│  → Planner-Worker-Judge 层级架构          │
│  → 解决：多 Agent "群体混乱"的问题          │
├─────────────────────────────────────────┤
│  第一层：流程管控（最基础也最关键）           │
│  → AGENTS.md / CLAUDE.md 活文档           │
│  → 记忆系统防失忆，JSON锁防虚标完成         │
│  → 解决：Agent "不听话"的问题              │
└─────────────────────────────────────────┘
```

### 第一层 · 流程管控（解决"不听话"）

- **活文档**：AGENTS.md / CLAUDE.md 不是给人看的，是给 Agent 读的指令文档，持续演进
- **JSON 锁**：防止 Agent 虚标任务为"已完成"
- **三步唤醒仪式**：读目录 → 看 Git → 读进度 → 环境检查

### 第二层 · 并发控制（解决"群体混乱"）

- **层级架构**：Planner → Worker → Judge，各司其职
- **关键发现**：扁平协作超过 20 个 Agent 就开始低效
- **Cursor 实验**：上百 Agent 协作一周造出浏览器引擎（100 万行代码）

### 第三层 · 验证与评估（解决"盲目自信"）

- **Pre-Completion Checklist**：离场前检查单
- **Generator-Evaluator 分离**：写代码的和检查代码的是两个不同的 Agent 实例
- **沙盒隔离**：防止 Agent 篡改自己的测试用例

---

## 四根支柱

| 支柱 | 含义 | 例子 |
|------|------|------|
| **约束 (Constraints)** | 限定 Agent 能做什么、不能做什么 | 权限控制、只读沙盒、审批门控 |
| **工具 (Tools)** | 给 Agent 提供自检和自纠的能力 | 测试脚本、截图验证、lint 规则 |
| **文档 (Documentation)** | 持续演进的"活文档"，给 Agent 读的 | AGENTS.md、CLAUDE.md、MEMORY.md |
| **反馈闭环 (Feedback Loops)** | 每次犯错 → 修复 + 写入 Harness → 永不再犯 | 复利效应：每次会话都让 Harness 更强 |

---

## 关键洞察：补偿面迁移

> Harness 的每个组件都是在**补偿模型当前的能力缺陷**。随着模型能力提升，某些组件会变得多余，反而增加成本——这时候就要**拆掉它**。
>
> **护城河不在于你的 Harness 有多复杂，而在于你知道什么时候该加、什么时候该拆。**

这可能是整个 Harness Engineering 话题中最深刻的一个洞见——很多英文文章还没有说透的点。

---

## 核心实验数据

| 实验方 | 结果 | 关键细节 |
|--------|------|----------|
| **OpenAI** | 100 万行代码，0 行人写 | 3 工程师 + 5 个月，用 Codex 完成，10 倍效率提升 |
| **LangChain** | Benchmark 52.8% → 66.5% | 不换模型（GPT-5.2-Codex），仅改 Harness，排名升 25 位 |
| **Cursor** | 100 万行浏览器引擎 | Planner+Worker+Judge 架构，上百 Agent 协作一周完成 |

---

## 5 条实用建议

1. **从一个 AGENTS.md 开始**，而非复杂系统
2. **教 Agent 验证自己的工作**（不能只让它写，还要让它检查）
3. **给 Agent 注入环境，别让它自己找**（主动提供上下文）
4. **记录一切，让知识可复用**（每次犯错都写入 Harness）
5. **学会做减法**（定期审视哪些护栏已经不需要了）

---

## 时间线

```
2025.11  Anthropic 首次使用 "harness" 描述 Claude Agent SDK
    │
2026.01  Cursor 多 Agent 实验（上百 Agent 造浏览器）
    │
2026.02.05  Mitchell Hashimoto 正式命名 "Harness Engineering"
    │
2026.02.11  OpenAI 发布百万行代码工程报告
    │
2026.02.17  LangChain 发布 benchmark 实验数据
    │
2026.03.24  Anthropic 发布长任务 Agent 指南
```

---

## 我们的实践印证

在搭建这个 AI 工作流的过程中，我们发现很多做法天然对应了 Harness Engineering 的理念：

| Harness 概念 | 我们的实践 | 状态 |
|------|------|------|
| AGENTS.md / CLAUDE.md | MEMORY.md + INSTRUCTIONS.md（活文档系统） | ✅ |
| 每次犯错写入 Harness | 记忆系统的持续迭代（错误免疫） | ✅ |
| 自动化验证工具 | 健康度检测 + 工作流审计脚本 | ✅ |
| 定期审视做减法 | 每周自动审计（检测多余组件） | ✅ |
| 权限控制 | 只读原则（对外部系统只看不碰） | ✅ |
| 独立评估器 | 尚未实现（可以考虑让另一个 Agent 审核产出质量） | ⬜ |

---

## 14 篇核心文献

1. Mitchell Hashimoto — *My AI Adoption Journey*（2026.02.05，正式命名）
2. OpenAI — *Harness Engineering*（Codex 百万行报告）
3. LangChain — *Improving Deep Agents with Harness Engineering*（benchmark 实验）
4. Anthropic — *Building Effective AI Agents: Long-Running Tasks*
5. Anthropic — *Claude Agent SDK Documentation*
6. Cursor — *Multi-Agent Architecture Report*
7. Martin Fowler — *Analysis of Harness Engineering*
8. Simon Willison — *Commentary on Harness Engineering*
9. nxcode — *Complete Guide to Harness Engineering*
10. dev.to — *Five Companies, Five Definitions of Harness Engineering*
11. Mindwired AI — *Harness Engineering 101*
12. InfoQ — *Harness Engineering Coverage*
13. LangChain — *Agent Architecture Documentation*
14. 多篇技术博客与社区讨论

---

*本笔记基于以上 14 篇英文核心文献精炼而成，结合自身 AI 工作流迭代经验作为实践印证。*
