---
layout: page
title: Search
description: 搜索文章标题、摘要和正文关键词。
permalink: /search/
eyebrow: Search
---

{% include search-box.html
  id="search-input"
  label="搜索站内内容"
  placeholder="例如：jekyll、windows、python"
  hint="支持匹配标题、摘要、正文和分类。"
  live=true
  sync_url=true
  more_link=false %}
