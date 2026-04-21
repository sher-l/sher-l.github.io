document.addEventListener("DOMContentLoaded", () => {
  const backLinks = Array.from(document.querySelectorAll("[data-back-link]"));
  backLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      if (window.history.length <= 1 || !document.referrer) return;

      try {
        const referrer = new URL(document.referrer, window.location.href);
        if (referrer.origin !== window.location.origin) return;
      } catch {
        return;
      }

      event.preventDefault();
      window.history.back();
    });
  });

  const header = document.querySelector("[data-site-header]");
  if (!header) return;

  let lastScrollY = window.scrollY;
  let ticking = false;
  const floatThreshold = 140;
  const motionThreshold = 18;

  const applyHeaderState = () => {
    const currentScrollY = window.scrollY;
    const shouldFloat = currentScrollY > floatThreshold;
    const searchOpen = header.classList.contains("search-open");

    header.classList.toggle("is-floating", shouldFloat);

    if (!shouldFloat || searchOpen) {
      header.classList.remove("is-hidden");
    } else if (currentScrollY > lastScrollY + motionThreshold) {
      header.classList.add("is-hidden");
    } else if (currentScrollY < lastScrollY - motionThreshold) {
      header.classList.remove("is-hidden");
    }

    lastScrollY = currentScrollY;
    ticking = false;
  };

  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(applyHeaderState);
    },
    { passive: true }
  );

  applyHeaderState();
});
