/* Hero scenes, in loop order. The engine in js/hero.js reads only this array.
   Stage units: 1600 by 900, painted with SVG preserveAspectRatio slice, so keep each subject near the centre (800, 450).
   A scene: id, chip, status {label, number}, link (kept for a future chip or tab UI), textTone ("ink" or "paper"),
   scrim {color, opacity} (soft blurred shape behind the text, in the scene's own colour), safeZone [[x, y, w, h] per headline line, as fractions],
   layers {sky, subject, fg} (symbol ids in the page sprite), focal [x, y], palette (cool to hot),
   formation {preset: spiral | rainfill | grid | flow | mesh | scatter, options}, glyphs,
   timeline {camera {from, to: [panX, panY, zoom]}, spark [[s, x, y], ...], tracks [{k: data-k name, p: o | tx | ty | dash, keys: [[s, v], ...]}]},
   joinIn and joinOut (condense | mist-to-grid | peel-to-tokens | tighten-to-mesh | release-to-points), hold and join in seconds.
   See README.md, "Adding a hero scene". */
window.HERO_SCENES = [
  {
    id: "observatory",
    chip: "Five years modelling star-forming clouds: 1,000+ coupled equations, one solver, under two minutes.",
    status: { label: "RADIO TELESCOPE", number: "1000+ PDES" },
    link: "journey.html#phd",
    textTone: "ink", scrim: { color: "#e9eaf5", opacity: .45 }, safeZone: [[.06, .4, .4, .2], [.55, .62, .36, .2]],
    layers: { sky: "s1-sky", subject: "s1-subject", fg: "s1-fg" },
    focal: [714.8, 255.1],
    palette: ["#7c86dc", "#f7d5b5", "#ef6a2a"],
    formation: { preset: "spiral", options: { reverse: 1, cx: 380, cy: 185, r: 125, flat: 0.55, tilt: -0.35, arms: 2, turns: 1.35, spread: 9, ground: [330, 664, 860, 790], funnel: [714.8, 255.1], route: [[714.8, 255.1, 24], [880, 350, 60], [990, 400, 16], [990, 560, 22], [900, 650, 40]], rise: [.3, 3.4], dur: 2.4 } },
    glyphs: "0123456789".split(""),
    timeline: {
      camera: { from: [0, 0, 1], to: [-30, -12, 1.04] },
      spark: [[0, 380, 185], [3.2, 384, 187], [3.9, 547, 205], [4.2, 714.8, 255.1], [4.5, 880, 350], [4.75, 990, 400], [5.05, 990, 560], [5.3, 900, 650], [5.7, 640, 720]],
      tracks: [{ k: "domeglow", p: "o", keys: [[0, .45], [5, .9]] }]
    },
    joinIn: "release-to-points", joinOut: "condense", hold: 6, join: 2
  },
  {
    id: "river",
    chip: "Tanzania, 2023: 20+ data sources into one forecast, and the warning by SMS before the river rose.",
    status: { label: "RIVER", number: "20+ SOURCES" },
    link: "journey.html#omdena",
    textTone: "paper", scrim: { color: "#3d4270", opacity: .85 }, safeZone: [[.06, .16, .4, .2], [.55, .6, .36, .2]],
    layers: { sky: "s2-sky", subject: "s2-subject", fg: "s2-fg" },
    focal: [800, 470],
    palette: ["#f4f4f7", "#e9eaf5", "#3d4270"],
    formation: { preset: "rainfill", options: { line: [[800,470],[805,476],[809,482],[813,488],[817,494],[819,500],[822,506],[823,512],[824,518],[825,524],[825,530],[824,536],[823,542],[821,548],[819,554],[816,560],[812,566],[808,573],[803,579],[798,586],[792,592],[785,599],[778,606],[770,613],[762,620],[755,626],[749,633],[743,640],[738,647],[733,655],[729,663],[725,672],[722,680],[720,690],[718,699],[717,709],[716,720],[716,730],[717,741],[718,753],[720,764],[722,776],[725,788],[728,801],[733,814],[738,827],[743,841],[749,855],[756,869],[763,883],[771,898]], half: [470, 16, 900, 336], cell: [13, 13], x0: 300, x1: 1300, y1: 900, cloud: [175, 38], fill: [.9, 4.4], fall: .75 } },
    glyphs: "0123456789".split(""),
    timeline: {
      camera: { from: [0, -10, 1.16], to: [20, 0, 1] },
      spark: [[0,770,190],[1.3,770,196],[1.95,770,612],[2.8,720,690],[3.6,725,790],[4.3,792,860]],
      tracks: [
        { k: "gauge", p: "ty", keys: [[0, 0], [1.4, 0], [4.6, -84]] },
        { k: "water", p: "o", keys: [[0, 0], [1.1, 0], [4.6, .35]] },
        { k: "alert", p: "o", keys: [[0, 0], [4.3, 0], [4.8, 1]] },
        { k: "cur", p: "dash", keys: [[0, 1400], [3.8, 1400], [5.6, 0]] }
      ]
    },
    joinIn: "condense", joinOut: "mist-to-grid", hold: 6, join: 2
  },
  {
    id: "foundry",
    chip: "PorosAI: porosity predicted from the design, before anyone pours metal.",
    status: { label: "FOUNDRY", number: "R² > 0.95" },
    link: "work.html#porosai",
    textTone: "paper", scrim: { color: "#2a2d4d", opacity: .85 }, safeZone: [[.06, .16, .4, .2], [.55, .6, .36, .2]],
    layers: { sky: "s3-sky", subject: "s3-subject", fg: "s3-fg" },
    focal: [790, 420],
    palette: ["#7c86dc", "#f7d5b5", "#ef6a2a"],
    formation: { preset: "grid", options: { mask: "M786 362C756 280 760 188 808 122C834 114 862 120 876 134C852 204 840 282 816 362Z", cell: 6, box: [754, 110, 124, 254],
      hot: [[801, 350, 20, .95], [790, 296, 24, .72], [786, 200, 16, .42], [846, 128, 16, .5]],
      warm: [2.3, 3.1], cool: null, pulseEnd: 4.4, curve: [884, 196, 46, 32, 2.7], ring: [2.6, 801, 350] } },
    glyphs: "0123456789".split(""),
    timeline: {
      camera: { from: [0, 0, 1], to: [56, -980, 4], keys: [[0, 0, 0, 1], [.5, 0, 0, 1], [2.4, 56, -980, 4], [8, 61, -986, 4.08]] },
      spark: [[0, 800, 200], [1, 790, 250], [2, 796, 300], [2.6, 801, 350]],
      tracks: [{ k: "heatglow", p: "o", keys: [[0, .15], [2.6, .85]] }]
    },
    joinIn: "mist-to-grid", joinOut: "peel-to-tokens", hold: 6, join: 2
  },
  {
    id: "network",
    chip: "Physics-informed surrogates: the design goes in, the porosity field comes out, R² above 0.95 on unseen geometries.",
    status: { label: "NEURAL NETWORK", number: "R² > 0.95" },
    link: "work.html#porosai",
    textTone: "ink", scrim: { color: "#f4f4f7", opacity: .55 }, safeZone: [[.06, .1, .4, .2], [.55, .6, .36, .2]],
    layers: { sky: "s4-sky", subject: "s4-subject", fg: "s4-fg" },
    focal: [855, 310],
    palette: ["#7c86dc", "#f7d5b5", "#ef6a2a"],
    formation: { preset: "flow", options: { inputs: [], outputs: [], nodes: [[758.9,217],[758.9,254.2],[758.9,291.4],[758.9,328.6],[758.9,365.8],[758.9,403],[858.1,254.2],[858.1,291.4],[858.1,328.6],[858.1,365.8],[951.1,310]], edges: [[0,6],[0,7],[0,8],[0,9],[1,6],[1,7],[1,8],[1,9],[2,6],[2,7],[2,8],[2,9],[3,6],[3,7],[3,8],[3,9],[4,6],[4,7],[4,8],[4,9],[5,6],[5,7],[5,8],[5,9],[6,10],[7,10],[8,10],[9,10]],
      edgeAlpha: .2, ring: [5, 9], act: [0.22,1,1,1,1,0.22,0.22,1,1,0.22,1], bloomAt: [1.1,1.13,1.16,1.19,1.22,1.25,1.8,1.83,1.86,1.89,2.5], edgeDur: .6, edgeFrom: .3, hotLines: [[520,400,758.9,254.2,1.4,0.6],[520,400,758.9,291.4,1.4,0.6],[520,400,758.9,328.6,1.4,0.6],[520,400,758.9,365.8,1.4,0.6],[758.9,254.2,858.1,291.4,2,0.7],[758.9,291.4,858.1,291.4,2,0.7],[758.9,328.6,858.1,328.6,2,0.7],[758.9,365.8,858.1,328.6,2,0.7],[858.1,291.4,951.1,310,2.7,0.6],[858.1,328.6,951.1,310,2.7,0.6]],
      screen: { mask: "M323.3 466.6C306.8 421.5 309 370.9 335.4 334.6C349.7 330.2 365.1 333.5 372.8 341.2C359.6 379.7 353 422.6 339.8 466.6Z", cell: 5, box: [305.3, 329.8, 46, 138], hot: [[321.8,460,12.9,0.95],[318.2,428.8,14.7,0.75],[314.5,379.3,12.9,0.4],[351.2,337.2,9.2,0.5]], warm: [0, .01], cool: null, fadeAt: 4.8 },
      dim: -1, lit: -1, switchAt: 9, ride: 1, outAt: 9 } },
    glyphs: "0123456789".split(""),
    timeline: {
      camera: { from: [16, 0, 1.02], to: [-12, 0, 1] },
      spark: [[0,321.8,458.2],[0.8,321.8,458.2],[1.4,520,400],[2,758.9,291.4],[2.7,858.1,291.4],[3.3,951.1,310],[3.8,951.1,440],[4.3,720,460],[4.8,520,470],[5.1,340,420]],
      sparks: [[[1.4,520,400],[2,758.9,254.2],[2.7,858.1,291.4]],[[1.4,520,400],[2,758.9,328.6],[2.7,858.1,328.6],[3.3,951.1,310]],[[1.4,520,400],[2,758.9,365.8],[2.7,858.1,328.6]]],
      tracks: [{ k: "ret", p: "dash", keys: [[0, 900], [3.3, 900], [4.8, 0]] }, { k: "outblade", p: "o", keys: [[0, 0], [4.8, 0], [5.1, 1]] }, { k: "oldblade", p: "o", keys: [[0, 1], [4.8, 1], [5.1, 0]] }, { k: "tick", p: "o", keys: [[0, 0], [5.1, 0], [5.3, 1]] }]
    },
    joinIn: "peel-to-tokens", joinOut: "mist-to-grid", hold: 6, join: 2
  },
  {
    id: "assistant",
    chip: "A RAG layer over casting literature: the question goes in, the answer comes back with its sources.",
    status: { label: "CASTING ASSISTANT", number: "3 SOURCES" },
    link: "work.html#porosai",
    textTone: "ink", scrim: { color: "#f4f4f7", opacity: .55 }, safeZone: [[.06, .1, .4, .2], [.55, .6, .36, .2]],
    layers: { sky: "s5-sky", subject: "s5-subject", fg: "s5-fg" },
    focal: [815, 405],
    palette: ["#7c86dc", "#f7d5b5", "#ef6a2a"],
    formation: { preset: "flow", options: { inputs: [[410,360,520,360,580,380,690,380],[410,430,520,430,580,420,690,420],[410,500,520,500,580,460,690,460]], outputs: [[940,405,1010,405,1050,400,1110,400]], nodes: [], edges: [],
      outWords: ["0.12", "-0.87", "0.44", "1.03"], tokens: 3, spacing: .3, ride: 1.4, outAt: 2.4, dim: -1, lit: -1, switchAt: 9,
      matrix: { box: [712, 316, 206, 176], cell: [26, 16], at: [1.2, 2.4] } } },
    glyphs: ["porosity", "gate", "shrinkage", "casting", "defect", "mould"],
    timeline: {
      camera: { from: [-14, 0, 1], to: [14, -6, 1.03] },
      spark: [[0, 330, 440], [.6, 410, 430], [1.4, 690, 420], [2, 815, 405], [2.6, 940, 405], [3.2, 1110, 400], [3.6, 1180, 380], [4.1, 1240, 390]],
      tracks: [{ k: "q", p: "o", keys: [[0, 0], [.3, 0], [.7, 1]] }, { k: "typing", p: "o", keys: [[0, 0], [3.2, 0], [3.4, 1], [3.9, 1], [4, 0]] }, { k: "a", p: "o", keys: [[0, 0], [3.9, 0], [4.3, 1]] }]
    },
    joinIn: "mist-to-grid", joinOut: "peel-to-tokens", hold: 6, join: 2
  },
  {
    id: "decodex",
    chip: "Decodex: academic CVs in, industry-ready bullets out, on one LLM gateway with a fallback model.",
    status: { label: "DECODEX", number: "40+ USERS" },
    link: "work.html#decodex",
    textTone: "ink", scrim: { color: "#f4f4f7", opacity: .55 }, safeZone: [[.06, .1, .4, .2], [.55, .6, .36, .2]],
    layers: { sky: "s6-sky", subject: "s6-subject", fg: "s6-fg" },
    focal: [800, 450],
    palette: ["#7c86dc", "#f7d5b5", "#ef6a2a"],
    formation: { preset: "flow", options: { inputs: [[400,400,500,380,590,406,700,406],[400,470,500,494,590,462,700,462]], outputs: [[900,462,960,462,1030,420,1104,420]], nodes: [], edges: [],
      outWords: ["impact", "pipeline", "scaled", "shipped"], tokens: 3, spacing: .3, ride: 1.4, outAt: 2.4, dim: 0, lit: 1, switchAt: 1.6 } },
    glyphs: ["PDEs", "solver", "thesis", "HPC", "postdoc", "cohort"],
    timeline: {
      camera: { from: [-14, 0, 1], to: [14, -6, 1.03] },
      spark: [[0, 300, 470], [.6, 400, 470], [1.4, 690, 462], [2, 800, 450], [2.6, 900, 462], [3.2, 1104, 420], [3.6, 1170, 414], [4.1, 1250, 430]],
      tracks: [{ k: "la", p: "o", keys: [[0, 1], [1.5, 1], [1.8, .35]] }, { k: "lb", p: "o", keys: [[0, 0], [1.5, 0], [1.8, 1]] },
        { k: "c4", p: "o", keys: [[0, 1], [2.1, 1], [2.3, 0]] }, { k: "c3", p: "o", keys: [[0, 0], [2.1, 0], [2.3, 1]] },
        { k: "b1", p: "o", keys: [[0, 0], [3.1, 0], [3.4, 1]] }, { k: "b2", p: "o", keys: [[0, 0], [3.4, 0], [3.7, 1]] }, { k: "b3", p: "o", keys: [[0, 0], [3.7, 0], [4, 1]] },
        { k: "fit", p: "o", keys: [[0, 0], [4.1, 0], [4.5, 1]] }]
    },
    joinIn: "peel-to-tokens", joinOut: "release-to-points", hold: 6, join: 2
  }
];
