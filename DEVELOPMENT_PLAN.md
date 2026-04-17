# 数独游戏跨平台开发计划

## 1. 项目概述

### 1.1 游戏核心功能

| 功能模块 | 功能描述 | 优先级 |
|---------|---------|--------|
| 数独核心引擎 | 标准数独规则校验、谜题生成、求解算法 | P0 |
| 谜题生成器 | 支持多难度等级（简单/中等/困难/专家）的谜题生成，确保唯一解 | P0 |
| 游戏界面 | 9×9 网格交互、数字输入、笔记模式、撤销/重做 | P0 |
| 游戏状态管理 | 自动保存、继续游戏、新游戏 | P0 |
| 计时系统 | 游戏计时、暂停/恢复、最佳记录 | P1 |
| 提示系统 | 错误检查、单元格提示、逻辑推理提示 | P1 |
| 统计系统 | 游戏历史、胜率统计、难度分布、连续记录 | P1 |
| 自定义设置 | 主题切换（亮色/暗色）、音效开关、输入模式切换 | P1 |
| 每日挑战 | 每日推送一道特定谜题，全球排名 | P2 |
| 成就系统 | 解锁成就、里程碑奖励 | P2 |
| 多种变体 | 对角线数独、不规则数独、迷你数独 | P2 |

### 1.2 目标用户群体

- **核心用户**：数独爱好者，年龄 25-65 岁，偏好逻辑推理类游戏
- **休闲用户**：寻求日常脑力锻炼的普通用户
- **进阶用户**：追求高难度挑战和竞技排名的资深玩家
- **入门用户**：对数独感兴趣但尚未掌握技巧的新手

### 1.3 各平台版本预期特性

| 平台 | 预期特性 | 差异化功能 |
|------|---------|-----------|
| **Web** | 完整游戏功能、响应式布局、PWA 支持 | 无需安装、URL 分享、SEO 可发现性 |
| **Windows** | 原生窗口体验、离线运行、系统托盘 | 键盘快捷键、本地文件存储、系统通知 |
| **macOS** | 原生窗口体验、离线运行、菜单栏集成 | Touch Bar 支持、Handoff、原生菜单 |
| **iOS** | 触控优化、离线运行、Widget | Apple Pencil 支持、iCloud 同步、3D Touch |
| **Android** | 触控优化、离线运行、Widget | 分屏支持、Material Design、Google Play 排行榜 |

---

## 2. 技术架构设计

### 2.1 技术栈选型

```
┌─────────────────────────────────────────────────────────┐
│                    跨平台共享层                           │
│  ┌───────────────────────────────────────────────────┐  │
│  │  核心引擎 (TypeScript)                             │  │
│  │  - 数独生成算法 / 求解器 / 规则校验 / 状态管理     │  │
│  └───────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────┐  │
│  │  共享 UI 组件 (React + TypeScript)                 │  │
│  │  - 游戏网格 / 数字面板 / 计时器 / 设置面板         │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
         │              │              │              │
    ┌────▼────┐   ┌────▼────┐   ┌────▼────┐   ┌────▼────┐
    │  Web    │   │ Desktop │   │  iOS    │   │ Android │
    │ Vite    │   │ Tauri   │   │Capacitor│   │Capacitor│
    │ React   │   │ React   │   │ React   │   │ React   │
    └─────────┘   └─────────┘   └─────────┘   └─────────┘
```

#### 核心技术栈

| 层级 | 技术 | 选型理由 |
|------|------|---------|
| **语言** | TypeScript | 类型安全、跨平台兼容、生态成熟 |
| **UI 框架** | React 18+ | 组件化开发、庞大生态、跨平台复用 |
| **状态管理** | Zustand | 轻量（~1KB）、TypeScript 友好、无 boilerplate |
| **样式方案** | Tailwind CSS | 原子化 CSS、响应式设计、主题切换便捷 |
| **构建工具** | Vite | 极速 HMR、原生 ESM、插件生态丰富 |
| **Web 打包** | Vite + PWA Plugin | 零配置 PWA、Service Worker 离线支持 |
| **桌面框架** | Tauri 2.0 | Rust 后端安全、体积小（~3MB）、原生性能 |
| **移动框架** | Capacitor 6 | Web 代码直接复用、原生插件桥接、官方维护 |
| **数据存储** | IndexedDB (Dexie.js) | 浏览器端结构化存储、跨平台兼容 |
| **测试框架** | Vitest + Playwright | 单元测试 + E2E 测试、Vite 原生集成 |
| **代码规范** | ESLint + Prettier | 统一代码风格、自动格式化 |

