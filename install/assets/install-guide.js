(() => {
  const root = document.documentElement;
  const search = document.querySelector("#guide-search");
  const sections = [...document.querySelectorAll(".guide-section")];
  const links = [...document.querySelectorAll("#guide-toc a")];
  const noResults = document.querySelector("#no-results");
  const normalize = (value) => value.trim().toLocaleLowerCase("zh-TW");

  function setScale(next) {
    const scale = Math.min(1.3, Math.max(0.9, Number(next.toFixed(2))));
    root.style.setProperty("--font-scale", String(scale));
    document.querySelector("#font-reset").setAttribute("aria-label", `目前文字大小 ${Math.round(scale * 100)}%，按下恢復標準大小`);
  }

  document.querySelector("#font-down").addEventListener("click", () => {
    const current = Number(getComputedStyle(root).getPropertyValue("--font-scale")) || 1;
    setScale(current - 0.1);
  });
  document.querySelector("#font-reset").addEventListener("click", () => setScale(1));
  document.querySelector("#font-up").addEventListener("click", () => {
    const current = Number(getComputedStyle(root).getPropertyValue("--font-scale")) || 1;
    setScale(current + 0.1);
  });
  document.querySelector("#print-guide").addEventListener("click", () => window.print());

  search.addEventListener("input", () => {
    const query = normalize(search.value);
    let visible = 0;
    sections.forEach((section) => {
      const text = normalize(`${section.dataset.keywords || ""} ${section.textContent || ""}`);
      const match = !query || text.includes(query);
      section.hidden = !match;
      if (match) visible += 1;
    });
    noResults.hidden = visible !== 0;
  });

  const observer = new IntersectionObserver((entries) => {
    const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible?.target.id) return;
    links.forEach((link) => link.classList.toggle("active", link.getAttribute("href") === `#${visible.target.id}`));
  }, { rootMargin: "-20% 0px -65% 0px", threshold: [0.1, 0.5] });
  sections.forEach((section) => observer.observe(section));
})();
