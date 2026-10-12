---
name: progress
description: 爱智插件的学习进度文件规范。在读取或更新学生的学习进度（已学概念、阅读位置、辩论记录、薄弱点、复习计划）时使用。
---

# 学习进度文件规范

## 位置

进度存放在**当前工作文件夹**下的 `.aizhi/progress.yaml`。每个文件夹独立记录，例如一门课一个文件夹。不要读写其他文件夹的进度。

文件不存在时，第一次需要写入时再创建，不要提前建空文件。

## 格式

```yaml
# 爱智学习进度
topics:
  - id: kant.thing-in-itself          # 哲学家或传统.概念，小写英文或拼音，连字符分隔
    name: 物自体（Ding an sich）
    tradition: 西方/德国古典哲学
    first_learned: 2026-10-07
    last_reviewed: 2026-10-07
    mastery: 1                         # 0-4，见下文
    next_review: 2026-10-09
    weak_points:
      - 混淆物自体与本体（noumenon）的消极义和积极义
    review_questions:                  # 讲解时生成的复习题，供 /quiz 使用
      - 为什么康德说物自体“可思而不可知”？这与他的范畴理论有什么关系？

readings:
  - text: 纯粹理性批判
    edition: 邓晓芒译本
    file: 纯粹理性批判.pdf              # 学生自己的 PDF，没有就省略
    index: .aizhi/texts/kant-kritik.yaml   # /aizhi:read 建的索引，没有就省略
    section: 先验感性论 §3                # 当前章节，可省略
    position: A42/B59                  # 下次要读的起点，使用该文本的标准页码体系，没有就写书页
    pdf_page: 87
    last_read: 2026-10-07
    notes:
      - 先验感性论结论部分，空间观念性论证尚未重构完毕

debates:
  - thesis: 道德实在论成立
    date: 2026-10-07
    student_position: 支持
    final_argument: |
      P1 …
      P2 …
      C …
    unresolved:
      - 未能回应摩尔开放问题论证
    related_topics: [moore.open-question]

comparisons:
  - a: 亚里士多德的德性（aretē）
    b: 儒家的德
    date: 2026-10-07
    correspondence: 都关乎品格的养成，且都与实践智慧（phronēsis / 智）相连
    divergence: 亚里士多德以 eudaimonia 为目的论框架；儒家的德与天命、礼和政治教化相连
    open_questions:
      - 儒家伦理能否归入德性伦理学？
    related_topics: [aristotle.arete, confucian.de]

last_session:
  date: 2026-10-07
  activity: debate                     # explain | read | debate | compare | quiz
  summary: 讨论道德实在论，停在对开放问题论证的回应上
```

## 掌握度与复习间隔

| mastery | 含义 | 下次复习间隔 |
|---|---|---|
| 0 | 刚接触，或测验中出现明显误解 | 1 天 |
| 1 | 能复述，但辨析和应用不稳 | 2 天 |
| 2 | 能准确辨析相邻概念 | 4 天 |
| 3 | 能在论证中正确运用，并回应常见反驳 | 8 天 |
| 4 | 能评估不同解读立场，并自行构造论证 | 16 天 |

- 讲解完一个新概念：mastery 设为 0，`next_review` 为次日。
- 测验答得好：mastery 加 1；答错或暴露误解：mastery 减 1（最低 0），并把误解写入 `weak_points`。
- 辩论中暴露的薄弱点，写入相关 topic 的 `weak_points`；相关 topic 不存在时，新建一个 mastery 为 0 的条目。

## 更新原则

- 每次活动结束时更新，并同时更新 `last_session`。
- 只追加或修改相关条目，不重写、不删除无关内容。
- `weak_points` 要写具体：写清是哪个区分没做出、哪一步推论有问题，不写“理解不够”这类空话。
- 更新后用一句话告诉学生记了什么，不要把整个文件贴出来。