### 2.2 代码复用策略

```
shudu/
├── packages/
│   ├── core/                  # 核心引擎包（100% 复用）
│   │   ├── src/
│   │   │   ├── generator.ts   # 谜题生成算法
│   │   │   ├── solver.ts      # 求解器
│   │   │   ├── validator.ts   # 规则校验
│   │   │   ├── types.ts       # 类型定义
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── ui/                    # 共享 UI 组件包（~85% 复用）
│   │   ├── src/
│   │   │   ├── components/    # 通用组件
│   │   │   │   ├── Grid/      # 数独网格
│   │   │   │   ├── Numpad/    # 数字面板
│   │   │   │   ├── Timer/     # 计时器
│   │   │   │   ├── Toolbar/   # 工具栏
│   │   │   │   └── Dialog/    # 对话框
│   │   │   ├── hooks/         # 共享 Hooks
│   │   │   ├── stores/        # Zustand 状态
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── shared/                # 工具与常量包（100% 复用）
│       ├── src/
│       │   ├── storage.ts     # 存储抽象层
│       │   ├── i18n.ts        # 国际化
│       │   ├── constants.ts   # 常量定义
│       │   └── index.ts
│       ├── package.json
│       └── tsconfig.json
│
├── apps/
│   ├── web/                   # Web 应用
│   │   ├── src/
│   │   │   ├── App.tsx
│   │   │   ├── main.tsx
│   │   │   └── pages/
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   └── package.json
│   │
│   ├── desktop/               # 桌面应用 (Tauri)
│   │   ├── src/
│   │   │   ├── App.tsx
│   │   │   ├── main.tsx
│   │   │   └── platform/     # 桌面特有逻辑
│   │   ├── src-tauri/
│   │   │   ├── src/
│   │   │   │   └── main.rs
│   │   │   ├── Cargo.toml
│   │   │   └── tauri.conf.json
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   └── package.json
│   │
│   ├── ios/                   # iOS 应用 (Capacitor)
│   │   ├── src/
│   │   │   ├── App.tsx
│   │   │   ├── main.tsx
│   │   │   └── platform/     # iOS 特有逻辑
│   │   ├── ios/
│   │   │   └── App/
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   ├── capacitor.config.ts
│   │   └── package.json
│   │
│   └── android/               # Android 应用 (Capacitor)
│       ├── src/
│       │   ├── App.tsx
│       │   ├── main.tsx
│       │   └── platform/     # Android 特有逻辑
│       ├── android/
│       │   └── app/
│       ├── index.html
│       ├── vite.config.ts
│       ├── capacitor.config.ts
│       └── package.json
│
├── pnpm-workspace.yaml
├── turbo.json
├── package.json
└── tsconfig.base.json
```

#### 代码复用率预估

| 模块 | Web | Windows | macOS | iOS | Android |
|------|-----|---------|-------|-----|---------|
| 核心引擎 | 100% | 100% | 100% | 100% | 100% |
| UI 组件 | 100% | 90% | 90% | 80% | 80% |
| 状态管理 | 100% | 100% | 100% | 95% | 95% |
| 平台适配 | 0% | 15% | 15% | 20% | 20% |
| **综合复用率** | **基准** | **~85%** | **~85%** | **~80%** | **~80%** |

### 2.3 Monorepo 架构

采用 **pnpm workspace + Turborepo** 管理 Monorepo：

- **pnpm workspace**：包依赖管理、幽灵依赖隔离
- **Turborepo**：构建缓存、并行构建、任务编排
- **Changesets**：版本管理与 Changelog 生成

---

## 3. 开发阶段划分

### 阶段 0：项目初始化（1 周）

