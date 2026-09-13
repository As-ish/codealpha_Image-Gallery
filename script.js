/* ============================================================
   THE WALL — gallery data, filtering, and lightbox logic
   ============================================================ */
(function () {
  "use strict";

  // ----------------------------------------------------------
  // 1. Data — 24 works across 5 categories
  //    (images served from picsum.photos; swap the `src` values
  //     for your own photos any time — everything else adapts)
  // ----------------------------------------------------------
  const WORKS = [
    { id: 1,  title: "Silver Stream",      category: "nature",       w: 700, h: 900,  picId: 1015 },
    { id: 2,  title: "Mountain Hollow",     category: "nature",       w: 700, h: 520,  picId: 1016 },
    { id: 3,  title: "Valley Light",        category: "nature",       w: 700, h: 860,  picId: 1018 },
    { id: 4,  title: "Coastal Drift",       category: "nature",       w: 700, h: 600,  picId: 1020 },
    { id: 5,  title: "Forest Floor",        category: "nature",       w: 700, h: 950,  picId: 1024 },
    { id: 6,  title: "Fogged Pines",        category: "nature",       w: 700, h: 560,  picId: 1044 },

    { id: 7,  title: "Concrete Hymn",       category: "architecture", w: 700, h: 880,  picId: 164  },
    { id: 8,  title: "Glass Corridor",      category: "architecture", w: 700, h: 540,  picId: 180  },
    { id: 9,  title: "Stair of Light",      category: "architecture", w: 700, h: 920,  picId: 196  },
    { id: 10, title: "Brutal Quiet",        category: "architecture", w: 700, h: 600,  picId: 1048 },
    { id: 11, title: "Steel Nave",          category: "architecture", w: 700, h: 780,  picId: 1076 },

    { id: 12, title: "Passing Glance",      category: "people",       w: 700, h: 860,  picId: 64   },
    { id: 13, title: "Quiet Hands",         category: "people",       w: 700, h: 560,  picId: 91   },
    { id: 14, title: "Market Morning",      category: "people",       w: 700, h: 900,  picId: 177  },
    { id: 15, title: "Held Frame",          category: "people",       w: 700, h: 620,  picId: 338  },

    { id: 16, title: "Departure Gate",      category: "travel",       w: 700, h: 540,  picId: 1041 },
    { id: 17, title: "Roadside Hour",       category: "travel",       w: 700, h: 900,  picId: 1050 },
    { id: 18, title: "Harbor Rest",         category: "travel",       w: 700, h: 620,  picId: 1060 },
    { id: 19, title: "Dust and Distance",   category: "travel",       w: 700, h: 860,  picId: 1074 },
    { id: 20, title: "Terminal Light",      category: "travel",       w: 700, h: 560,  picId: 1080 },

    { id: 21, title: "Watchful",            category: "animals",      w: 700, h: 880,  picId: 219  },
    { id: 22, title: "Good Dog",            category: "animals",      w: 700, h: 600,  picId: 237  },
    { id: 23, title: "Feather Study",       category: "animals",      w: 700, h: 900,  picId: 433  },
    { id: 24, title: "Grazing Line",        category: "animals",      w: 700, h: 560,  picId: 659  }
  ];

  const CATEGORY_LABELS = {
    all: "All",
    nature: "Nature",
    architecture: "Architecture",
    people: "People",
    travel: "Travel",
    animals: "Animals"
  };

  const srcFor = (work, w, h) =>
    `https://picsum.photos/id/${work.picId}/${w}/${h}`;

  // ----------------------------------------------------------
  // 2. DOM refs
  // ----------------------------------------------------------
  const galleryEl   = document.getElementById("gallery");
  const filtersEl   = document.getElementById("filters");
  const filterSlider= document.getElementById("filterSlider");
  const countEl     = document.getElementById("resultCount");
  const emptyStateEl= document.getElementById("emptyState");

  const lightbox    = document.getElementById("lightbox");
  const lbImage     = document.getElementById("lbImage");
  const lbTitle     = document.getElementById("lbTitle");
  const lbCategory  = document.getElementById("lbCategory");
  const lbIndex     = document.getElementById("lbIndex");
  const lbPrev      = document.getElementById("lbPrev");
  const lbNext      = document.getElementById("lbNext");
  const lbClose     = document.getElementById("lbClose");

  let currentFilter = "all";
  let visibleWorks  = WORKS.slice();
  let activeIndex   = 0;     // index into visibleWorks, while lightbox is open
  let lastFocused   = null;

  // ----------------------------------------------------------
  // 3. Render gallery cards
  // ----------------------------------------------------------
  function renderGallery(works) {
    galleryEl.innerHTML = "";

    works.forEach((work, i) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "card";
      card.style.animationDelay = `${Math.min(i, 10) * 45}ms`;
      card.dataset.id = work.id;
      card.setAttribute("aria-label", `Open ${work.title} (${CATEGORY_LABELS[work.category]}) in full view`);

      card.innerHTML = `
        <span class="card__imgwrap">
          <img src="${srcFor(work, work.w, work.h)}" alt="${work.title}" loading="lazy" width="${work.w}" height="${work.h}">
          <span class="card__frame"></span>
          <span class="card__cue">+</span>
          <span class="card__overlay">
            <span class="card__title">${work.title}</span>
            <span class="card__category">${CATEGORY_LABELS[work.category]}</span>
          </span>
        </span>
      `;

      card.addEventListener("click", () => openLightbox(work.id));
      galleryEl.appendChild(card);
    });

    emptyStateEl.hidden = works.length !== 0;
    countEl.textContent = `${works.length} work${works.length === 1 ? "" : "s"}`;
  }

  // ----------------------------------------------------------
  // 4. Filtering, with a soft out/in transition
  // ----------------------------------------------------------
  function applyFilter(filter) {
    currentFilter = filter;
    const cards = Array.from(galleryEl.children);

    const finish = () => {
      visibleWorks = filter === "all" ? WORKS.slice() : WORKS.filter(w => w.category === filter);
      renderGallery(visibleWorks);
    };

    if (cards.length === 0) { finish(); return; }

    let remaining = cards.length;
    cards.forEach(card => {
      card.classList.add("is-hiding");
      card.addEventListener("animationend", function handler() {
        card.removeEventListener("animationend", handler);
        remaining -= 1;
        if (remaining === 0) finish();
      });
    });
  }

  function moveSliderTo(btn) {
    if (!btn) return;
    filterSlider.style.width = `${btn.offsetWidth}px`;
    filterSlider.style.transform = `translateX(${btn.offsetLeft}px)`;
  }

  filtersEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".filters__btn");
    if (!btn) return;

    filtersEl.querySelectorAll(".filters__btn").forEach(b => b.classList.remove("is-active"));
    btn.classList.add("is-active");
    moveSliderTo(btn);

    applyFilter(btn.dataset.filter);
  });

  // ----------------------------------------------------------
  // 5. Lightbox
  // ----------------------------------------------------------
  function openLightbox(workId) {
    activeIndex = visibleWorks.findIndex(w => w.id === workId);
    if (activeIndex === -1) activeIndex = 0;
    lastFocused = document.activeElement;

    renderLightboxContent();

    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    lbClose.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (lastFocused) lastFocused.focus();
  }

  function renderLightboxContent() {
    const work = visibleWorks[activeIndex];
    if (!work) return;

    // slight fade for the image swap
    lbImage.style.opacity = "0";
    const nextSrc = srcFor(work, 1200, Math.round(1200 * (work.h / work.w)));

    const img = new Image();
    img.onload = () => {
      lbImage.src = nextSrc;
      lbImage.alt = work.title;
      requestAnimationFrame(() => { lbImage.style.opacity = "1"; });
    };
    img.src = nextSrc;

    lbTitle.textContent = work.title;
    lbCategory.textContent = CATEGORY_LABELS[work.category];
    lbIndex.textContent = `${activeIndex + 1} / ${visibleWorks.length}`;
  }

  function showPrev() {
    if (visibleWorks.length === 0) return;
    activeIndex = (activeIndex - 1 + visibleWorks.length) % visibleWorks.length;
    renderLightboxContent();
  }

  function showNext() {
    if (visibleWorks.length === 0) return;
    activeIndex = (activeIndex + 1) % visibleWorks.length;
    renderLightboxContent();
  }

  lbImage.style.transition = "opacity .3s ease";
  lbClose.addEventListener("click", closeLightbox);
  lbPrev.addEventListener("click", showPrev);
  lbNext.addEventListener("click", showNext);

  // click outside the frame closes it
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  // keyboard: Esc to close, arrows to navigate
  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("is-open")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") showPrev();
    if (e.key === "ArrowRight") showNext();
  });

  // basic touch-swipe support for mobile
  let touchStartX = null;
  lightbox.addEventListener("touchstart", (e) => {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });

  lightbox.addEventListener("touchend", (e) => {
    if (touchStartX === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) { dx > 0 ? showPrev() : showNext(); }
    touchStartX = null;
  }, { passive: true });

  // ----------------------------------------------------------
  // 6. Init
  // ----------------------------------------------------------
  function init() {
    renderGallery(WORKS);
    const activeBtn = filtersEl.querySelector(".filters__btn.is-active");
    // measure after layout settles
    requestAnimationFrame(() => moveSliderTo(activeBtn));
    window.addEventListener("resize", () => moveSliderTo(filtersEl.querySelector(".filters__btn.is-active")));
  }

  document.addEventListener("DOMContentLoaded", init);
})();