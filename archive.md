---
layout: default
title: 归档
description: 所有文章与记录。
permalink: /archive/
---

<section class="page-shell">
  <div class="section-heading">
    <p class="section-kicker">Archive</p>
    <h1>全部文章</h1>
    <p>按时间归档，方便回看曾经解决过的问题和留下来的记录。</p>
  </div>

  <div class="archive-list">
    {% assign current_year = "" %}
    {% for post in site.posts %}
      {% assign post_year = post.date | date: "%Y" %}
      {% if post_year != current_year %}
        {% assign current_year = post_year %}
        <h2 class="archive-year">{{ current_year }}</h2>
      {% endif %}
      <article class="archive-item">
        <time datetime="{{ post.date | date_to_xmlschema }}">{{ post.date | date: "%m.%d" }}</time>
        <div>
          <h3><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h3>
          <p>{{ post.excerpt | strip_html | strip_newlines | truncate: 96 }}</p>
        </div>
      </article>
    {% endfor %}
  </div>
</section>