| 任务 | 交付物 | 验收标准 |
|------|--------|---------|
| 搭建 Monorepo 结构 | 项目骨架代码 | pnpm install 成功，所有包可构建 |
| 配置 TypeScript | tsconfig.base.json | 严格模式开启，路径别名配置完成 |
| 配置 ESLint + Prettier | .eslintrc.js, .prettierrc | lint 命令可运行 |
| 配置 Turborepo | turbo.json | turbo build 可并行构建所有包 |
| 配置 Vitest | vitest.config.ts | 测试框架可运行 |
| 配置 CI/CD (GitHub Actions) | .github/workflows/ | PR 自动 lint + test + build |
| 初始化 Git 仓库 | .gitignore, .git | 仓库可正常提交 |

### 阶段 1：核心引擎开发（2 周）

| 任务 | 交付物 | 验收标准 |
|------|--------|---------|
| 定义类型系统 | types.ts | 所有核心类型定义完成，导出正确 |
| 实现数独求解器 | solver.ts | 可在 <100ms 内求解任意合法数独 |
| 实现谜题生成器 | generator.ts | 可生成 4 个难度等级的谜题，保证唯一解 |
| 实现规则校验器 | validator.ts | 正确检测冲突、完成度、合法性 |
| 实现笔记系统逻辑 | notes.ts | 笔记的增删改查逻辑正确 |
| 实现撤销/重做逻辑 | history.ts | 支持无限撤销/重做，状态快照正确 |
| 核心引擎单元测试 | __tests__/ | 测试覆盖率 ≥ 95% |
| 性能基准测试 | benchmarks/ | 生成 1000 道谜题 < 1s |

### 阶段 2：Web 版开发（3 周）

| 任务 | 交付物 | 验收标准 |
|------|--------|---------|
| 游戏网格组件 | Grid.tsx | 9×9 网格渲染正确，支持选中/高亮 |
| 数字面板组件 | Numpad.tsx | 数字输入、擦除、笔记切换 |
| 计时器组件 | Timer.tsx | 计时/暂停/恢复功能正常 |
| 工具栏组件 | Toolbar.tsx | 撤销/重做/提示/新游戏 |
| 游戏状态管理 | gameStore.ts | Zustand store 完整，持久化正常 |
| 主题系统 | ThemeProvider | 亮色/暗色切换流畅 |
| 响应式布局 | CSS 布局 | 桌面/平板/手机三端适配 |
| 游戏页面 | GamePage.tsx | 完整游戏流程可运行 |
| 设置页面 | SettingsPage.tsx | 所有设置项可持久化 |
| 统计页面 | StatsPage.tsx | 数据展示正确 |
| PWA 配置 | manifest.json, SW | 可安装到桌面，离线可玩 |
| Web 版 E2E 测试 | e2e/ | 核心流程测试通过 |

### 阶段 3：桌面版开发（2 周）

| 任务 | 交付物 | 验收标准 |
|------|--------|---------|
| Tauri 项目初始化 | src-tauri/ | 可构建出 .exe / .dmg |
| 窗口管理 | main.rs | 窗口大小/标题/图标正确 |
| 本地存储适配 | storage adapter | 数据持久化至本地文件系统 |
| 键盘快捷键 | shortcuts | Ctrl+Z/Y/N 等快捷键可用 |
| 系统托盘 (Windows) | tray.rs | 最小化到托盘功能 |
| 菜单栏 (macOS) | menu.rs | 原生菜单栏集成 |
| 自动更新 | updater | 支持应用内更新检查 |
| 桌面版测试 | test/ | Windows 10/11 + macOS 13+ 测试通过 |

### 阶段 4：iOS 版开发（2 周）

| 任务 | 交付物 | 验收标准 |
|------|--------|---------|
| Capacitor 项目初始化 | ios/ | Xcode 项目可编译运行 |
| 触控交互优化 | touch handlers | 手势操作流畅，无延迟 |
| iOS 存储适配 | storage adapter | 数据持久化至 UserDefaults/文件系统 |
| iCloud 同步 | iCloud plugin | 跨设备数据同步 |
| Widget 支持 | WidgetKit | iOS 主屏 Widget 显示每日挑战 |
| App Store 资源 | 截图/描述/预览 | 符合 App Store 审核要求 |
| iOS 真机测试 | TestFlight | iPhone + iPad 真机测试通过 |

### 阶段 5：Android 版开发（2 周）

