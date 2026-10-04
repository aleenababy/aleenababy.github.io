# aleenababy.github.io

Personal site of Dr. Aleena Baby. Plain static HTML, one stylesheet, three small scripts. No framework, no build step, no runtime CDN calls. Every page opens from `file://` and runs unchanged on GitHub Pages.

Live at https://aleenababy.github.io/

## What is here

```
index.html              Home: hero, marquee, facts, selected work, latest writing, journey teaser
css/style.css           Design tokens and all layout
js/main.js              Email assembly, mobile nav, scroll reveal, count-up, progress bar
js/hero-scenes.js       The five hero scenes, as data. Edit this to change the loop.
js/hero.js              The hero engine. Reads only window.HERO_SCENES.
assets/favicon.svg
assets/fonts/           Inter, Source Serif 4, JetBrains Mono (self-hosted woff2)
assets/img/             Photography
```

## Design system

| Token | Hex | Use |
|---|---|---|
| Paper | `#f4f4f7` | Page background |
| Pale periwinkle | `#e9eaf5` | Alternating sections |
| Ink | `#15161d` | Text, rules, line work |
| Ember | `#ef6a2a` | The single accent |
| Periwinkle | `#7c86dc` | Cool fields, hero sky |
| Apricot | `#f7d5b5` | Warm middle of ramps |

Type: Source Serif 4 for headings, Inter for body, JetBrains Mono for labels and numbers. Every ramp runs periwinkle to apricot to ember. The Academia to Industry palette (teal, cream, navy) is deliberately not used here; this site has its own identity.

Copy rules: no em dashes, first person, numbers carry the claims. Personality is welcome, performance is not.

## The hero

A painted loop of five scenes, told by one spark, about 40 seconds end to end. Painted layers are SVG symbols in the page sprite, moved with CSS transforms for parallax. The data layer is one canvas particle pool that re-forms at every join.

The loop pauses when the tab is hidden, when the hero scrolls out of view, and entirely under `prefers-reduced-motion: reduce`.

### Adding a hero scene

Scenes live in `js/hero-scenes.js` as one array, in loop order. The engine reads nothing else. To add a sixth scene, append one object:

```js
{
  id: "optimisation",
  chip: "Inverse design: target quality in, process parameters out.",
  status: { label: "OPTIMISATION", number: "5 CYCLES SAVED" },
  link: "work.html#porosai",
  textTone: "ink",
  scrim: { color: "#e9eaf5", opacity: 0.55 },
  safeZone: [[0.05, 0.15, 0.45, 0.22], [0.5, 0.55, 0.45, 0.22]],
  layers: { sky: "s6-sky", subject: "s6-subject", fg: "s6-fg" },
  focal: [800, 450],
  palette: ["#7c86dc", "#f7d5b5", "#ef6a2a"],
  formation: { preset: "flow", options: {} },
  glyphs: ["0", "1", "·"],
  timeline: { camera: { from: [0, 0, 1], to: [-20, 6, 1.04] }, spark: [[0, 300, 500], [4, 1100, 420]], tracks: [] },
  joinIn: "tighten-to-mesh",
  joinOut: "release-to-points",
  hold: 5,
  join: 2
}
```

Then draw three SVG symbols with ids `s6-sky`, `s6-subject`, `s6-fg` into the sprite at the top of the hero section in `index.html`. Stage units are 1600 by 900, painted with `preserveAspectRatio="xMidYMid slice"`, so keep the subject near the centre at (800, 450) and leave the headline safe zones clear. Removing a scene means deleting one object.

Formation presets: `spiral`, `rainfill`, `grid`, `flow`, `mesh`, `scatter`. Join presets: `condense`, `mist-to-grid`, `peel-to-tokens`, `tighten-to-mesh`, `release-to-points`.

## Before publishing

- [x] Email wired in `js/main.js`: stored as shifted numbers and assembled only on a genuine click, so it never appears in the HTML.
- [ ] Resolve `[VERIFY: B2 certified yet?]` in the facts strip.
- [ ] Replace the `[DATE]` placeholder on the first blog card.
- [ ] Supply the three Selected work images: a PorosAI image cleared for publication, a Decodex screenshot, an OpenFOAM field render.
- [ ] Add `cv/Dr_Aleena_Baby_CV.pdf`. Two fixes in the source first: "Published peer-reviewed research" becomes "Co-authored peer-reviewed research", and "Access e.V" becomes "ACCESS e.V."
- [ ] Build the pages the navigation already links to: `work.html`, `journey.html`, `research.html`, `blog/index.html`, `blog/leakage-grouped-holdout.html`, `feed.xml`.

## Local preview

```
python3 -m http.server 8777
```

Then open http://localhost:8777/.
