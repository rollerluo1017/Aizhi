# 爱智（aizhi）

面向哲学专业学生的 Claude Code 插件。以中文讲解、保留关键术语原词，提供概念精讲、苏格拉底式对话、原著导读、跨传统比较、测验复习和学习进度追踪，覆盖西方哲学、中国哲学、印度与佛教哲学。

它面向已有基础的学生，目标是帮你读得更深、想得更严密，而不是普及常识。插件不提供论文代写或论文辅导。

## 命令

| 命令 | 作用 |
|---|---|
| `/aizhi:explain <概念>` | 概念精讲：原词与译名、问题语境、概念史、解读争议、常见误读 |
| `/aizhi:debate <论题或立场>` | 苏格拉底式对话：追问预设和含混，站在对立面反驳，结束时重构你的论证 |
| `/aizhi:read <文本> [位置]` | 原著导读：逐段带读你自己的 PDF，重构论证，对照研究性解读 |
| `/aizhi:compare <A> <B>` | 跨传统比较，例如亚里士多德的德性与儒家的德 |
| `/aizhi:quiz [范围]` | 测验与复习：辨析、论证重构、立场比较、原文定位，按掌握度安排复习 |
| `/aizhi:progress` | 查看学习进度、到期复习和反复出现的薄弱点 |
| `/aizhi:resume` | 从上次停下的地方继续 |

## 安装

需要先装好 [Claude Code](https://code.claude.com)。在终端里依次运行：

```
claude plugin marketplace add <GitHub用户名>/<仓库名>
claude plugin install aizhi@aizhi-local
```

终端、Claude 桌面应用的 Code 标签页（本地会话）和 VS Code 扩展共用同一份设置，在任意一处装好，其他两处都能用。装好后新开一个会话，输入 `/aizhi` 就能看到全部命令。

以后更新插件：

```
claude plugin marketplace update aizhi-local
claude plugin update aizhi@aizhi-local
```

## 怎么用

1. 给一门课或一个主题建一个文件夹，在那里启动 Claude Code（桌面应用里选这个文件夹作为项目文件夹）。
2. 要读原著，把书的 PDF 放进这个文件夹，然后运行 `/aizhi:read 书名`。
3. 学习记录保存在这个文件夹的 `.aizhi/` 里（隐藏文件夹，Finder 里按 ⌘⇧. 显示）。不同文件夹的进度互不相干。

插件不附带任何书籍或译文，原著只读你自己放进文件夹的 PDF。

## 读 PDF 需要什么

`/aizhi:read` 用插件自带的 `scripts/pdftext.js` 提取 PDF 文字：

- **macOS**：不用另外安装任何东西。脚本通过系统自带的 `osascript` 运行，用 PDFKit 取文字层；扫描版 PDF 用系统自带的 Vision 框架做文字识别（OCR），支持简体中文、繁体中文、英文和德文。中文识别需要 macOS 11 或更新的版本。识别结果缓存在 `.aizhi/texts/`，同一页不会重复识别。
- **Windows 和 Linux**：脚本用不了。有文字层的 PDF 由 Claude 直接读取；扫描版需要你把要读的段落贴进对话。

其余命令没有任何系统要求。

## 文件结构

```
.claude-plugin/plugin.json        插件信息
.claude-plugin/marketplace.json   安装源，让别人可以用上面的命令安装
commands/                         七个命令，每个文件一个
skills/progress/SKILL.md          学习进度文件的格式和更新规则
scripts/pdftext.js                PDF 取字和 OCR
CLAUDE.md                         开发时看的设定说明，不随插件加载
```

每个命令都是一份中文写的说明文件，想调整插件的行为，直接改对应的文件即可。