| 任务 | 交付物 | 验收标准 |
|------|--------|---------|
| Capacitor 项目初始化 | android/ | Android Studio 项目可编译运行 |
| Material Design 适配 | 主题/组件 | 符合 Material Design 规范 |
| Android 存储适配 | storage adapter | 数据持久化至 SharedPreferences/文件 |
| 分屏支持 | manifest 配置 | 支持分屏/自由窗口模式 |
| Widget 支持 | AppWidget | Android 桌面 Widget |
| Google Play 资源 | 截图/描述/预览 | 符合 Google Play 上架要求 |
| Android 真机测试 | 多设备测试 | 主流 Android 10+ 设备测试通过 |

### 阶段 6：优化与发布（2 周）

| 任务 | 交付物 | 验收标准 |
|------|--------|---------|
| 性能优化 | 优化报告 | 首屏加载 < 1s，交互延迟 < 100ms |
| 无障碍优化 | a11y 测试 | WCAG 2.1 AA 级合规 |
| 国际化 (i18n) | 多语言包 | 中/英/日/韩/法/德/西 7 语言 |
| 各平台打包发布 | 安装包/上架 | 全平台正式发布 |
| 用户反馈系统 | 反馈入口 | 应用内反馈渠道 |
| 崩溃监控 | Sentry 集成 | 崩溃上报正常 |

---

## 4. 里程碑规划

```
2026
 │
 ▼ M1: 项目启动 ─────────────────── 第 0 周
 │  ✓ Monorepo 搭建完成
 │  ✓ CI/CD 流水线就绪
 │  ✓ 开发规范确立
 │
 ▼ M2: 核心引擎就绪 ─────────────── 第 1 周
 │  ✓ 求解器 + 生成器完成
 │  ✓ 测试覆盖率 ≥ 95%
 │  ✓ 性能基准达标
 │
 ▼ M3: Web 版 Alpha ─────────────── 第 3 周
 │  ✓ 核心游戏流程可运行
 │  ✓ 基础 UI 组件完成
 │  ✓ 内部可体验
 │
 ▼ M4: Web 版 Beta ──────────────── 第 6 周
 │  ✓ 全部功能完成
 │  ✓ PWA 离线可用
 │  ✓ 响应式适配完成
 │  ✓ E2E 测试通过
 │
 ▼ M5: Web 版正式发布 ───────────── 第 7 周
 │  ✓ Web 版上线
 │  ✓ 性能优化完成
 │  ✓ SEO 优化完成
 │
 ▼ M6: 桌面版 Alpha ─────────────── 第 8 周
 │  ✓ Windows + macOS 可运行
 │  ✓ 原生集成基本完成
 │
 ▼ M7: 桌面版正式发布 ───────────── 第 9 周
 │  ✓ Windows .msi / .exe 发布
 │  ✓ macOS .dmg 发布
 │  ✓ 自动更新功能就绪
 │
 ▼ M8: iOS 版 Alpha ─────────────── 第 10 周
 │  ✓ iPhone + iPad 可运行
 │  ✓ 触控交互优化完成
 │
 ▼ M9: iOS 版正式发布 ───────────── 第 11 周
 │  ✓ App Store 审核通过
 │  ✓ iCloud 同步就绪
 │
 ▼ M10: Android 版 Alpha ────────── 第 12 周
 │  ✓ 主流设备可运行
 │  ✓ Material 适配完成
 │
 ▼ M11: Android 版正式发布 ──────── 第 13 周
 │  ✓ Google Play 上架
 │  ✓ Widget 功能就绪
 │
 ▼ M12: 全平台优化发布 ──────────── 第 14 周
    ✓ 全平台正式发布
    ✓ 国际化完成
    ✓ 监控体系就绪
```

### 里程碑时间表

