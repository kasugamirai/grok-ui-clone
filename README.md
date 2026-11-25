# Grok UI Clone · Orbit

仿照 grok.com（登录后的主页 + 对话页）复刻的聊天界面，重点还原布局和动效。纯 HTML / CSS / JavaScript，零依赖，双击 `index.html` 就能打开。

> 非官方项目，与 xAI / Grok 没有任何关联。为避免被误认为官方站点，界面使用原创品牌名 **Orbit** 和原创图标；没有使用 xAI 的任何代码、字体、logo 或素材。尺寸、颜色和动画时长是对照原站量出来的，实现代码全部重新编写。

A Grok-style chat UI (layout + motion) rebuilt from scratch in vanilla HTML/CSS/JS. Unofficial and not affiliated with xAI; the app is branded "Orbit" and ships no xAI code, fonts, logos or assets.

## 运行

```bash
python3 -m http.server 4173
```

然后打开 <http://localhost:4173>。不起服务、直接打开 `index.html` 也可以。

## 已实现

- **布局**：254px 侧边栏（New chat、Imagine、Library、Bots、Projects、Chats、Show more 展开）+ 居中 764px 主列，暖白配色与原站一致
- **标题逐字变形**：共同的词保持不动，变化的词逐个字母上移、淡出并变蓝，新词延后 100ms 落下，宽度同步过渡（New chat / Private 切换时触发）
- **进场动画**：标题和输入框依次上浮 6px 淡入
- **侧边栏收起/展开**：展开 200ms、收起 120ms，主列同步重新居中
- **Private 模式**：标题切换、输入框变虚线、建议列表收起，整体平滑下移到正中
- **输入框**：自动增高；语音按钮 / 发送按钮 / 停止按钮之间切换；输入时显示联想补全；中文输入法回车不会误发送
- **下拉菜单**：模型切换（Auto / Fast / Expert / Heavy / Build）、附件菜单、账号菜单，缩放 + 淡入弹出
- **对话**：发送后输入框滑到底部，显示 Thinking 闪光文字，回复逐词淡入（支持段落、标题、列表、粗体、行内代码、代码块），之后出现复制/点赞/点踩/更多操作和追问气泡（错峰上浮）
- **⌘K / Ctrl+K 搜索面板**：分类标签、搜索高亮、方向键选择、Tab 切换分类
- **设置面板（⌘, / Ctrl+,，或左下角账号菜单 → Settings）**：12 个标签页（Account、Appearance、Behavior、Notifications、Customize、Connect Apps、Skills、Automations、Bots、Data Controls、Billing、Usage），左侧可搜索；打开时缩放 + 淡入，地址栏同步 `?_s=标签名`，可直接链接到某个标签页。下面这些设置会真正生效并保存在浏览器里：主题、代码块自动换行、减少动态效果、显示/隐藏建议、⌘Enter 发送、流式回复自动滚动、浏览器通知、连接应用、添加自动化、清空全部对话
- **其他**：⌘J / Ctrl+J 新建对话、历史对话加载、重命名/删除对话、右侧面板、手机端抽屉式侧边栏、语音听写（浏览器支持 Web Speech API 时）、尊重系统的「减少动态效果」设置

## 动效参数（对照原站实测）

| 元素 | 时长 | 缓动 |
| --- | --- | --- |
| 标题字母（颜色 / 透明度 / 位移） | 260ms，每个字母错开 6.7ms，新词延后 100ms | `cubic-bezier(.22, 1, .36, 1)` |
| 标题变化部分的宽度 | 260ms，延迟 30ms | `cubic-bezier(.2, 0, 0, 1)` |
| 标题 / 输入框进场 | 120ms，延迟 40ms / 100ms，上浮 6px | `cubic-bezier(.2, 0, 0, 1)` |
| 侧边栏宽度 | 展开 200ms / 收起 120ms | `cubic-bezier(.22, 1, .36, 1)` |
| Private 切换时的布局位移 | 300ms | `cubic-bezier(.2, 0, 0, 1)` |
| 菜单弹出（scale .96 → 1） | 120ms | `cubic-bezier(0, 0, 0, 1)` |
| 设置弹窗打开 / 关闭（scale .96 ↔ 1） | 260ms / 180ms | `cubic-bezier(.22, 1, .36, 1)` / `cubic-bezier(.2, 0, 0, 1)` |
| 设置开关（34×20） | 120ms | `cubic-bezier(.2, 0, 0, 1)` |
| 追问气泡（上浮 10px + scale .97） | 400ms，错开 50ms | `cubic-bezier(.22, 1, .36, 1)` |
| 悬停颜色 / 背景 | 120ms | `cubic-bezier(.2, 0, 0, 1)` |

## 接入真实模型

回复目前在浏览器本地模拟。`app.js` 里的 `composeReply(text)` 返回 `{ text, followups }`，`streamReply()` 负责逐词渲染。改成调用你自己的后端，再把返回的文本交给 `streamReply` 即可。不要把 API Key 写进前端代码。

## 文件

```
index.html   页面结构
styles.css   样式、主题变量、动画
app.js       交互逻辑：文字变形、菜单、搜索面板、设置面板、模拟流式回复
favicon.svg  原创图标
```

字体使用 Google Fonts 的 Inter 和 JetBrains Mono。
