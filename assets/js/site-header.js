document.addEventListener("DOMContentLoaded", () => {
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
