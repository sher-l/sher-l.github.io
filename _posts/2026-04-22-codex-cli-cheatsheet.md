---
layout: post
title: "Codex CLI 指令速查表"
date: 2026-04-22
categories: [codex, cli]
description: "Codex CLI 的安装、登录、常用快捷键、斜杠命令、启动参数、AGENTS.md 与配置速查。"
---

这篇是按自己的使用场景整理的 **Codex CLI 速查版**，方便以后少翻文档、少踩坑。

不是原文转载，主要依据这篇社区帖子做了重写整理：
[Codex CLI 指令速查表 - TRAE 官方中文社区](https://forum.trae.cn/t/topic/1524)

另外也建议直接对照官方文档一起看：

- [OpenAI Codex CLI 文档](https://developers.openai.com/codex/cli)
- [CLI 命令参考](https://developers.openai.com/codex/cli/reference)
- [配置参考](https://developers.openai.com/codex/cli/config)
- [AGENTS.md 指南](https://developers.openai.com/codex/cli/agents-md)
- [openai/codex](https://github.com/openai/codex)

## 先说结论

- 日常开发优先用 `workspace-write`
- 想省确认次数就用 `--full-auto`
- Windows 上优先走 **WSL2**
- 新项目第一件事基本就是 `/init`
- 聊久了记得 `/compact`

---

## 安装与登录

### 前提

- Node.js 版本至少要够新
- 账号侧通常需要可用的 ChatGPT 订阅

### macOS / Linux

```bash
npm i -g @openai/codex
codex --version
```

如果是 macOS，也可以装桌面应用版本。

### Windows

Windows 上能跑，但更推荐 **WSL2**。

原因很简单：

- 兼容性更稳
- 工具链更接近 Linux 服务器环境
- 文件、Git、测试和容器体验更好

WSL2 的常见流程：

```powershell
wsl --install
wsl --set-default-version 2
```

进入 Ubuntu 之后，再装 Node 和 Codex CLI。

### 登录

常用方式：

```bash
codex
codex login
codex login --device-code
```

如果是在远程机、SSH 或没有浏览器的环境里，`--device-code` 会更省事。

---

## Windows 常见坑

### 1. 项目别放在 `/mnt/c/...`

如果你在 WSL 里开发，项目最好放在 Linux 文件系统里，例如：

```bash
mkdir -p ~/code
cd ~/code
git clone <repo>
```

别把主要工作目录长期放在 `/mnt/c/...` 下，不然 IO、Git、测试都会慢。

### 2. 登录弹不出浏览器

- 直接复制终端里的链接到 Windows 浏览器打开
- 或者改用 `codex login --device-code`

### 3. 原生 Windows 偶发权限问题

如果不用 WSL，而是直接 PowerShell 跑，偶尔会遇到权限或沙盒相关问题。这个时候优先考虑：

- 先确认 Node 版本
- 再确认当前终端权限
- 还不稳就切回 WSL2

---

## 快捷键

### 基础

- `Enter` 发送
- `Esc` 取消当前请求
- `Esc Esc` 编辑上一条消息
- `Ctrl+C` 中断
- `Ctrl+C Ctrl+C` 强制退出
- `Ctrl+D` 退出
- `Ctrl+K` 清屏

### 常用到离谱的几个

- `Up / Down` 翻输入历史
- `Tab` 自动补全
- `@` 引用文件
- `!command` 直接内联跑命令

我自己最常用的是 `@文件` 和 `!命令`，这两个能少很多来回切换。

---

## 会话里的斜杠命令

### 会话控制

- `/compact` 压缩上下文
- `/diff` 查看当前改动
- `/review` 让另一个代理做代码审查
- `/resume` 恢复历史会话
- `/fork` 从当前会话分叉
- `/plan` 只规划不执行
- `/quit` 或 `/exit` 退出

### 配置与模型

- `/model`
- `/personality`
- `/permissions`
- `/status`
- `/agent`
- `/experimental`

### 工具类

- `/init`
- `/skills`
- `/mcp`
- `/theme`
- `/statusline`
- `/debug-config`

### 持久化

- `/export session.json`
- `/load session.json`

---

## 启动参数

### 最常用

```bash
codex
codex "你的任务"
codex exec "任务"
codex resume --last
codex fork --last
```

### 模型与行为

```bash
codex --model <model>
codex --full-auto
codex -a on-request
codex -a never
codex --path <dir>
codex --add-dir <path>
codex --search
codex -c key=value
```

---

## 沙盒与审批

我自己对这块的理解很简单：

- **Sandbox** 决定你“物理上能做什么”
- **Approval** 决定你“流程上要不要先问人”

### 沙盒模式

- `read-only`
- `workspace-write`
- `danger-full-access`

如果只是正常改项目，`workspace-write` 基本就是默认优选。

### 自动化模式

- `--full-auto`：自动执行，但还有沙盒兜底
- `--yolo`：审批和沙盒都基本放开

日常建议优先：

```bash
codex exec --full-auto "fix the failing tests"
```

`--yolo` 更适合隔离好的容器、虚拟机或一次性实验环境。

---

## AGENTS.md

### 这是干嘛的

它就是项目指令文件。你可以把这些东西写进去：

- 技术栈
- 目录结构
- 编码约定
- 测试方式
- 提交习惯
- 任何希望代理默认遵守的规则

### 使用建议

新项目起手式基本是：

```text
/init
```

然后手动补充：

- 这个仓库怎么跑
- 改代码前先看哪几个目录
- 哪些命令可以验证
- 哪些文件不能乱动

### 查找顺序

大意就是：**越靠近当前工作目录的 AGENTS.md，优先级越高**。

---

## 配置文件

Codex CLI 用的是 TOML，常见位置在：

```text
~/.codex/config.toml
```

比较常用的配置项通常包括：

- `model`
- `model_provider`
- `sandbox_mode`
- `web_search`
- `instructions`
- `review_model`

如果你要接第三方兼容接口，也是在这里配 provider。

---

## 我自己会怎么用

### 新项目

1. 进入目录
2. `codex`
3. `/init`
4. 先读代码，再给任务

### 大任务

1. 先 `/plan`
2. 看方案是否靠谱
3. 再给写权限或切自动化

### 长对话

- 阶段性 `/compact`
- 重要文件尽量 `@` 引用
- 改完随时 `/diff`

---

## 懒人速查

### 每天高频

- 开始干活：`codex`
- 接着昨天继续：`codex resume --last`
- 快速问一个问题：`codex exec "..." `
- 看改动：`/diff`
- 看状态：`/status`
- 代码审查：`/review`

### 自动执行选择

- 保守：默认交互式
- 实用：`--full-auto`
- 风险高：`danger-full-access`
- 真正裸奔：`--yolo`

---

## 和 Claude Code 的几个直观差别

我自己最在意的是这几条：

- Codex CLI 的项目指令文件是 `AGENTS.md`
- 配置是 TOML，不是 JSON
- 自带沙盒设计是它的一个核心特点
- 恢复会话更偏 `codex resume --last` 这一路

如果只是粗暴对比：

- 想要更强的“安全兜底”时，Codex CLI 很有优势
- 想要更快上手和更顺手的终端交流体验，另一些工具会更讨喜

---

## 最后

如果只是想先稳定用起来，我自己的最小建议是：

1. 用 WSL2
2. 项目放 Linux 文件系统
3. 新仓库先 `/init`
4. 日常用 `workspace-write`
5. 自动执行先从 `--full-auto` 开始

原帖作者整理得很细，这篇更像是我自己会长期留着查的“压缩版 + 重写版”。
