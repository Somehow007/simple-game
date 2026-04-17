# 数独游戏 - 项目文档

## 1. 项目概述

**数独** 是一款跨平台数独游戏，当前已完成 Web 版本。采用 Monorepo 架构，核心引擎与 UI 组件完全复用，为后续桌面端（Tauri）和移动端（Capacitor）开发奠定基础。

### 当前完成状态

| 阶段 | 状态 | 说明 |
|------|------|------|
| 阶段 0：项目初始化 | ✅ 完成 | Monorepo、TypeScript、ESLint、Turborepo、Vitest |
| 阶段 1：核心引擎 | ✅ 完成 | 求解器、生成器、校验器、笔记系统、撤销/重做 |
| 阶段 2：Web 版 | ✅ 完成 | 完整游戏界面、设置、统计、PWA |
| 阶段 3：桌面版 | ⏳ 待开发 | Tauri 2.0 |
| 阶段 4：iOS 版 | ⏳ 待开发 | Capacitor |
| 阶段 5：Android 版 | ⏳ 待开发 | Capacitor |

---

## 2. 技术架构

### 2.1 技术栈

| 层级 | 技术 | 版本 |
|------|------|------|
| 语言 | TypeScript | ^5.4.0 |
| UI 框架 | React | ^18.3.0 |
| 状态管理 | Zustand | ^4.5.0 |
| 样式方案 | Tailwind CSS + CSS 变量 | ^3.4.0 |
| 构建工具 | Vite | ^5.4.0 |
| PWA | vite-plugin-pwa | ^0.20.0 |
| 包管理 | pnpm workspace | ^9.1.0 |
| 构建编排 | Turborepo | ^2.0.0 |
| 测试框架 | Vitest | ^1.6.0 |

### 2.2 项目结构

```
shudu/
├── packages/
│   ├── core/                  # 核心引擎包（100% 跨平台复用）
│   │   └── src/
│   │       ├── types.ts       # 类型定义
│   │       ├── solver.ts      # 数独求解器
│   │       ├── generator.ts   # 谜题生成器
│   │       ├── validator.ts   # 规则校验器
│   │       ├── history.ts     # 撤销/重做逻辑
│   │       ├── notes.ts       # 笔记系统逻辑
│   │       └── index.ts       # 统一导出
│   │
│   ├── ui/                    # 共享 UI 组件包（~85% 复用）
│   │   └── src/
│   │       ├── components/
│   │       │   ├── Grid.tsx   # 9×9 数独网格
│   │       │   ├── Numpad.tsx # 数字面板
│   │       │   ├── Timer.tsx  # 计时器
│   │       │   ├── Toolbar.tsx# 工具栏
│   │       │   └── Dialog.tsx # 对话框 + 胜利弹窗
│   │       └── stores/
│   │           └── gameStore.ts  # Zustand 游戏状态管理
│   │
│   └── shared/                # 工具与常量包（100% 复用）
│       └── src/
│           ├── constants.ts   # 常量定义
│           ├── storage.ts     # 存储抽象层
│           └── i18n.ts        # 国际化基础
│
├── apps/
│   └── web/                   # Web 应用
│       ├── src/
│       │   ├── App.tsx        # 应用入口（游戏/设置/统计页面）
│       │   ├── main.tsx       # React 入口
│       │   └── index.css      # 全局样式 + 主题变量
│       ├── public/
│       │   └── favicon.svg    # 网站图标
│       ├── index.html         # HTML 模板
│       └── vite.config.ts     # Vite + PWA 配置
│
├── pnpm-workspace.yaml
├── turbo.json
├── tsconfig.base.json
└── package.json
```

---

## 3. 核心模块说明

### 3.1 @shudu/core - 核心引擎

纯逻辑层，无任何 UI 依赖，可在所有平台 100% 复用。

#### types.ts - 类型系统

| 类型 | 说明 |
|------|------|
| `CellValue` | 1-9 的数字 |
| `GridValue` | CellValue \| 0（0 表示空） |
| `CellPosition` | { row, col } 位置 |
| `CellNote` | { candidates: Set<CellValue> } 候选数 |
| `GridCell` | { value, isGiven, note } 单元格 |
| `SudokuGrid` | GridCell[][] 9×9 网格 |
| `Difficulty` | 'easy' \| 'medium' \| 'hard' \| 'expert' |
| `PuzzleData` | { grid, solution, difficulty, seed? } 谜题数据 |
| `GameMove` | 操作记录（用于撤销/重做） |
| `ValidationResult` | { isValid, isComplete, conflicts } 校验结果 |

