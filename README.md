# The Wall — Frontend Image Gallery

A pure HTML/CSS/JavaScript image gallery, no frameworks or build step required.

## Folder structure

```
image-gallery/
├── index.html        Markup + lightbox structure
├── css/
│   └── style.css      All styling, layout, hover states, transitions, responsiveness
├── js/
│   └── script.js       Gallery data, rendering, category filtering, lightbox logic
└── README.md
```

## How to run it

Just open `index.html` in any modern browser — double-click the file, or right-click →
"Open with" → your browser. No server or install step is needed.

(Optional) If you'd rather serve it locally: `npx serve .` or `python3 -m http.server`
from inside the `image-gallery` folder, then visit the printed local address.

## Features

- **Category filters** — All / Nature / Architecture / People / Travel / Animals,
  with an animated brass underline and a soft fade transition when the grid updates.
- **Masonry-style responsive grid** — 1 column on phones, up to 4 on large screens.
- **Hover effects** — image zoom, a brass frame line that draws in, and a caption
  that slides up over each frame.
- **Lightbox viewer** — click any frame to open it full-size, with:
  - Next / Previous buttons
  - Left/Right arrow key navigation
  - Swipe support on touch devices
  - Escape key or click-outside to close
  - A running "3 / 24" index and category label
- **Smooth transitions** throughout (grid entrance, filtering, lightbox open/close,
  image swaps) and `prefers-reduced-motion` is respected.

## Using your own photos

Open `js/script.js` and edit the `WORKS` array at the top. Each entry looks like:

```js
{ id: 1, title: "Silver Stream", category: "nature", w: 700, h: 900, picId: 1015 }
```

- `title` / `category` — shown in the overlay and lightbox. Categories must match
  one of the filter buttons in `index.html` (`nature`, `architecture`, `people`,
  `travel`, `animals` — or add your own button + category pair).
- `w` / `h` — the image's rough aspect ratio, used for the masonry layout.
- `picId` is only used by the built-in `srcFor()` helper, which currently points at
  placeholder images from picsum.photos. To use your own images, replace `srcFor()`
  with a function that returns a path to your file, e.g. add an `src: "images/foo.jpg"`
  field to each work and change `srcFor` to just return `work.src`.

## Notes

- The gallery ships with 24 placeholder photos loaded from picsum.photos, so an
  internet connection is needed to see images the first time you open it. Swap in
  local files (e.g. an `images/` folder) if you need it to work fully offline.