| 里程碑 | 时间节点 | 关键交付物 | 验收标准 |
|--------|---------|-----------|---------|
| M1 项目启动 | 第 0 周 | 项目骨架、CI/CD | 所有包可构建，CI 流水线运行 |
| M2 引擎就绪 | 第 1 周 | 核心引擎包 | 测试覆盖率 ≥ 95%，性能达标 |
| M3 Web Alpha | 第 3 周 | 可运行 Web 版 | 核心游戏流程可体验 |
| M4 Web Beta | 第 6 周 | 功能完整 Web 版 | 全功能 + PWA + E2E 测试 |
| M5 Web 发布 | 第 7 周 | 正式 Web 版 | 上线可访问，性能达标 |
| M6 桌面 Alpha | 第 8 周 | 桌面内测版 | 双平台可运行 |
| M7 桌面发布 | 第 9 周 | 桌面正式版 | 安装包可分发 |
| M8 iOS Alpha | 第 10 周 | iOS 内测版 | TestFlight 可安装 |
| M9 iOS 发布 | 第 11 周 | iOS 正式版 | App Store 上架 |
| M10 Android Alpha | 第 12 周 | Android 内测版 | 主流设备可运行 |
| M11 Android 发布 | 第 13 周 | Android 正式版 | Google Play 上架 |
| M12 全平台优化 | 第 14 周 | 全平台最终版 | 国际化 + 监控 + 优化完成 |

---

## 5. 资源需求分析

### 5.1 开发工具

| 类别 | 工具 | 用途 | 费用 |
|------|------|------|------|
| **IDE** | VS Code | 日常开发 | 免费 |
| **桌面构建** | Rust toolchain | Tauri 编译 | 免费 |
| **iOS 构建** | Xcode | iOS 编译/调试 | 免费（需 Mac） |
| **Android 构建** | Android Studio | Android 编译/调试 | 免费 |
| **设计** | Figma | UI/UX 设计 | 免费版 |
| **版本控制** | GitHub | 代码托管 + CI/CD | 免费版 |
| **监控** | Sentry | 崩溃监控 | 免费版 |
| **分析** | Google Analytics | 用户行为分析 | 免费 |
| **域名** | - | Web 版托管 | ~$10/年 |
| **托管** | Vercel / Cloudflare Pages | Web 版部署 | 免费版 |

### 5.2 开发环境

| 环境 | 要求 | 用途 |
|------|------|------|
| macOS 13+ | Apple Silicon / Intel | iOS 构建、macOS 构建 |
| Windows 10/11 | x64 | Windows 构建、测试 |
| Node.js 20 LTS | - | 全平台开发 |
| pnpm 9+ | - | 包管理 |
| Rust 1.75+ | - | Tauri 编译 |

### 5.3 发布渠道与费用

| 平台 | 渠道 | 费用 |
|------|------|------|
| Web | Vercel / Cloudflare Pages | 免费 |
| Windows | GitHub Releases / Microsoft Store | 免费 / $19 一次性 |
| macOS | GitHub Releases / Mac App Store | 免费 / $99/年 |
| iOS | App Store | $99/年 |
| Android | Google Play | $25 一次性 |

### 5.4 潜在第三方依赖

| 依赖 | 用途 | 大小 | 许可证 |
|------|------|------|--------|
| React 18 | UI 框架 | ~45KB gzip | MIT |
| Zustand | 状态管理 | ~1KB | MIT |
| Dexie.js | IndexedDB 封装 | ~15KB | Apache-2.0 |
| Tailwind CSS | 样式框架 | 按需加载 | MIT |
| @tauri-apps/api | Tauri API | ~10KB | MIT/Apache-2.0 |
| @capacitor/core | Capacitor 核心 | ~20KB | MIT |
| Vitest | 测试框架 | 开发依赖 | MIT |
| Playwright | E2E 测试 | 开发依赖 | Apache-2.0 |

---

## 6. 质量保障策略

### 6.1 测试体系

```
┌─────────────────────────────────────────────┐
│              测试金字塔                       │
│                                             │
│                 ╱ ╲                         │
│                ╱ E2E ╲          ~10%        │
│               ╱ 测试    ╲                   │
│              ╱───────────╲                  │
│             ╱  集成测试   ╲      ~20%       │
│            ╱               ╲                │
│           ╱─────────────────╲               │
│          ╱    单元测试       ╲    ~70%      │
│         ╱                     ╲             │
└─────────────────────────────────────────────┘
```

#### 单元测试（覆盖率目标 ≥ 90%）

| 模块 | 测试重点 | 工具 |
|------|---------|------|
| 核心引擎 | 求解正确性、生成唯一解、校验边界 | Vitest |
| 状态管理 | Store 操作、持久化、状态转换 | Vitest |
| 工具函数 | 存储抽象、国际化、常量 | Vitest |

#### 集成测试

