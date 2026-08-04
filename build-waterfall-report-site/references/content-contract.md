# 内容数据契约

## 站点清单

`data/manifest.json`：

```json
{
  "site": {
    "title": "项目名称",
    "accent": "#23B985",
    "brandMark": "",
    "mode": "dated"
  },
  "reports": [
    {
      "key": "2026-07-30",
      "label": "2026年7月30日",
      "file": "data/2026-07-30.json"
    }
  ]
}
```

`mode`使用：

- `dated`：显示前后日期和月历；
- `collection`：隐藏日期控件，加载第一份内容集。

日期型内容按`key`倒序排列且不得重复。`brandMark`为空时不显示Logo。

## 单日／单集合数据

```json
{
  "key": "2026-07-30",
  "label": "2026年7月30日",
  "cards": [
    {
      "label": "中国",
      "title": "一句话标题",
      "tone": "green",
      "bodyHtml": "<p>完整事实摘要。</p><ul><li>影响判断</li></ul>"
    }
  ]
}
```

字段规则：

- `label`：国家、分类、内容类型或简短状态；
- `title`：关闭状态下的主要信息；
- `bodyHtml`：完整内容，不是缩略摘要；
- `tone`：可选，允许`green`、`yellow`、`violet`或空值。

## 从Markdown转换

1. 识别日期和一级目录。
2. 每个独立资讯标题生成一张卡片。
3. 把日期、地区、事实摘要、影响、关联和来源全部放入`bodyHtml`。
4. 把结论、建议、持续跟踪和来源清单也转成卡片。
5. 合并重复来源，但不要删除事实限制或不确定性说明。
6. 对HTML转义标题和标签；只允许可信来源生成`bodyHtml`。

不要在折叠状态重复显示正文摘要。不要因为站点化而缩短原始报告。

