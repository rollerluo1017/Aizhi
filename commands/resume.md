---
description: 从上次停下的地方继续：接上次的活动，并提示到期的复习
allowed-tools: Read, Write, Edit
---

# 从上次停下的地方继续

按进度规范 `${CLAUDE_PLUGIN_ROOT}/skills/progress/SKILL.md`（本次会话还没读过就先用 Read 读一遍）读取当前文件夹下的 `.aizhi/progress.yaml`。

如果文件不存在或没有 `last_session`，告诉学生这个文件夹里还没有学习记录，并建议从 `/aizhi:explain` 或 `/aizhi:debate` 开始，然后停下。

## 1. 简短回顾

用两三句话说明：
- 上次的日期、活动和停下的位置（来自 `last_session`）。
- 与上次活动相关的、最要紧的一个未解决问题或薄弱点。
- 如果有到期的复习（`next_review` 不晚于今天），提一句有几个，但不要现在就开始测验。

不要罗列整个进度，那是 `/aizhi:progress` 的事。

## 2. 接着上次的活动

根据 `last_session.activity`，读取对应命令的说明文件，然后**按那个文件的规则**直接接着做：

| activity | 说明文件 | 从哪里接 |
|---|---|---|
| debate | `${CLAUDE_PLUGIN_ROOT}/commands/debate.md` | 最近一次辩论的 `unresolved` 中的第一个问题。先简述学生上次的最终论证，然后直接就这个问题提问。 |
| explain | `${CLAUDE_PLUGIN_ROOT}/commands/explain.md` | 上次讲解结尾“延伸”里最相关的概念，或者上次讲解暴露的薄弱点。先问学生要不要讲这个，学生同意后再讲。 |
| quiz | `${CLAUDE_PLUGIN_ROOT}/commands/quiz.md` | 上次测验中“未掌握”的主题，针对它们的 `weak_points` 出题。 |
| read | `${CLAUDE_PLUGIN_ROOT}/commands/read.md` | 最近一次阅读记录的 `position` 的下一段。 |
| compare | `${CLAUDE_PLUGIN_ROOT}/commands/compare.md` | 最近一次比较的 `open_questions` 中的第一个问题。先简述上次的对应点和分歧，然后问学生想就这个问题继续比较，还是转入 `/aizhi:debate`。 |

说明文件读不到时（例如该命令还没有写好），就告诉学生上次停在哪里，并给出可以直接用的命令，然后停下。

## 3. 让学生可以改主意

在开始之前，用一句话告诉学生：如果想做别的，可以直接说，或者用 `/aizhi:quiz` 先做到期的复习。

活动结束后的进度记录，按对应命令说明文件中的规则进行。