| 场景 | 测试重点 | 工具 |
|------|---------|------|
| 组件交互 | Grid + Numpad 联动、撤销/重做流程 | Vitest + Testing Library |
| 数据流 | 生成→游玩→保存→恢复 | Vitest |
| 平台适配 | 存储层在不同平台的行为 | Vitest |

#### E2E 测试

| 场景 | 测试重点 | 工具 |
|------|---------|------|
| 完整游戏流程 | 新游戏→填数→完成→统计 | Playwright |
| 设置变更 | 主题切换→持久化→恢复 | Playwright |
| 跨平台关键路径 | Web + Desktop 安装/启动 | Playwright |

### 6.2 质量标准

| 指标 | 标准 | 测量方式 |
|------|------|---------|
| 首屏加载时间 | < 1.5s (Web) / < 500ms (原生) | Lighthouse / 原生性能监控 |
| 交互响应延迟 | < 100ms | Chrome DevTools / 原生 Profiler |
| 数独生成时间 | < 50ms (单道) | 基准测试 |
| 内存占用 | < 100MB (Web) / < 50MB (原生) | 性能分析器 |
| 安装包体积 | < 5MB (Web) / < 10MB (Desktop) / < 20MB (Mobile) | 构建产物 |
| 测试覆盖率 | ≥ 90% (核心引擎) / ≥ 80% (UI) | Vitest 覆盖率报告 |
| 崩溃率 | < 0.1% | Sentry |
| 无障碍 | WCAG 2.1 AA 级 | axe-core 审计 |

### 6.3 性能优化措施

| 优化方向 | 具体措施 | 预期效果 |
|---------|---------|---------|
| **渲染优化** | React.memo 防止网格单元格无效重渲染 | 减少重渲染 80%+ |
| **计算优化** | Web Worker 执行谜题生成/求解 | 主线程零阻塞 |
| **存储优化** | IndexedDB 批量写入、数据压缩 | 存储效率提升 50% |
| **加载优化** | 代码分割、路由懒加载、资源预加载 | 首屏时间 < 1.5s |
| **缓存优化** | Service Worker 缓存策略、HTTP 缓存 | 二次访问 < 500ms |
| **动画优化** | CSS transform + will-change、requestAnimationFrame | 60fps 流畅动画 |
| **包体积优化** | Tree-shaking、动态 import、依赖分析 | 总包 < 200KB gzip |

### 6.4 代码质量门禁

每次 PR 合并必须通过以下检查：

```yaml
# CI 流水线检查项
- lint:        ESLint 零错误，零警告
- format:      Prettier 格式检查通过
- typecheck:   TypeScript 严格模式编译通过
- test:        单元测试全部通过，覆盖率不降低
- build:       所有平台构建成功
- e2e:         核心流程 E2E 测试通过 (仅 main 分支)
```

---

## 7. 风险管理计划

### 7.1 风险识别与应对

| 风险 | 概率 | 影响 | 等级 | 应对策略 |
|------|------|------|------|---------|
| **谜题生成算法性能不达标** | 中 | 高 | 🔴 高 | 提前进行算法预研；准备回退方案（预生成谜题库）；使用 Web Worker 卸载计算 |
| **Tauri 跨平台兼容性问题** | 中 | 中 | 🟡 中 | 优先验证 Tauri 在目标平台的兼容性；准备 Electron 备选方案 |
| **Capacitor 原生功能受限** | 中 | 中 | 🟡 中 | 提前评估原生插件需求；准备自定义原生插件开发方案 |
| **App Store 审核被拒** | 中 | 高 | 🔴 高 | 提前研究审核指南；预留 2 周审核缓冲期；准备申诉材料 |
| **状态同步数据丢失** | 低 | 高 | 🟡 中 | 实现多层数据备份；操作日志 + 自动恢复；iCloud/Google Drive 同步冲突解决 |
| **移动端触控体验不佳** | 中 | 中 | 🟡 中 | 早期触控原型验证；参考成熟数独 App 交互模式；A/B 测试不同交互方案 |
| **包体积超出预期** | 低 | 中 | 🟢 低 | 持续监控包体积；按需加载策略；依赖审计 |
| **Web Worker 兼容性** | 低 | 低 | 🟢 低 | 降级到主线程执行；检测 Worker 支持情况 |
| **深色模式适配问题** | 低 | 低 | 🟢 低 | 使用 CSS 变量统一管理；自动化视觉回归测试 |

