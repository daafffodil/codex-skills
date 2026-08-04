---
name: build-waterfall-report-site
description: "Build or restyle a minimal single-page waterfall-card website for dated reports, intelligence briefs, research archives, project logs, knowledge collections, or similar structured content. Use when the user asks for 瀑布流站点、卡片瀑布流、日报网站、报告归档网站、按日期查看、月历切换、点击卡片原地展开、单页看完、不要跳转详情页、把现有内容做成极简卡片网站，或希望把这一站点模式复用于其他项目。"
---

# 瀑布流站点

把日期型报告或结构化内容做成白底、低干扰、可在一页浏览的响应式瀑布流网站。折叠卡片只显示分类和标题，点击后在原位置展开完整内容。

## 判断任务类型

- **新项目**：使用 `scripts/scaffold_waterfall_site.py` 复制 `assets/starter/`，再替换示例数据。
- **已有站点**：先检查现有技术栈、未提交修改和部署配置；复用交互规则，不强行替换框架。
- **日期型内容**：使用前后日期按钮和弹出月历。
- **无日期内容集**：设置 `mode=collection`，隐藏日期控件，只保留瀑布流。
- **只要设计方案**：交付线框或视觉模拟，不创建完整站点。

## 开始前

1. 读取 [references/design-system.md](references/design-system.md)。
2. 需要导入Markdown、JSON或多日期内容时，读取 [references/content-contract.md](references/content-contract.md)。
3. 查找 `.openai/hosting.json`。存在时必须使用 `sites-building` 和 `sites-hosting`；复用其中的 `project_id`，不得重复创建站点。
4. 确认用户已有Logo、颜色和内容，不要求重复提供。铛铛一下项目直接使用技能内置品牌资产，不要再次索取。
5. 保留用户现有修改，不覆盖无关文件。

## 构建流程

1. **整理内容**  
   把每条内容标准化为 `label`、`title`、`bodyHtml` 和可选 `tone`。总结、思考、建议、跟踪信号也做成卡片，不丢失正文。

2. **建立单页结构**  
   保留最小页眉、日期导航／标题和瀑布流。不要加入栏目口号、国家导航、更新时间说明、编辑说明、补录说明或页尾版权，除非用户明确要求。

3. **实现卡片交互**  
   使用原生 `<details><summary>` 或等价的无障碍组件。卡片关闭时只显示分类和标题；点击后在当前卡片内展开完整内容，不跳转详情页。

4. **实现瀑布流**  
   桌面三列、平板两列、手机单列。按列分配卡片，避免CSS Grid同行等高造成空白。展开卡片时保持其他卡片位置稳定、页面可继续纵向浏览。

5. **实现日期切换**  
   日期型站点提供前一天、后一天和月历弹层。只有存在内容的日期可点击；同一页面异步切换数据并更新URL，不制造多层导航。

6. **应用视觉规则**  
   白色背景、深色正文、浅色边线、圆角卡片和有限的低饱和色块。通过CSS变量修改品牌色，不堆叠阴影、渐变、图标或解释性装饰。

7. **验证**  
   检查桌面、平板和手机；逐个展开卡片；检查月份切换、前后日期、返回历史、外链、键盘焦点和无横向滚动。确认完整内容没有被摘要替代。

8. **发布**  
   只有用户要求发布时才部署。GitHub Pages使用静态文件；Sites项目按Sites规范保存版本并部署。发布后检查公开URL和至少一个非首页日期。

## 使用内置模板

对空目录运行：

```powershell
python scripts/scaffold_waterfall_site.py OUTPUT_DIR --title "项目名称" --mode dated --accent "#23B985"
```

无日期内容集使用 `--mode collection`。提供Logo时增加 `--brand-mark ABSOLUTE_IMAGE_PATH`。

铛铛一下项目使用技能内置环形品牌标识：

```powershell
python scripts/scaffold_waterfall_site.py OUTPUT_DIR --title "项目名称" --brand dangdang
```

内置资产：

- `assets/brands/dangdang-brand-mark.png`：去掉中间文字的环形品牌标识，网页页眉、图标和克制的装饰优先使用。
- `assets/brands/dangdang-logo.png`：完整官方Logo，仅在需要完整品牌署名时使用。

必须复制并使用原始资产，不重新绘制、不改色、不变形。其他品牌项目保持 `--brand none`，或使用 `--brand-mark` 提供自己的标识。

脚手架拒绝写入非空目录。面对已有项目，直接修改现有代码，不绕过保护。

## 交付要求

- 说明数据入口、站点入口和构建／发布方式。
- 提供真实文件链接和公开链接，不把本地预览说成公开站点。
- 不恢复用户明确删除的内容。
- 不为了“设计感”增加无效文字或额外点击层级。
- 如果参考站点影响了设计，描述采用的通用原则，不复制对方品牌识别、文案或独特组件。