#### solver.ts - 求解器

- `solve(grid)` - 求解数独，返回解或 null
- `countSolutions(grid, limit)` - 计算解的数量（用于唯一性验证）
- `isSolvable(grid)` - 是否可解
- `hasUniqueSolution(grid)` - 是否有唯一解

#### generator.ts - 谜题生成器

- `generate(difficulty)` - 生成指定难度的谜题
- `generateFromSeed(difficulty, seed)` - 基于种子生成确定性谜题

生成策略：完整解生成 → 随机挖洞 → 唯一解验证

难度与给定数字范围：

| 难度 | 给定数字数 | 预计完成时间 |
|------|-----------|-------------|
| 简单 | 36-45 | 5-15 分钟 |
| 中等 | 30-35 | 15-30 分钟 |
| 困难 | 27-29 | 30-60 分钟 |
| 专家 | 22-26 | 60+ 分钟 |

#### validator.ts - 校验器

- `validate(grid)` - 完整校验，返回 ValidationResult
- `validateCell(grid, position)` - 单元格冲突检测
- `findConflicts(grid)` - 查找所有冲突

#### history.ts - 撤销/重做

- `createHistory()` - 创建历史记录
- `pushMove(state, move)` - 记录操作
- `undo(state)` / `redo(state)` - 撤销/重做
- `canUndo(state)` / `canRedo(state)` - 是否可撤销/重做

#### notes.ts - 笔记系统

- `createEmptyNote()` - 创建空笔记
- `toggleCandidate(note, value)` - 切换候选数
- `addCandidate` / `removeCandidate` - 添加/移除候选数
- `clearNote` - 清空笔记
- `getCandidates(note)` - 获取排序后的候选数列表

### 3.2 @shudu/ui - 共享 UI 组件

#### gameStore.ts - 游戏状态管理

基于 Zustand，管理全部游戏状态：

**状态：**
- `grid` / `solution` - 当前网格和答案
- `selectedCell` - 选中单元格
- `history` - 操作历史
- `elapsedTime` / `isPaused` / `isCompleted` - 计时与状态
- `mistakes` / `hintsUsed` - 错误与提示计数
- `settings` - 游戏设置（持久化到 localStorage）
- `statistics` - 游戏统计（持久化到 localStorage）
- `isNoteMode` - 笔记模式开关

**操作：**
- `newGame(difficulty)` - 开始新游戏
- `selectCell(position)` - 选中单元格
- `setValue(value)` - 填入数字
- `clearValue()` - 清除数字
- `toggleNote(value)` - 切换候选数
- `toggleNoteMode()` - 切换笔记模式
- `undo()` / `redo()` - 撤销/重做
- `getHint()` - 获取提示
- `updateSettings(settings)` - 更新设置

#### UI 组件

| 组件 | 说明 |
|------|------|
| `Grid` | 9×9 数独网格，支持选中高亮、同行列宫高亮、相同数字高亮、错误标记、笔记显示 |
| `Numpad` | 数字面板（1-9），显示每个数字已使用数量，笔记模式切换，擦除按钮 |
| `Timer` | 游戏计时器，支持暂停/恢复 |
| `Toolbar` | 工具栏：撤销、重做、提示、暂停、难度选择 |
| `Dialog` | 通用对话框组件 |
| `WinDialog` | 完成游戏弹窗，显示用时、错误数、提示数 |

### 3.3 @shudu/shared - 共享工具

| 模块 | 说明 |
|------|------|
| `constants.ts` | 应用名称、存储键名、难度标签、主题选项、输入模式 |
| `storage.ts` | `IStorageAdapter` 接口 + `BrowserStorageAdapter`（localStorage 实现） |
| `i18n.ts` | 国际化基础框架（注册语言包、翻译函数） |

---

## 4. Web 版功能清单

### 4.1 游戏核心功能