### 7.2 技术挑战与解决方案

#### 挑战 1：高效谜题生成算法

**问题**：生成保证唯一解的高难度数独谜题是计算密集型任务。

**解决方案**：
1. 采用「挖洞法」+ 约束传播结合的生成策略
2. 先生成完整解，再逐步移除数字并验证唯一性
3. 使用 Dancing Links (DLX) 算法加速求解验证
4. 将生成过程放入 Web Worker 避免阻塞 UI
5. 预生成谜题池作为后备方案

```
生成策略:
  完整解生成 → 随机挖洞 → 唯一解验证 → 难度评估
       ↑                                    │
       └──────── 失败则重试 ←───────────────┘
```

#### 挑战 2：跨平台存储一致性

**问题**：不同平台的数据存储机制差异大，需保证数据模型一致。

**解决方案**：
1. 定义统一的存储抽象接口 (IStorageAdapter)
2. 各平台实现各自的适配器
3. 数据序列化使用 JSON Schema 校验
4. 版本迁移机制应对数据结构变更

```typescript
interface IStorageAdapter {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}
```

#### 挑战 3：移动端触控精准度

**问题**：9×9 网格在手机屏幕上单元格较小，触控精准选择困难。

**解决方案**：
1. 触控区域大于视觉区域（padding 扩展）
2. 先选中单元格，再通过数字面板输入（分离选择与输入）
3. 长按触发笔记模式
4. 滑动手势支持（数字面板滑动选数）
5. 触觉反馈 (Haptic Feedback) 确认操作

#### 挑战 4：桌面端原生体验

**问题**：Web 技术栈在桌面端可能缺乏原生感。

**解决方案**：
1. Tauri 提供原生窗口管理
2. 自定义标题栏实现统一视觉
3. 键盘快捷键全覆盖
4. 原生菜单栏集成
5. 拖拽、右键菜单等桌面端交互模式

### 7.3 应急预案

| 场景 | 触发条件 | 应急措施 |
|------|---------|---------|
| Tauri 严重兼容问题 | 目标平台无法正常运行 | 切换至 Electron，预计延迟 1 周 |
| App Store 多次被拒 | 连续 3 次审核被拒 | 聘请 App Store 审核顾问，调整功能 |
| 关键依赖库停止维护 | 核心依赖 30 天无更新 | Fork 并自行维护，或寻找替代库 |
| 性能严重不达标 | 核心指标低于标准 50% | 暂停新功能开发，集中性能攻坚 |

---

## 附录

### A. 数独规则定义

1. 标准 9×9 网格，分为 9 个 3×3 宫格
2. 每行包含 1-9 各一次
3. 每列包含 1-9 各一次
4. 每个 3×3 宫格包含 1-9 各一次
5. 每道谜题有且仅有一个合法解（唯一解）

### B. 难度等级定义

| 等级 | 给定数字数 | 逻辑推理难度 | 预计完成时间 |
|------|-----------|-------------|-------------|
| 简单 | 36-45 | 仅需基础排除法 | 5-15 分钟 |
| 中等 | 30-35 | 需要隐性唯一法 | 15-30 分钟 |
| 困难 | 25-29 | 需要 X-Wing 等高级技巧 | 30-60 分钟 |
| 专家 | 20-24 | 需要多种高级技巧组合 | 60+ 分钟 |

### C. 关键技术决策记录

| 决策 | 选项 | 选择 | 理由 |
|------|------|------|------|
| UI 框架 | React / Vue / Svelte | React | 生态最成熟，跨平台方案最多 |
| 桌面框架 | Tauri / Electron | Tauri | 体积小、安全、性能好 |
| 移动框架 | Capacitor / React Native / Flutter | Capacitor | Web 代码直接复用，学习成本低 |
| 状态管理 | Zustand / Redux / Jotai | Zustand | 轻量、TypeScript 友好 |
| 样式方案 | Tailwind / CSS Modules / Styled-components | Tailwind | 开发效率高、主题切换方便 |
| Monorepo | pnpm + Turborepo / Nx / Lerna | pnpm + Turborepo | 配置简单、构建缓存好 |
