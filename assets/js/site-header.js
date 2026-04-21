document.addEventListener("DOMContentLoaded", () => {
  const backLinks = Array.from(document.querySelectorAll("[data-back-link]"));
  const scrollDock = document.querySelector("[data-scroll-dock]");
  const scrollTopButton = document.querySelector("[data-scroll-top]");
  const scrollBottomButton = document.querySelector("[data-scroll-bottom]");

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

  scrollTopButton?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  scrollBottomButton?.addEventListener("click", () => {
    window.scrollTo({
      top: Math.max(document.body.scrollHeight, document.documentElement.scrollHeight),
      behavior: "smooth",
    });
  });

  const header = document.querySelector("[data-site-header]");
  if (!header) return;

  let lastScrollY = window.scrollY;
  let isFloating = false;
  let ticking = false;
  const floatEnterThreshold = 160;
  const floatExitThreshold = 96;
  const motionThreshold = 18;

  const applyHeaderState = () => {
    const currentScrollY = window.scrollY;
    const searchOpen = header.classList.contains("search-open");

    if (!isFloating && currentScrollY >= floatEnterThreshold) {
      isFloating = true;
    } else if (isFloating && currentScrollY <= floatExitThreshold) {
      isFloating = false;
    }

    header.classList.toggle("is-floating", isFloating);
    scrollDock?.classList.toggle("is-floating", isFloating);
    if (scrollDock) {
      scrollDock.setAttribute("aria-hidden", String(!isFloating));
    }

    if (!isFloating || searchOpen) {
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

  if (window.scrollY >= floatEnterThreshold) {
    isFloating = true;
  }

  applyHeaderState();
});