| 功能 | 状态 | 说明 |
|------|------|------|
| 数独网格交互 | ✅ | 点击选中、高亮同行列宫 |
| 数字输入 | ✅ | 1-9 数字面板，显示已用数量 |
| 笔记模式 | ✅ | 切换笔记/普通模式，候选数显示 |
| 擦除 | ✅ | 清除已填数字 |
| 撤销/重做 | ✅ | 无限撤销重做 |
| 提示 | ✅ | 自动填入正确数字 |
| 暂停/继续 | ✅ | 暂停时模糊网格 |
| 错误检测 | ✅ | 实时标记错误数字 |
| 自动清除笔记 | ✅ | 填入数字时自动移除相关候选数 |
| 完成检测 | ✅ | 自动检测完成并弹出胜利对话框 |

### 4.2 难度系统

| 功能 | 状态 | 说明 |
|------|------|------|
| 4 个难度等级 | ✅ | 简单/中等/困难/专家 |
| 难度切换 | ✅ | 工具栏一键切换 |
| 唯一解保证 | ✅ | 所有生成的谜题保证唯一解 |

### 4.3 计时系统

| 功能 | 状态 | 说明 |
|------|------|------|
| 游戏计时 | ✅ | 实时计时显示 |
| 暂停计时 | ✅ | 暂停时停止计时 |
| 最佳记录 | ✅ | 按难度记录最佳时间 |

### 4.4 设置系统

| 功能 | 状态 | 说明 |
|------|------|------|
| 主题切换 | ✅ | 亮色/暗色 |
| 高亮错误 | ✅ | 可开关 |
| 高亮相同数字 | ✅ | 可开关 |
| 自动清除笔记 | ✅ | 可开关 |
| 显示计时器 | ✅ | 可开关 |
| 设置持久化 | ✅ | localStorage 存储 |

### 4.5 统计系统

| 功能 | 状态 | 说明 |
|------|------|------|
| 已玩局数 | ✅ | |
| 胜利局数 | ✅ | |
| 胜率 | ✅ | |
| 连胜记录 | ✅ | 当前连胜 + 最佳连胜 |
| 最佳时间 | ✅ | 按难度记录 |
| 难度分布 | ✅ | 可视化柱状图 |
| 统计持久化 | ✅ | localStorage 存储 |

### 4.6 PWA 支持

| 功能 | 状态 | 说明 |
|------|------|------|
| 可安装到桌面 | ✅ | Web App Manifest |
| 离线可玩 | ✅ | Service Worker 缓存 |
| 自动更新 | ✅ | autoUpdate 注册策略 |

### 4.7 响应式设计

| 功能 | 状态 | 说明 |
|------|------|------|
| 桌面端适配 | ✅ | |
| 平板适配 | ✅ | |
| 手机适配 | ✅ | 触控优化、紧凑布局 |

---

## 5. 构建产物

| 文件 | 大小 | Gzip |
|------|------|------|
| index.html | 0.99 KB | 0.52 KB |
| CSS | 17.13 KB | 3.91 KB |
| JS | 166.78 KB | 53.01 KB |
| SW + Workbox | ~20 KB | - |

---

## 6. 测试覆盖

### 核心引擎测试

| 测试文件 | 测试数量 | 覆盖内容 |
|---------|---------|---------|
| solver.test.ts | 12 | 求解、解数量、可解性、唯一解 |
| generator.test.ts | 7 | 各难度生成、唯一解、种子确定性 |
| validator.test.ts | 10 | 完整校验、行/列/宫冲突 |
| history.test.ts | 8 | 创建、记录、撤销、重做 |
| notes.test.ts | 11 | 候选数增删改查、清空、批量操作 |

---

## 7. 待开发功能（后续阶段）

### P1 优先级

- [ ] 键盘快捷键支持（1-9 填数、Delete 清除、Ctrl+Z/Y 撤销重做）
- [ ] 游戏状态自动保存/恢复
- [ ] 逻辑推理提示（不仅是直接填数）

### P2 优先级

- [ ] 每日挑战
- [ ] 成就系统
- [ ] 多种数独变体
- [ ] 国际化（中/英/日/韩/法/德/西）
- [ ] 桌面端（Tauri 2.0）
- [ ] iOS 端（Capacitor）
- [ ] Android 端（Capacitor）
