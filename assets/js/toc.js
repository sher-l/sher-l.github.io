document.addEventListener("DOMContentLoaded", () => {
  const tocCard = document.getElementById("toc-card");
  const tocList = document.getElementById("toc-list");
  const headings = Array.from(document.querySelectorAll(".post-body h2, .post-body h3"));

  if (!tocCard || !tocList || headings.length === 0) {
    if (tocCard) tocCard.style.display = "none";
    return;
  }

  headings.forEach((heading, index) => {
    if (!heading.id) heading.id = `section-${index + 1}`;
    const link = document.createElement("a");
    link.href = `#${heading.id}`;
    link.textContent = heading.textContent || "";
    link.className = heading.tagName.toLowerCase() === "h3" ? "toc-link toc-link-sub" : "toc-link";
    tocList.appendChild(link);
  });
});
