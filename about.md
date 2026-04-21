---
layout: page
title: About
description: 关于站点和当前的工作方向。
permalink: /about/
eyebrow: About
---

<div class="info-list">
  <section>
    <h2>About me</h2>
    <p>{{ site.profile.summary }}</p>
  </section>

  <section>
    <h2>Current focus</h2>
    <p>{{ site.profile.focus }}</p>
  </section>

  <section>
    <h2>Tech stack</h2>
    <div class="chip-list">
      {% for item in site.profile.tech_stack %}
        <span>{{ item }}</span>
      {% endfor %}
    </div>
  </section>

  <section>
    <h2>Site note</h2>
    <p>这个站点优先保存那些经过一轮折腾之后，依然值得留下来的经验：分析流程、系统配置、工具链和排错记录。</p>
  </section>
</div>
