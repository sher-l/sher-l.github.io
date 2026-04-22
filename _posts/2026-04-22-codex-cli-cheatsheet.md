---
layout: post
title: "Codex CLI 指令速查表"
date: 2026-04-22
updated: 2026-04-22
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

## oh-my-codex 是什么

`oh-my-codex`，简称 **OMX**，不是用来替代 Codex CLI 的。

它本质上是套在 Codex CLI 外面的一层工作流和编排层，重点解决的是：

- 把多阶段工作流固定下来
- 给 Codex 补一套更强的 prompts / skills / roles
- 把状态、计划、日志、记忆写进 `.omx/`
- 在任务变复杂时，用团队化、多代理和持久化执行来兜住流程

仓库：
[Yeachan-Heo/oh-my-codex](https://github.com/Yeachan-Heo/oh-my-codex)

官方 README 里说得很明确：OMX 更推荐的默认路径是 **macOS / Linux + Codex CLI**。原生 Windows 和 Codex App 不是它的主支持路径，可能会有不一致行为。这点在 Windows 上折腾前最好先想清楚。

### 它适合谁

适合下面这类人：

- 已经在用 Codex CLI
- 不满足于“单轮问答式”协作
- 想把澄清、规划、执行、验证串成固定流程
- 想把团队代理和长期状态管理也一起接进去

如果你只想用最干净的原生 Codex CLI，不想引入额外工作流层，那不一定需要 OMX。

### 安装

README 里的推荐安装方式是：

```bash
npm install -g @openai/codex oh-my-codex
```

如果你想直接按它推荐的默认强配置启动：

```bash
omx --madmax --high
```

但这里要说清楚：

- `--madmax` 在 OMX 里会映射到非常激进的运行方式
- 这更像是“我知道自己在做什么”的模式
- 日常项目不要不看环境就直接裸开

### 初次使用建议

README 里给的更稳妥路径大致是：

```bash
omx setup
omx doctor
codex login status
omx exec --skip-git-repo-check -C . "Reply with exactly OMX-EXEC-OK"
```

这组命令的目的分别是：

- `omx setup`
  安装 prompts、skills、AGENTS 脚手架、`.codex/config.toml`、`.omx/` 运行目录等
- `omx doctor`
  检查 OMX 的安装结构和运行前提
- `codex login status`
  检查 Codex 本体是不是已经登录可用
- `omx exec ...`
  做一次真实请求，验证当前 shell 环境下 Codex 是否真的能调用模型

这个顺序很重要。只跑 `omx doctor` 绿了，不等于真正执行一定没问题。

### 一套典型的 OMX 工作流

仓库里反复强调的主路径是：

```text
$deep-interview "clarify the authentication change"
$ralplan "approve the auth plan and review tradeoffs"
$ralph "carry the approved plan to completion"
$team 3:executor "execute the approved plan in parallel"
```

可以粗暴理解为：

- `$deep-interview`
  先把范围、边界、非目标问清楚
- `$ralplan`
  把问题收敛成一个批准过的实现计划
- `$ralph`
  单代理持续推进直到完成
- `$team`
  多代理并行推进

### 常见 `omx` 命令

README 和文档里高频提到的有这些：

- `omx`
  直接启动带 OMX 工作流层的 Codex 会话
- `omx setup`
  安装或刷新 OMX 的 prompts / skills / config / AGENTS / `.omx/`
- `omx doctor`
  检查安装和运行条件
- `omx exec`
  非交互执行一段任务
- `omx update`
  更新 OMX 并重跑 setup 刷新路径
- `omx team ...`
  团队模式，适合并行执行
- `omx hud --watch`
  看运行态和监控信息
- `omx wiki ...`
  操作本地 wiki / 状态数据

### 对我的判断

如果只是个人开发、临时修 bug、写点脚本：

- 原生 Codex CLI 就够了

如果你开始碰到下面这些情况：

- 需求要先澄清再规划
- 一个任务跨很多模块
- 想保留计划、日志、长期状态
- 想把多代理执行纳入固定套路

那才值得考虑 OMX。

---

## 按 `--help` 理解 Codex 命令

这里我用的是两类来源：

- 官方命令行参考文档
- 本机已安装的 Codex 版本信息

我本机当前识别到的 `codex.exe` 版本是 `0.122.0-alpha.13`。但当前这个 Windows 环境下直接执行 `codex --help` 被系统拒绝访问，所以这一节的参数说明以官方 CLI Reference 为准。

### 顶层命令可以先记这些

- `codex`
  进入交互式 TUI，会话主入口
- `codex exec`
  非交互执行，适合脚本、CI、一次性自动化
- `codex resume`
  恢复旧会话
- `codex fork`
  从旧会话分叉一个新线程
- `codex login`
  登录 CLI
- `codex logout`
  清理登录凭据
- `codex mcp`
  管理 MCP 服务器
- `codex mcp-server`
  把 Codex 自己作为 MCP server 跑起来
- `codex sandbox`
  用 Codex 自己的沙盒策略执行命令
- `codex features`
  查看和切换 feature flags
- `codex plugin marketplace`
  管理插件市场源

### 交互式 `codex` 常用全局参数

- `--ask-for-approval, -a untrusted | on-request | never`
  控制命令执行前什么时候停下来等你确认
- `--sandbox, -s read-only | workspace-write | danger-full-access`
  控制模型生成命令时的文件系统权限
- `--full-auto`
  快捷组合，相当于低摩擦本地工作预设
  说明：会把审批设成 `on-request`，沙盒设成 `workspace-write`
- `--dangerously-bypass-approvals-and-sandbox, --yolo`
  绕过审批和沙盒，只适合你明确加固过的隔离环境
- `--model, -m`
  临时覆盖模型
- `--profile, -p`
  读取 `config.toml` 里的某个 profile
- `--cd, -C`
  启动前切换工作目录
- `--add-dir`
  给额外目录写权限，不必把整个沙盒直接放到 `danger-full-access`
- `--search`
  开启实时网页搜索
- `--image, -i`
  给首条消息附图
- `--config, -c key=value`
  临时覆写配置
- `--oss`
  用本地开源模型 provider，通常对应 Ollama
- `--remote`
  连接远程 app-server
- `--remote-auth-token-env`
  从环境变量里取远程连接 token
- `--no-alt-screen`
  关闭 TUI 的 alternate screen

### `codex exec`

`codex exec` 适合：

- 脚本
- CI
- 一次性自动化
- 想拿结构化输出的场景

高频参数：

- `--cd, -C`
  执行前切换工作目录
- `--color always | never | auto`
  控制 stdout 色彩
- `--full-auto`
  自动化预设
- `--dangerously-bypass-approvals-and-sandbox, --yolo`
  高风险全放开
- `--ephemeral`
  不把 rollout session 文件持久化到磁盘
- `--json`
  用 JSONL 事件流输出，适合脚本消费
- `--output-last-message, -o`
  把最终自然语言回复写入文件
- `--output-schema`
  给最终输出加 JSON Schema 约束
- `--model, -m`
  覆盖模型
- `--profile, -p`
  指定配置 profile
- `--sandbox, -s`
  指定 exec 时的沙盒模式
- `--skip-git-repo-check`
  允许不在 Git 仓库里运行
- `--config, -c`
  临时配置覆盖
- `PROMPT`
  任务本体；也可以用 `-` 从 stdin 读

对应的恢复子命令：

```bash
codex exec resume --last
codex exec resume <SESSION_ID>
```

含义：

- `--last`
  恢复当前目录最近一次 exec 会话
- `--all`
  跨目录找最近会话

### `codex resume`

这个是交互式会话恢复，不是 `exec` 的恢复。

常用形式：

```bash
codex resume --last
codex resume <SESSION_ID>
```

含义：

- `--last`
  当前工作目录里最近的会话
- `--all`
  会把其他目录的会话也纳入候选
- `SESSION_ID`
  明确恢复指定会话

### `codex fork`

适合这种场景：

- 老会话还想保留
- 但你想从某个历史节点分叉新路线

常用形式：

```bash
codex fork --last
codex fork <SESSION_ID>
```

含义：

- 默认会打开 session picker
- `--last` 直接分叉最近会话
- `--all` 让 picker 看见其他目录的会话

### `codex login`

官方说明里主要有三种入口：

- 默认浏览器 OAuth
- `--device-auth`
  用设备码登录
- `--with-api-key`
  从 stdin 读 API key

状态检查：

```bash
codex login status
```

这个命令在自动化脚本里很有用，因为登录状态正常时会返回 `0`。

### `codex sandbox`

这个命令是拿 Codex 自己内部用的沙盒策略去跑一个外部命令。

你可以把它理解成：

- 不是让模型干活
- 而是你手动借用 Codex 的沙盒来执行命令

官方文档里分别给了：

- macOS Seatbelt
- Linux Landlock

常见参数：

- `--config, -c`
  运行前临时改沙盒配置
- `--full-auto`
  给当前 workspace 和 `/tmp` 开写权限
- `COMMAND...`
  真正要在沙盒里执行的命令

### `codex mcp`

这是 MCP 管理面，主要用于：

- 列出服务器
- 添加服务器
- 删除服务器
- 做认证

如果你后面开始认真用外部工具链、文档连接器、知识库或者自定义 server，这条命令会越来越重要。

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
