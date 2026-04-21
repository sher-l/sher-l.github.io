---
layout: page
title: Tags
description: 按标签查看文章。
permalink: /tags/
eyebrow: Tags
---

{% include tag-cloud.html %}

<div class="tags-page">
  {% assign sorted_categories = site.categories | sort %}
  {% for category in sorted_categories %}
    <section class="tag-section" id="{{ category[0] | slugify }}">
      <h2>{{ category[0] }}</h2>
      <div class="tag-post-list">
        {% for post in category[1] %}
          <article class="tag-post-item">
            <time datetime="{{ post.date | date_to_xmlschema }}">{{ post.date | date: "%Y.%m.%d" }}</time>
            <div>
              <h3><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h3>
              <p>{{ post.excerpt | strip_html | strip_newlines | truncate: 100 }}</p>
            </div>
          </article>
        {% endfor %}
      </div>
    </section>
  {% endfor %}
</div>
