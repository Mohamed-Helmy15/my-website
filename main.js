const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(pointer: fine)").matches;

/* ---------- Typewriter that cycles through words ---------- */
const typeEl = $(".js-type");
if (typeEl) {
  const words = JSON.parse(typeEl.dataset.words);
  let w = 0;
  let i = 0;
  let deleting = false;
  const tick = () => {
    const word = words[w];
    i += deleting ? -1 : 1;
    typeEl.textContent = word.slice(0, i);
    let delay = deleting ? 45 : 85;
    if (!deleting && i === word.length) {
      deleting = true;
      delay = 1800;
    } else if (deleting && i === 0) {
      deleting = false;
      w = (w + 1) % words.length;
      delay = 350;
    }
    setTimeout(tick, delay);
  };
  if (reduceMotion) typeEl.textContent = words[0];
  else setTimeout(tick, 900);
}

/* ---------- Mobile menu ---------- */
const toggle = $(".menu-toggle");
const nav = $("#nav");
toggle.addEventListener("click", () => {
  const open = toggle.getAttribute("aria-expanded") === "true";
  toggle.setAttribute("aria-expanded", String(!open));
  nav.classList.toggle("open", !open);
});
$$("a", nav).forEach((a) =>
  a.addEventListener("click", () => {
    toggle.setAttribute("aria-expanded", "false");
    nav.classList.remove("open");
  })
);

/* ---------- Scroll: progress bar, header hide, back-to-top ---------- */
const header = $(".header");
const scrollBtn = $(".scroll");
const bar = $(".progress span");
let lastY = window.scrollY;
const onScroll = () => {
  const y = window.scrollY;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
  scrollBtn.classList.toggle("in", y >= 500);
  const menuOpen = nav.classList.contains("open");
  header.classList.toggle("hide", y > lastY && y > 300 && !menuOpen);
  lastY = y;
};
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

/* ---------- Active nav link ---------- */
const navLinks = $$(".navigation a");
const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((a) =>
        a.classList.toggle("active", a.getAttribute("href") === `#${entry.target.id}`)
      );
    });
  },
  { rootMargin: "-45% 0px -50% 0px" }
);
$$("section[id]").forEach((s) => sectionObserver.observe(s));

/* ---------- Reveal on scroll ---------- */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);
$$(".observe").forEach((el) => {
  const siblings = [...el.parentElement.children].filter((c) => c.classList.contains("observe"));
  el.style.setProperty("--stagger", `${siblings.indexOf(el) * 0.08}s`);
  revealObserver.observe(el);
});

/* ---------- Count-up stats ---------- */
const countObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = Number(el.dataset.count);
      const start = performance.now();
      const duration = reduceMotion ? 1 : 1400;
      const step = (now) => {
        const p = Math.min((now - start) / duration, 1);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      countObserver.unobserve(el);
    });
  },
  { threshold: 0.6 }
);
$$("[data-count]").forEach((el) => countObserver.observe(el));

/* ---------- Project filters ---------- */
const grid = $(".project-grid");
const emptyState = $(".empty-state");
$$(".filter").forEach((btn) =>
  btn.addEventListener("click", () => {
    $$(".filter").forEach((b) => b.classList.toggle("active", b === btn));
    const f = btn.dataset.filter;
    let visible = 0;
    $$(".project-card", grid).forEach((card) => {
      const show = f === "all" || card.dataset.cat.split(" ").includes(f);
      card.classList.toggle("is-hidden", !show);
      if (show) visible++;
    });
    grid.classList.toggle("filtered", f !== "all");
    emptyState.hidden = visible > 0;
  })
);

/* ---------- Copy email ---------- */
const toast = $(".toast");
const showToast = (msg) => {
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(showToast.t);
  showToast.t = setTimeout(() => toast.classList.remove("show"), 2200);
};
$$(".copy-btn").forEach((btn) =>
  btn.addEventListener("click", async () => {
    const label = $("span", btn);
    try {
      await navigator.clipboard.writeText(btn.dataset.copy);
      btn.classList.add("copied");
      label.textContent = "Copied";
      showToast("Email copied to clipboard");
    } catch {
      showToast("Couldn't copy — please select the address manually");
    }
    setTimeout(() => {
      btn.classList.remove("copied");
      label.textContent = "Copy";
    }, 2000);
  })
);

/* ---------- Pointer effects (desktop only) ---------- */
if (finePointer && !reduceMotion) {
  const glow = $(".cursor-glow");
  window.addEventListener(
    "pointermove",
    (e) => {
      glow.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
    },
    { passive: true }
  );

  // Spotlight that follows the pointer inside service cards
  $$(".service-card").forEach((card) =>
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--my", `${e.clientY - r.top}px`);
    })
  );

  // 3D tilt on the hero editor
  const tilt = $(".tilt");
  const visual = $(".hero-visual");
  if (tilt && window.innerWidth > 1080) {
    visual.addEventListener("pointermove", (e) => {
      const r = visual.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      tilt.style.transform = `rotateY(${x * 14}deg) rotateX(${-y * 10}deg)`;
    });
    visual.addEventListener("pointerleave", () => {
      tilt.style.transform = "";
    });
  }

  // Magnetic buttons
  $$(".magnetic").forEach((el) => {
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      el.style.transform = `translate(${x * 0.2}px, ${y * 0.3}px)`;
    });
    el.addEventListener("pointerleave", () => {
      el.style.transform = "";
    });
  });
}

$(".footer-title .year").textContent = new Date().getFullYear();
