# 贪吃蛇·HTML5 实训作品

## 项目简介

一个用原生HTML/CSS/JavaScript实现的贪吃蛇小游戏，支持键盘与手机触屏操作，成绩保存在浏览器LocalStorage中，刷新不丢失。项目无需后端、无需安装依赖，使用Live Server打开即可运行。

## 功能清单

- Canvas绘制游戏画面
- 键盘方向键/WASD/手机滑动控制
- 空格键暂停/继续（仅在游戏进行中有效）
- 三种难度：简单（可以穿墙）、普通、困难（增加8个障碍物）
- 得分统计、最高分记录
- 提交成绩表单（昵称/邮箱/分数校验）
- 排行榜：搜索、排序、删除单条、清空全部
- 暗色/亮色主题切换，并记忆用户选择
- LocalStorage数据持久化
- 响应式布局，手机/桌面自适应
- 移动端虚拟方向键
- Web Audio API简单音效

## 运行方式

1. 用VS Code打开项目文件夹。
2. 安装Live Server插件。
3. 右键 `index.html` → Open with Live Server。
4. 浏览器访问提示的地址即可。

> 推荐使用Live Server运行。直接双击HTML文件虽然也能打开，但部分浏览器对 `file://` 下的LocalStorage或音频功能可能有限制。

## 目录结构

├── index.html          # 首页：统计信息+提交成绩
├── game.html           # 游戏页：Canvas游戏
├── list.html           # 排行榜页
├── README.md
├── css/
│   └── style.css       # 全局样式、主题变量、响应式布局
└── js/
    ├── common.js       # LocalStorage封装、主题切换、XSS转义
    ├── game.js         # 贪吃蛇核心逻辑
    ├── index.js        # 首页统计与提交成绩表单
    └── list.js         # 排行榜渲染、搜索、排序、删除