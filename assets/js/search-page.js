document.addEventListener("DOMContentLoaded", async () => {
  const input = document.getElementById("search-input");
  const results = document.getElementById("search-results");

  if (!input || !results) return;

  let posts = [];
  try {
    const response = await fetch("/search.json");
    posts = await response.json();
  } catch (error) {
    results.innerHTML = "<p class=\"search-empty\">搜索索引加载失败。</p>";
    return;
  }

  const render = (items, query) => {
    if (!query) {
      results.innerHTML = "<p class=\"search-empty\">输入关键词后显示结果。</p>";
      return;
    }

    if (items.length === 0) {
      results.innerHTML = `<p class="search-empty">没有找到和 “${query}” 相关的结果。</p>`;
      return;
    }

    results.innerHTML = items
      .map((post) => {
        const categories = Array.isArray(post.categories) ? post.categories.join(" · ") : "";
        return `
          <article class="search-result">
            <time datetime="${post.date}">${post.date}</time>
            <div>
              <h2><a href="${post.url}">${post.title}</a></h2>
              <p>${post.excerpt || ""}</p>
              ${categories ? `<span>${categories}</span>` : ""}
            </div>
          </article>
        `;
      })
      .join("");
  };

  const runSearch = () => {
    const query = input.value.trim().toLowerCase();
    if (!query) {
      render([], "");
      return;
    }

    const filtered = posts.filter((post) => {
      const haystack = [
        post.title,
        post.excerpt,
        post.content,
        Array.isArray(post.categories) ? post.categories.join(" ") : "",
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });

    render(filtered, query);
  };

  input.addEventListener("input", runSearch);
  render([], "");
});
