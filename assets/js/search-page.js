document.addEventListener("DOMContentLoaded", () => {
  const searchRoots = Array.from(document.querySelectorAll("[data-search-root]"));
  const searchToggle = document.querySelector("[data-search-toggle]");
  const globalPanel = document.querySelector("[data-global-search-panel]");
  const globalInput = globalPanel?.querySelector(".search-input");
  const siteHeader = document.querySelector("[data-site-header]");
  const searchIndexUrl = "/search.json";

  if (!searchRoots.length && !searchToggle) return;

  let postsPromise;

  const escapeHtml = (value) =>
    String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const loadPosts = async () => {
    if (!postsPromise) {
      postsPromise = fetch(searchIndexUrl)
        .then((response) => {
          if (!response.ok) throw new Error("Failed to load search index.");
          return response.json();
        });
    }
    return postsPromise;
  };

  const filterPosts = (posts, rawQuery) => {
    const query = rawQuery.toLowerCase();
    return posts.filter((post) => {
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
  };

  const renderItems = (items) =>
    items
      .map((post) => {
        const categories = Array.isArray(post.categories) ? post.categories.join(" · ") : "";
        return `
          <article class="search-result">
            <time datetime="${escapeHtml(post.date)}">${escapeHtml(post.date)}</time>
            <div>
              <h2><a href="${escapeHtml(post.url)}">${escapeHtml(post.title)}</a></h2>
              <p>${escapeHtml(post.excerpt || "")}</p>
              ${categories ? `<span>${escapeHtml(categories)}</span>` : ""}
            </div>
          </article>
        `;
      })
      .join("");

  const updateUrl = (rawQuery) => {
    const nextUrl = new URL(window.location.href);
    if (rawQuery) {
      nextUrl.searchParams.set("q", rawQuery);
    } else {
      nextUrl.searchParams.delete("q");
    }
    window.history.replaceState({}, "", nextUrl);
  };

  const setPanelOpen = (open) => {
    if (!globalPanel || !searchToggle) return;
    globalPanel.hidden = !open;
    searchToggle.setAttribute("aria-expanded", String(open));
    siteHeader?.classList.toggle("search-open", open);
    if (open && globalInput) {
      globalInput.focus();
      globalInput.select();
    }
  };

  if (searchToggle && globalPanel) {
    searchToggle.addEventListener("click", (event) => {
      event.preventDefault();
      setPanelOpen(globalPanel.hidden);
    });

    document.addEventListener("click", (event) => {
      if (globalPanel.hidden) return;
      if (globalPanel.contains(event.target) || searchToggle.contains(event.target)) return;
      setPanelOpen(false);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !globalPanel.hidden) {
        setPanelOpen(false);
      }
    });
  }

  searchRoots.forEach((root) => {
    const input = root.querySelector(".search-input");
    const results = root.querySelector("[data-search-results]");
    const moreLink = root.querySelector("[data-search-more]");
    const limit = Number.parseInt(root.dataset.searchLimit || "0", 10);
    const syncUrl = root.dataset.searchSyncUrl === "true";
    const isGlobalSearch = root.closest("[data-global-search-panel]") !== null;
    const initialQuery = syncUrl ? (new URLSearchParams(window.location.search).get("q") || "").trim() : "";

    if (!input || !results) return;

    const emptyMessage = "输入关键词后显示结果。";
    const loadErrorMessage = "搜索索引加载失败。";

    const renderState = (html) => {
      results.innerHTML = html;
    };

    const renderEmpty = () => {
      renderState(`<p class="search-empty">${emptyMessage}</p>`);
      if (moreLink) moreLink.hidden = true;
    };

    const renderResults = (items, rawQuery) => {
      if (!rawQuery) {
        renderEmpty();
        return;
      }

      if (!items.length) {
        renderState(`<p class="search-empty">没有找到和 “${escapeHtml(rawQuery)}” 相关的结果。</p>`);
        if (moreLink) {
          moreLink.hidden = false;
          moreLink.href = `${root.action}?q=${encodeURIComponent(rawQuery)}`;
        }
        return;
      }

      const visibleItems = limit > 0 ? items.slice(0, limit) : items;
      renderState(renderItems(visibleItems));

      if (moreLink) {
        const hasMore = limit > 0 && items.length > limit;
        moreLink.hidden = !hasMore;
        if (hasMore) {
          moreLink.href = `${root.action}?q=${encodeURIComponent(rawQuery)}`;
        }
      }
    };

    const runSearch = async () => {
      const rawQuery = input.value.trim();

      if (syncUrl) updateUrl(rawQuery);
      if (!rawQuery) {
        renderEmpty();
        return;
      }

      try {
        const posts = await loadPosts();
        renderResults(filterPosts(posts, rawQuery), rawQuery);
      } catch (error) {
        renderState(`<p class="search-empty">${loadErrorMessage}</p>`);
        if (moreLink) moreLink.hidden = true;
      }
    };

    root.addEventListener("submit", async (event) => {
      event.preventDefault();
      await runSearch();
    });

    input.addEventListener("input", runSearch);

    if (initialQuery) {
      input.value = initialQuery;
      runSearch();
    } else {
      renderEmpty();
    }
  });

  if (searchToggle && globalPanel) {
    window.addEventListener(
      "scroll",
      () => {
        if (!globalPanel.hidden) {
          setPanelOpen(false);
        }
      },
      { passive: true }
    );
  }
});
