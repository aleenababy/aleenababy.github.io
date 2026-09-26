/* Painted career loop for the Home hero.
   Painted layers: SVG symbols in the page sprite (sky, subject, foreground per scene), moved with CSS transforms for parallax.
   Data layer: one canvas particle pool (digits, tokens, mesh nodes) plus the spark, re-forming at every join.
   The engine reads only window.HERO_SCENES (js/hero-scenes.js). See README.md, "Adding a hero scene". */
(function (W) {
  "use strict";
  var INK = "#15161d", PAPER = "#f4f4f7", STEPS = 7, TAU = 6.2832, SW = 1600, SH = 900, SUBJ = .6;
  var MONO = '"JetBrains Mono", ui-monospace, Menlo, Consolas, monospace';
  var BASE = "0123456789·+".split("");
  var JOINS = {
    "condense": { via: 1, swirl: .2 },
    "mist-to-grid": { lift: 170, mid: "·", swirl: .3 },
    "peel-to-tokens": { lift: 150, flip: 1, swirl: .35 },
    "tighten-to-mesh": { swirl: .15 },
    "release-to-points": { lift: 240, mid: "·", swirl: .45 }
  };

  function rng(seed) { var s = seed >>> 0 || 7; return function () { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return (s >>> 0) / 4294967296; }; }
  function cl(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function ease(k) { return k < .5 ? 4 * k * k * k : 1 - Math.pow(2 - 2 * k, 3) / 2; }
  function back(k) { var c = 1.9, q = k - 1; return 1 + (c + 1) * q * q * q + c * q * q; }
  function hex(h) { var n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; }
  var RC = {};
  function ramp(pal, t) {
    t = Math.round(cl(t) * 24) / 24; var ck = pal.join() + t; if (RC[ck]) return RC[ck];
    var n = pal.length - 1, x = t * n, i = Math.min(n - 1, Math.floor(x)), f = x - i, a = hex(pal[i]), b = hex(pal[i + 1]);
    return (RC[ck] = "rgb(" + [0, 1, 2].map(function (j) { return Math.round(a[j] + (b[j] - a[j]) * f); }).join(",") + ")");
  }
  function mk(w, h) { var c = document.createElement("canvas"); c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h)); return c; }
  function bez(p, t) { var u = 1 - t, a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, d = t * t * t; return [a * p[0] + b * p[2] + c * p[4] + d * p[6], a * p[1] + b * p[3] + c * p[5] + d * p[7]]; }
  function gauss(R) { var m = Math.sqrt(-2 * Math.log(R() || 1e-9)), v = TAU * R(); return [m * Math.cos(v), m * Math.sin(v)]; }
  function shuffle(a, R) { for (var i = a.length - 1; i > 0; i--) { var j = (R() * (i + 1)) | 0, t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function segDist(x, y, P) { var best = 1e18; for (var i = 0; i < P.length - 1; i++) { var a = P[i], b = P[i + 1], dx = b[0] - a[0], dy = b[1] - a[1], t = cl(((x - a[0]) * dx + (y - a[1]) * dy) / (dx * dx + dy * dy || 1)), px = a[0] + dx * t - x, py = a[1] + dy * t - y; best = Math.min(best, px * px + py * py); } return Math.sqrt(best); }
  function inPoly(x, y, P) { var c = false; for (var i = 0, j = P.length - 1; i < P.length; j = i++) if ((P[i][1] > y) !== (P[j][1] > y) && x < (P[j][0] - P[i][0]) * (y - P[i][1]) / (P[j][1] - P[i][1]) + P[i][0]) c = !c; return c; }
  function keyAt(keys, t) {
    if (!keys || !keys.length) return 0; if (t <= keys[0][0]) return keys[0][1];
    for (var i = 1; i < keys.length; i++) if (t < keys[i][0]) { var a = keys[i - 1], b = keys[i]; return a[1] + (b[1] - a[1]) * ease((t - a[0]) / (b[0] - a[0])); }
    return keys[keys.length - 1][1];
  }
  function chain(pts, e) {
    var n = pts.length - 1, f = cl(e) * n, i = Math.min(n - 1, Math.floor(f)), u = f - i, A = pts[Math.max(0, i - 1)], B = pts[i], C = pts[i + 1], D = pts[Math.min(n, i + 2)];
    return [cr(A[0], B[0], C[0], D[0], u), cr(A[1], B[1], C[1], D[1], u)];
  }
  function cr(a, b, c, d, u) { var u2 = u * u; return .5 * (2 * b + (c - a) * u + (2 * a - 5 * b + 4 * c - d) * u2 + (3 * b - a - 3 * c + d) * u2 * u); }
  function along(K, t) {
    var n = K.length; if (!n) return [SW / 2, SH / 2];
    if (t <= K[0][0]) return [K[0][1], K[0][2]]; if (t >= K[n - 1][0]) return [K[n - 1][1], K[n - 1][2]];
    for (var i = 0; i < n - 2 && t >= K[i + 1][0]; i++);
    var u = (t - K[i][0]) / (K[i + 1][0] - K[i][0]); if (i === n - 2) u = 1 - (1 - u) * (1 - u);
    var A = K[Math.max(0, i - 1)], B = K[i], C = K[i + 1], D = K[Math.min(n - 1, i + 2)];
    return [cr(A[1], B[1], C[1], D[1], u), cr(A[2], B[2], C[2], D[2], u)];
  }

  /* Particle formations. Each returns { slots, geo }. A slot is where one particle lives in this scene:
     x, y final position; sx, sy start (where the join lands it); ta..tb (ms) the move from start to final during the hold,
     via cx, cy, along lane (a cubic Bezier, u0 to u1), or as a straight fall; c, c2 at t2, c3 at t3 ramp positions (-1 = ink);
     a alpha, a0 alpha before arrival, a2 at ta2; g glyph; sm small glyph; p keep on small pools; pulse until t3; ob overshoot; sq squash on landing. */
  var F = {};
  F.scatter = function (o, sc, R) {
    var b = o.box || [300, 150, 1000, 600], s = [];
    for (var i = 0; i < (o.count || 1400); i++) s.push({ x: b[0] + R() * b[2], y: b[1] + R() * b[3], c: R(), a: .8 });
    return { slots: s };
  };
  F.spiral = function (o, sc, R) {
    var s = [], n = o.count || 1400, gr = o.ground, guard = 0;
    while (s.length < n && guard++ < n * 4) {
      var arm = s.length % o.arms, t = Math.pow(R(), .75), th = arm * TAU / o.arms + t * o.turns * TAU, g = gauss(R), sp = o.spread * (.3 + t);
      var lx = Math.cos(th) * t * o.r + g[0] * sp, ly = Math.sin(th) * t * o.r + g[1] * sp;
      if (R() < .12) { var a = R() * TAU, r = Math.sqrt(R()) * o.r; lx = Math.cos(a) * r; ly = Math.sin(a) * r; }
      var rr = Math.hypot(lx, ly); if (rr > o.r) continue;
      ly *= o.flat || 1; var ct = Math.cos(o.tilt || 0), st = Math.sin(o.tilt || 0), x = o.cx + lx * ct - ly * st, y = o.cy + lx * st + ly * ct;
      var ta = (o.rise[0] + Math.pow(R(), 1.2) * (o.rise[1] - o.rise[0])) * 1000, tb = ta + o.dur * 1000 * (.8 + .4 * R());
      var gx = gr[0] + R() * (gr[2] - gr[0]), gy = gr[1] + Math.round(R() * (gr[3] - gr[1]) / 11) * 11, hot = cl(1.05 - rr / o.r);
      s.push(o.reverse
        ? { x: gx, y: gy, sx: x, sy: y, pts: [[x, y]].concat((o.route || [o.funnel]).map(function (q) { return [q[0] + (R() - .5) * (q[2] || 30), q[1] + (R() - .5) * (q[2] || 30)]; }), [[gx, gy]]), ta: ta, tb: tb, c: hot, a: .9, c2: -1, t2: tb - 300, sm: 1 }
        : { x: x, y: y, sx: gx, sy: gy, cx: o.funnel[0] + (R() - .5) * 60, cy: o.funnel[1] + (R() - .5) * 60, ta: ta, tb: tb, c: .5, a: .9, c2: hot, t2: tb, sm: 1 });
    }
    return { slots: s };
  };
  F.rainfill = function (o, sc, R) {
    var s = [], P = o.line, x, y, y0 = 1e9, y1 = -1e9, hv = o.half, hf = typeof hv === "number" ? function () { return hv; } : function (yy) { return hv[1] + (hv[3] - hv[1]) * (yy - hv[0]) / (hv[2] - hv[0]); }, mh = typeof hv === "number" ? hv : Math.max(hv[1], hv[3]);
    P.forEach(function (p) { y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); });
    if (o.y1) y1 = Math.min(y1, o.y1);
    for (y = y0; y <= y1 + (typeof hv === "number" ? hv : 0); y += o.cell[1]) for (x = o.x0; x <= o.x1; x += o.cell[0]) {
      var d = segDist(x, y, P) / Math.max(4, hf(y)); if (d > 1) continue;
      var tf = (o.fill[0] + d * (o.fill[1] - o.fill[0]) + R() * .25) * 1000, fall = o.fall * 1000 * (.85 + .3 * R());
      var cy = o.cloud[0] + gauss(R)[0] * o.cloud[1] * (1 - .45 * Math.abs(x - 800) / 800);
      s.push({ x: x, y: y, sx: x, sy: cy, ta: tf - fall, tb: tf, fall: 1, sq: 1, c: 0, a: .72, c2: .45 + .55 * (1 - d), t2: tf });
    }
    return { slots: s, geo: o };
  };
  F.grid = function (o, sc, R) {
    var s = [], cells = [], b = o.box, path = new Path2D(o.mask || sc.silhouette), cx = mk(1, 1).getContext("2d"), x, y;
    for (y = b[1]; y <= b[1] + b[3]; y += o.cell) for (x = b[0]; x <= b[0] + b[2]; x += o.cell) {
      if (!cx.isPointInPath(path, x, y)) continue;
      var v = 0; o.hot.forEach(function (h) { var dx = x - h[0], dy = y - h[1]; v += h[3] * Math.exp(-(dx * dx + dy * dy) / (2 * h[2] * h[2])); });
      v = cl(v + (R() - .5) * .08);
      var t2 = (o.warm[0] + R() * (o.warm[1] - o.warm[0])) * 1000, t3 = v > .3 && o.cool ? (o.cool[0] + R() * (o.cool[1] - o.cool[0])) * 1000 : 1e9;
      s.push({ x: x, y: y, c: -1, a: .85, g: String(Math.min(9, Math.floor(v * 10))), d: .7 * (b[1] + b[3] - y) / b[3] + .3 * R() });
      cells.push([x, y, v, t2, t3]);
    }
    o.cells = cells; return { slots: s, geo: o };
  };
  F.flow = function (o, sc, R) {
    var s = [], words = sc.glyphs, wi = 0, et = [], nt = [];
    function lane(p, li, out) {
      var nTok = out ? (o.outWords ? 4 : 3) : (o.tokens || 5), k, t0 = out ? o.outAt * 1000 : 200 + li * 120;
      for (k = 0; k < nTok; k++) {
        var sp = o.spacing || (out ? .28 : .17), u1 = out ? .14 + k * (o.outWords ? .22 : .28) : .1 + k * sp, u0 = u1 - (out ? .45 : .38), q1 = bez(p, u1);
        var sl = { x: q1[0], y: q1[1], lane: p, u0: u0, u1: u1, ta: t0, tb: t0 + o.ride * 1000, lin: 1, c: out && o.outWords ? .95 : -1, g: out && o.outWords ? o.outWords[k % o.outWords.length] : words[wi++ % words.length], p: 1 };
        var q0 = bez(p, Math.max(0, u0)); sl.sx = q0[0]; sl.sy = q0[1];
        if (!out && li === o.dim) { sl.a2 = .3; sl.ta2 = o.switchAt * 1000; }
        s.push(sl);
      }
      for (k = 0; k <= 60; k++) {
        var q = bez(p, k / 60), dot = { x: q[0], y: q[1], c: 0, g: "·", a: .75 };
        if (!out && li === o.dim) { dot.a2 = .25; dot.ta2 = o.switchAt * 1000; }
        if (!out && li === o.lit) { dot.c2 = 1; dot.t2 = o.switchAt * 1000; }
        s.push(dot);
      }
    }
    o.inputs.forEach(function (p, i) { lane(p, i, 0); });
    o.outputs.forEach(function (p, i) { lane(p, i, 1); });
    o.nodes.forEach(function (n, ni) {
      var ta = (o.bloomAt ? o.bloomAt[ni] : o.bloom[0] + ni * o.bloom[1]) * 1000, rg = o.ring || [9, 17], av = o.act ? o.act[ni] : 1; nt.push(ta);
      for (var i = 0; i < 30; i++) { var inner = i < 12, r = inner ? rg[0] : rg[1], a = i / (inner ? 12 : 18) * TAU;
        s.push({ x: n[0] + Math.cos(a) * r, y: n[1] + Math.sin(a) * r, sx: n[0], sy: n[1], ta: ta, tb: ta + 700, ob: 1, a0: 0, c: inner ? av : av * .5, g: "·", d: .85 + R() * .15 }); }
    });
    if (o.matrix) { var mb = o.matrix.box, mc = o.matrix.cell, mt = o.matrix.at, cols = Math.floor(mb[2] / mc[0]);
      for (var my = mb[1]; my <= mb[1] + mb[3]; my += mc[1]) for (var mx = 0; mx < cols; mx++) { var tx0 = (mt[0] + (mt[1] - mt[0]) * mx / cols) * 1000, vv = R();
        s.push({ x: mb[0] + mx * mc[0] + mc[0] / 2, y: my, sx: mb[0] - 20, sy: my + (R() - .5) * 30, ta: tx0, tb: tx0 + 500, a0: 0, c: vv, g: String(Math.floor(vv * 10)), p: 1 }); } }
    if (o.screen) { var gs = F.grid(o.screen, sc, R); gs.slots.forEach(function (sl, i) { sl.c = gs.geo.cells[i][2]; sl.a = .95; sl.sm = 1; sl.p = 1; if (o.screen.fadeAt) { sl.a2 = 0; sl.ta2 = o.screen.fadeAt * 1000; } }); s = s.concat(gs.slots); }
    o.edges.forEach(function (e) { et.push(o.edgeFrom != null ? nt[e[0]] + o.edgeFrom * 1000 : Math.max(nt[e[0]], nt[e[1]]) + 250); });
    return { slots: s, geo: { nodes: o.nodes, edges: o.edges, et: et, counter: o.counter, hot: o.hot, hl: o.hotLines, ea: o.edgeAlpha, ed: (o.edgeDur || .52) * 1000, rr: (o.ring || [9, 17])[1] + 5 } };
  };
  F.mesh = function (o, sc, R) {
    var nx = Math.floor((o.x1 - o.x0) / o.h) + 1, ny = Math.floor((o.y1 - o.y0) / o.h) + 1, id = [], nodes = [], s = [], edges = [], i, j;
    var foil = o.foil, le = foil[0], te = foil.reduce(function (m, p) { return p[0] > m[0] ? p : m; }, foil[0]);
    for (j = 0; j < ny; j++) for (i = 0; i < nx; i++) {
      var x = o.x0 + i * o.h, y = o.y0 + j * o.h;
      if (i && j && i < nx - 1 && j < ny - 1) { x += (R() - .5) * o.h * .36; y += (R() - .5) * o.h * .36; }
      var dp = segDist(x, y, foil.concat([foil[0]]));
      if (inPoly(x, y, foil) || dp < 6) { id.push(-1); continue; }
      var chordY = le[1] + (te[1] - le[1]) * cl((x - le[0]) / (te[0] - le[0])), v = .42;
      if (x > le[0] - 20 && x < te[0] + 10) v += (y < chordY ? .55 : .18) * Math.exp(-dp / 55);
      v -= .42 * Math.exp(-Math.hypot(x - le[0], y - le[1]) / 45);
      if (x > te[0]) v -= .32 * Math.exp(-Math.pow(y - te[1], 2) / 1800 - (x - te[0]) / 420);
      id.push(nodes.length); nodes.push([x, y, i, cl(v)]);
      s.push({ x: x, y: y, c: -1, g: "+", a: .9, c2: cl(v), t2: o.colorAt * 1000 + (x - o.x0) / (o.x1 - o.x0) * o.sweep * 1000 });
    }
    function e(a, b) { if (a >= 0 && b >= 0) edges.push([a, b]); }
    for (j = 0; j < ny; j++) for (i = 0; i < nx; i++) {
      var a = id[j * nx + i], r = i < nx - 1 ? id[j * nx + i + 1] : -1, dn = j < ny - 1 ? id[(j + 1) * nx + i] : -1, dg = i < nx - 1 && j < ny - 1 ? id[(j + 1) * nx + i + 1] : -1;
      e(a, r); e(a, dn); if ((i + j) % 2) e(a, dg); else e(r, dn);
    }
    var adj = nodes.map(function () { return []; }), dist = nodes.map(function (n) { return n[2] === 0 ? 0 : -1; }), qu = [];
    edges.forEach(function (ed) { adj[ed[0]].push(ed[1]); adj[ed[1]].push(ed[0]); });
    dist.forEach(function (d, k) { if (!d) qu.push(k); });
    for (i = 0; i < qu.length; i++) adj[qu[i]].forEach(function (m) { if (dist[m] < 0) { dist[m] = dist[qu[i]] + 1; qu.push(m); } });
    return { slots: s, geo: { nodes: nodes, edges: edges, dist: dist, pulse: o.pulse, te: te[0], field: [o.colorAt * 1000, o.sweep * 1000, o.x0, o.x1] } };
  };

  /* Decorations drawn in stage units, in the scene's text tone. */
  var D = {};
  function label(x, E, t, px, py, col, al) { x.font = "400 " + (11 / E.A) + "px " + MONO; x.textAlign = al || "left"; x.textBaseline = "middle"; x.fillStyle = col; x.fillText(t, px, py); }
  D.grid = function (x, g, hk, a, E, sc, tone) {
    var c = g.curve, ring = g.ring, h = g.cell / 2 - .6;
    g.cells.forEach(function (q) {
      var v = hk < q[3] ? .04 + (q[2] - .04) * 0 : q[2], w = 1;
      if (hk >= q[3]) v = .04 + (q[2] - .04) * cl((hk - q[3]) / 500);
      if (hk >= q[4]) v = q[2] + (q[2] * .22 - q[2]) * cl((hk - q[4]) / 700);
      var pe = g.pulseEnd ? g.pulseEnd * 1000 : q[4];
      if (q[2] > .6 && hk < pe + 700) { var pw = .72 + .28 * Math.sin(hk / 280 + (q[0] + q[1]) * .05); w = hk < pe ? pw : pw + (1 - pw) * cl((hk - pe) / 700); }
      x.globalAlpha = a * .82 * w; x.fillStyle = E.ramp(sc.palette, v); x.fillRect(q[0] - h, q[1] - h, 2 * h, 2 * h);
    });
    if (ring) { var f = (hk - ring[0] * 1000) / 900; if (f > 0 && f < 1) { x.globalAlpha = a * (1 - f); x.strokeStyle = PAPER; x.lineWidth = 1.5 * E.px; x.beginPath(); x.arc(ring[1], ring[2], 6 + 34 * ease(f), 0, TAU); x.stroke(); } }
    if (!c) return;
    var p = cl((hk - c[4] * 1000) / 1600), yv = function (v) { return c[1] + c[3] * (1 - (v - .5) / .5); }, i, n = 40;
    x.globalAlpha = a; x.strokeStyle = tone; x.lineWidth = E.px;
    x.beginPath(); x.moveTo(c[0], c[1]); x.lineTo(c[0], c[1] + c[3]); x.lineTo(c[0] + c[2], c[1] + c[3]); x.stroke();
    x.setLineDash([3 * E.px, 3 * E.px]); x.globalAlpha = a * .6; x.beginPath(); x.moveTo(c[0], yv(.95)); x.lineTo(c[0] + c[2], yv(.95)); x.stroke(); x.setLineDash([]);
    x.globalAlpha = a; x.strokeStyle = sc.palette[sc.palette.length - 1]; x.lineWidth = 2 * E.px; x.beginPath();
    for (i = 0; i <= n * p; i++) { var t = i / n, v = .5 + .45 * (1 - Math.exp(-5 * t)) / (1 - Math.exp(-5)); x[i ? "lineTo" : "moveTo"](c[0] + t * c[2], yv(v)); }
    x.stroke();
    label(x, E, "R²", c[0] - 8 / E.A, c[1], tone, "right");
    if (p >= 1) label(x, E, "0.95", c[0] + c[2], yv(.95) - 11 / E.A, tone, "right");
  };
  D.flow = function (x, g, hk, a, E, sc, tone) {
    function seg(e, i, lim) {
      var k = cl((hk - g.et[i]) / (g.ed || 520)); if (lim) k = ease(k); if (k <= 0) return;
      var p = g.nodes[e[0]], q = g.nodes[e[1]], dx = q[0] - p[0], dy = q[1] - p[1], L = Math.hypot(dx, dy), r0 = (g.rr || 22) / L, f = Math.min(lim ? k : back(k), 1.12) * (1 - 2 * r0) + r0;
      x.moveTo(p[0] + dx * r0, p[1] + dy * r0); x.lineTo(p[0] + dx * f, p[1] + dy * f);
    }
    x.lineWidth = 1.2 * E.px; x.strokeStyle = INK; x.globalAlpha = a * (g.ea || .7); x.beginPath();
    g.edges.forEach(function (e, i) { seg(e, i); }); x.stroke();
    if (g.hl) { x.lineWidth = 2.4 * E.px; x.strokeStyle = sc.palette[sc.palette.length - 1]; x.globalAlpha = a * .9; x.beginPath();
      g.hl.forEach(function (l) { var k = ease(cl((hk - l[4] * 1000) / (l[5] * 1000))); if (k <= 0) return; x.moveTo(l[0], l[1]); x.lineTo(l[0] + (l[2] - l[0]) * k, l[1] + (l[3] - l[1]) * k); }); x.stroke(); }
    if (g.hot) { x.lineWidth = 2.4 * E.px; x.strokeStyle = sc.palette[sc.palette.length - 1]; x.globalAlpha = a * .9; x.beginPath(); g.hot.forEach(function (i) { if (i >= 0) seg(g.edges[i], i, 1); }); x.stroke(); }
    var ct = g.counter; if (!ct) return;
    var v = ct.from; ct.at.forEach(function (t) { if (hk >= t * 1000) v--; });
    x.globalAlpha = a; label(x, E, "CREDITS " + v, ct.xy[0], ct.xy[1], tone, "center");
  };
  D.mesh = function (x, g, hk, a, E, sc, tone) {
    var N = g.nodes, P = g.pulse, lit = [], echo = [];
    x.lineWidth = E.px; x.strokeStyle = tone; x.globalAlpha = a * .26; x.beginPath();
    g.edges.forEach(function (e) {
      var p = N[e[0]], q = N[e[1]]; x.moveTo(p[0], p[1]); x.lineTo(q[0], q[1]);
      var d = Math.min(g.dist[e[0]], g.dist[e[1]]), f = (hk - P[0] - d * P[1]) / P[2]; if (f > 0 && f < 1) lit.push(e);
      if (p[0] > g.te - 70 && p[0] < g.te + 160) { var f2 = (hk - P[0] - d * P[1] - 380) / (P[2] * 1.4); if (f2 > 0 && f2 < 1) echo.push(e); }
    });
    x.stroke();
    var fd = g.field, B = [[], [], [], [], [], [], []];
    g.edges.forEach(function (e) { var p = N[e[0]], q = N[e[1]], m = (p[0] + q[0]) / 2; if (hk < fd[0] + (m - fd[2]) / (fd[3] - fd[2]) * fd[1]) return; B[Math.round((p[3] + q[3]) / 2 * 6)].push(e); });
    x.lineWidth = 1.3 * E.px;
    B.forEach(function (L, bi) { if (!L.length) return; x.globalAlpha = a * .75; x.strokeStyle = E.ramp(sc.palette, bi / 6); x.beginPath(); L.forEach(function (e) { var p = N[e[0]], q = N[e[1]]; x.moveTo(p[0], p[1]); x.lineTo(q[0], q[1]); }); x.stroke(); });
    var hot = sc.palette[sc.palette.length - 1];
    [[lit, .95, 1.8], [echo, .5, 1.4]].forEach(function (L) {
      if (!L[0].length) return; x.globalAlpha = a * L[1]; x.strokeStyle = hot; x.lineWidth = L[2] * E.px; x.beginPath();
      L[0].forEach(function (e) { var p = N[e[0]], q = N[e[1]]; x.moveTo(p[0], p[1]); x.lineTo(q[0], q[1]); }); x.stroke();
    });
  };

  function pick(sl, n, R) {
    var out = sl.filter(function (p) { return p.p; }).slice(0, n), rest = shuffle(sl.filter(function (p) { return !p.p; }), R);
    out = out.concat(rest.slice(0, n - out.length));
    while (out.length < n) { var b = sl[(R() * sl.length) | 0] || { x: 800, y: 450 }; out.push({ x: b.x, y: b.y, c: b.c, a: 0, g: b.g, d: R(), sm: b.sm }); }
    return shuffle(out, R);
  }

  function Engine(cv, scenes, opt) {
    opt = opt || {};
    this.cv = cv; this.x = cv.getContext("2d"); this.sc = scenes; this.n = opt.count || 1400;
    this.dpr = 1; this.s = 1; this.ox = 0; this.oy = 0; this.W = SW; this.H = SH; this.px = 1; this.fs = 11; this.bg = opt.bg || null;
    this.cur = opt.start || 0; this.prev = -1; this.phase = "hold"; this.pt = 0; this.paused = false; this.auto = true; this.trail = [];
    this.onchange = opt.onchange || null; this.onframe = opt.onframe || null;
    this.forms = scenes.map(function (sc, i) { return (F[sc.formation.preset] || F.scatter)(sc.formation.options || {}, sc, rng(101 + i * 977)); });
    this.build();
  }
  var P = Engine.prototype;
  P.ramp = ramp;
  P.key = function (si, c, g, j, sm) {
    var sc = this.sc[si], gl = sc.glyphs && sc.glyphs.length ? sc.glyphs : BASE; c = c == null ? 0 : c;
    return (sm ? "s" : "n") + (g || gl[j % gl.length]) + "|" + (c < 0 ? 0 : 1 + si * STEPS + Math.round(cl(c) * (STEPS - 1)));
  };
  P.build = function () {
    var E = this;
    E.T = E.forms.map(function (f, i) { return pick(f.slots, E.n, rng(7 + i)); });
    E.p = []; for (var j = 0; j < E.n; j++) E.p.push({ x: 0, y: 0, a: 0, k: "", sq: 0, fl: 1 });
    E.sprites(); E.assign(E.cur); E.hold(E.pt);
  };
  P.setCount = function (n) { if (n !== this.n) { this.n = n; this.build(); } };
  P.assign = function (i) {
    var E = this, T = E.T[i];
    E.p.forEach(function (p, j) {
      var t = T[j]; p.s = t;
      p.k1 = E.key(i, t.c, t.g, j, t.sm); p.k2 = t.c2 != null ? E.key(i, t.c2, t.g, j, t.sm) : null; p.k3 = t.c3 != null ? E.key(i, t.c3, t.g, j, t.sm) : null;
    });
  };
  P.evalSlot = function (p, hk, o) {
    var t = p.s, x = t.x, y = t.y, A = t.a == null ? 1 : t.a, sq = 0;
    if (t.ta != null && t.sx != null) {
      var k = cl((hk - t.ta) / (t.tb - t.ta)), e = t.fall ? k * k : t.ob ? back(k) : t.lin ? 1 - Math.pow(1 - k, 1.7) : ease(k);
      if (t.lane) { var u = t.u0 + (t.u1 - t.u0) * e, q = bez(t.lane, Math.max(0, u)); x = q[0]; y = q[1]; if (u < 0) A = 0; else if (u < .05) A *= u / .05; }
      else if (t.pts) { var q2 = chain(t.pts, e); x = q2[0]; y = q2[1]; }
      else if (t.cx != null) { var v = 1 - e; x = v * v * t.sx + 2 * v * e * t.cx + e * e * t.x; y = v * v * t.sy + 2 * v * e * t.cy + e * e * t.y; }
      else { x = t.sx + (t.x - t.sx) * e; y = t.sy + (t.y - t.sy) * e; }
      if (t.a0 != null) A = t.a0 + (A - t.a0) * cl(k * 1.6);
      if (t.sq && hk > t.tb) sq = Math.max(0, 1 - (hk - t.tb) / 200);
    }
    if (t.a2 != null && hk > t.ta2) A += (t.a2 - A) * cl((hk - t.ta2) / 400);
    if (t.pulse && hk < t.t3 + 600) { var w = .7 + .3 * Math.sin(hk / 280 + (t.x + t.y) * .05); A *= hk < t.t3 ? w : w + (1 - w) * (hk - t.t3) / 600; }
    o.x = x; o.y = y; o.a = A; o.sq = sq;
    o.k = p.k3 && hk >= t.t3 ? p.k3 : p.k2 && hk >= t.t2 ? p.k2 : p.k1;
  };
  P.hold = function (hk) { var E = this; E.p.forEach(function (p) { E.evalSlot(p, hk, p); p.fl = 1; }); };
  P.sprites = function () {
    var E = this, set = {}, cols = [INK];
    BASE.forEach(function (g) { set[g] = 1; });
    E.sc.forEach(function (sc) { (sc.glyphs || []).forEach(function (g) { set[g] = 1; }); for (var k = 0; k < STEPS; k++) cols.push(ramp(sc.palette, k / (STEPS - 1))); });
    var G = Object.keys(set), m = mk(1, 1).getContext("2d"), sizes = [["n", E.fs], ["s", Math.max(5, E.fs * .62)]], rows = [], wmax = 0;
    sizes.forEach(function (sz) { var fs = Math.round(sz[1] * E.dpr); m.font = "400 " + fs + "px " + MONO; var ws = G.map(function (g) { return Math.ceil(m.measureText(g).width) + 4; }); wmax = Math.max(wmax, ws.reduce(function (a, b) { return a + b; }, 0)); rows.push({ p: sz[0], fs: fs, ws: ws, h: Math.ceil(fs * 1.5) }); });
    var H = 0; rows.forEach(function (r) { H += r.h * cols.length; });
    var sh = mk(wmax, H), x = sh.getContext("2d"), oy = 0; x.textBaseline = "middle"; E.sheet = sh; E.spr = {};
    rows.forEach(function (r) {
      x.font = "400 " + r.fs + "px " + MONO;
      cols.forEach(function (c, ci) { var ox = 0; x.fillStyle = c; G.forEach(function (g, gi) { x.fillText(g, ox + 2, oy + r.h / 2); E.spr[r.p + g + "|" + ci] = [ox, oy, r.ws[gi], r.h]; ox += r.ws[gi]; }); oy += r.h; });
    });
    var R0 = Math.round(28 * E.dpr), sp = mk(R0 * 2, R0 * 2), sx = sp.getContext("2d"), gr = sx.createRadialGradient(R0, R0, 0, R0, R0, R0);
    gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(.1, "rgba(255,255,255,.95)"); gr.addColorStop(.2, "rgba(247,213,181,.8)"); gr.addColorStop(.45, "rgba(239,106,42,.35)"); gr.addColorStop(1, "rgba(239,106,42,0)");
    sx.fillStyle = gr; sx.fillRect(0, 0, R0 * 2, R0 * 2); E.spark = sp;
  };
  P.resize = function (w, h, dpr) {
    var E = this, d = dpr || Math.min(2, W.devicePixelRatio || 1);
    E.W = w; E.H = h; E.dpr = d; E.cv.width = Math.round(w * d); E.cv.height = Math.round(h * d);
    E.s = Math.max(w / SW, h / SH); E.px = 1 / E.s; E.ox = (w - SW * E.s) / 2; E.oy = (h - SH * E.s) / 2;
    var fs = Math.round(Math.max(8, Math.min(12, 11 * E.s)) * 2) / 2;
    if (fs !== E.fs || E.sd !== d) { E.fs = fs; E.sd = d; E.sprites(); }
    E.draw();
  };
  P.cam = function (i, t) { var c = this.sc[i].timeline.camera, sc = this.sc[i];
    if (c.keys) return [1, 2, 3].map(function (n) { return keyAt(c.keys.map(function (q) { return [q[0], q[n]]; }), t / 1000); });
    var k = cl(t / ((sc.hold + sc.join) * 1000)), m = this.depth == null ? 1 : this.depth, v = [0, 1, 2].map(function (j) { return c.from[j] + (c.to[j] - c.from[j]) * k; });
    return [v[0] * m, v[1] * m, 1 + (v[2] - 1) * m]; };
  P.joinK = function () { return this.phase === "in" ? cl(this.pt / (this.sc[this.prev].join * 1000)) : 1; };
  P.go = function (i) {
    var E = this; if (i === E.cur && E.phase === "hold") return;
    var from = E.cur, J = JOINS[E.sc[from].joinOut] || JOINS[E.sc[i].joinIn] || {}, R = rng(99 + i), foc = E.sc[from].focal || [SW / 2, SH / 2], tmp = {};
    E.ptFrom = E.phase === "hold" ? E.pt : (E.sc[from].hold * 1000);
    E.prev = from; E.cur = i; E.phase = "in"; E.pt = 0; E.J = J; E.assign(i);
    E.p.forEach(function (p) {
      E.evalSlot(p, 0, tmp);
      p.fx = p.x; p.fy = p.y; p.fa = p.a; p.fk = p.k; p.tx = tmp.x; p.ty = tmp.y; p.ta = tmp.a; p.nk = tmp.k; p.d = p.s.d == null ? R() : p.s.d;
      p.mk = J.mid ? p.nk.charAt(0) + J.mid + p.nk.slice(p.nk.indexOf("|")) : null;
      if (J.via) { p.cx = foc[0] + (R() - .5) * 40; p.cy = foc[1] + (R() - .5) * 40; }
      else { var dx = p.tx - p.fx, dy = p.ty - p.fy, L = Math.hypot(dx, dy) || 1, jt = (R() - .5) * (J.swirl || .4) * L; p.cx = (p.fx + p.tx) / 2 - dy / L * jt; p.cy = (p.fy + p.ty) / 2 + dx / L * jt - (J.lift || 0); }
    });
    E.sa = E.sparkAt(from, E.ptFrom); E.sb = E.sparkAt(i, 0);
    if (E.onchange) E.onchange(i, from);
  };
  P.sparkAt = function (i, ms) { return along(this.sc[i].timeline.spark || [], ms / 1000); };
  P.step = function (dt) {
    var E = this, sc = E.sc[E.cur];
    if (E.phase === "in") {
      var T = E.sc[E.prev].join * 1000, J = E.J; E.pt += dt;
      E.p.forEach(function (p) {
        var k = cl((E.pt - p.d * .35 * T) / (.65 * T)), e = ease(k), u = 1 - e;
        p.x = u * u * p.fx + 2 * u * e * p.cx + e * e * p.tx; p.y = u * u * p.fy + 2 * u * e * p.cy + e * e * p.ty; p.a = p.fa + (p.ta - p.fa) * e;
        p.k = p.mk && k > .18 && k < .8 ? p.mk : k < .5 ? p.fk : p.nk; p.sq = 0; p.fl = J.flip ? Math.max(.08, Math.abs(Math.cos(Math.PI * k))) : 1;
      });
      if (E.pt >= T) { E.phase = "hold"; E.pt = 0; E.hold(0); }
    } else {
      if (!E.paused) E.pt += dt;
      E.hold(E.pt);
      if (E.auto && !E.paused && E.pt >= sc.hold * 1000) E.go((E.cur + 1) % E.sc.length);
    }
  };
  P.map = function () {
    var E = this, inn = E.phase === "in", c;
    if (inn) { var a = E.cam(E.prev, E.ptFrom + E.pt), b = E.cam(E.cur, 0), k = ease(E.joinK()); c = [0, 1, 2].map(function (j) { return a[j] + (b[j] - a[j]) * k; }); }
    else c = E.cam(E.cur, E.pt);
    var z = 1 + (c[2] - 1) * SUBJ, cx = E.W / 2, cy = E.H / 2;
    E.A = z * E.s; E.px = 1 / E.A; E.Bx = cx + z * (E.ox - cx) - c[0] * SUBJ * E.s; E.By = cy + z * (E.oy - cy) - c[1] * SUBJ * E.s;
    var sc = E.sc[E.cur], hold = sc.hold * 1000; E.an = !inn && E.auto ? .025 * ease(cl((E.pt - (hold - 450)) / 450)) : 0; E.foc = sc.focal || [SW / 2, SH / 2];
  };
  P.layer = function (i, a, hk) {
    if (a <= .01) return;
    var E = this, sc = E.sc[i], dr = D[sc.formation.preset], d = E.dpr;
    if (dr && E.forms[i].geo) { E.x.setTransform(E.A * d, 0, 0, E.A * d, E.Bx * d, E.By * d); dr(E.x, E.forms[i].geo, hk, a, E, sc, sc.textTone === "paper" ? PAPER : INK); }
  };
  P.draw = function () {
    var E = this, x = E.x, d = E.dpr, inn = E.phase === "in", k = ease(E.joinK());
    E.map();
    x.setTransform(1, 0, 0, 1, 0, 0); x.globalAlpha = 1;
    if (E.bg) { x.fillStyle = E.bg; x.fillRect(0, 0, E.cv.width, E.cv.height); } else x.clearRect(0, 0, E.cv.width, E.cv.height);
    if (inn) E.layer(E.prev, 1 - k, 1e9);
    E.layer(E.cur, inn ? k : 1, inn ? 0 : E.pt);
    x.setTransform(1, 0, 0, 1, 0, 0);
    var sh = E.sheet, sp = E.spr, ga = -1, ps = E.p, n = ps.length, A = E.A, Bx = E.Bx, By = E.By, an = E.an, fx = E.foc[0], fy = E.foc[1];
    for (var j = 0; j < n; j++) {
      var p = ps[j], r = sp[p.k]; if (p.a <= .02 || !r) continue;
      if (p.a !== ga) x.globalAlpha = ga = p.a;
      var X = p.x, Y = p.y; if (an) { X = fx + (X - fx) * (1 - an); Y = fy + (Y - fy) * (1 - an); }
      X = (Bx + A * X) * d; Y = (By + A * Y) * d;
      if (p.sq || p.fl !== 1) { var w = r[2] * (1 + .6 * p.sq) * p.fl, h = r[3] * (1 - .45 * p.sq); x.drawImage(sh, r[0], r[1], r[2], r[3], X - w / 2, Y - h / 2 + (r[3] - h) / 2, w, h); }
      else x.drawImage(sh, r[0], r[1], r[2], r[3], (X - r[2] / 2) | 0, (Y - r[3] / 2) | 0, r[2], r[3]);
    }
    var ex = E.phase === "hold" && E.sc[E.cur].timeline.sparks;
    if (ex) ex.forEach(function (K) { var t = E.pt / 1000; if (t < K[0][0] || t > K[K.length - 1][0] + .25) return; var q = along(K, t), S = E.spark, sz = S.width * .75; x.globalAlpha = t > K[K.length - 1][0] ? 1 - (t - K[K.length - 1][0]) / .25 : 1; x.drawImage(S, (Bx + A * q[0]) * d - sz / 2, (By + A * q[1]) * d - sz / 2, sz, sz); });
    var s = E.sparkPos(); if (s) {
      var sx = (Bx + A * s[0]) * d, sy = (By + A * s[1]) * d, S = E.spark, tr = E.trail;
      tr.unshift([sx, sy]); if (tr.length > 4) tr.length = 4;
      for (var t = tr.length - 1; t >= 0; t--) { var sz = S.width * (t ? .55 - t * .1 : 1); x.globalAlpha = t ? .35 - t * .08 : 1; x.drawImage(S, tr[t][0] - sz / 2, tr[t][1] - sz / 2, sz, sz); }
    }
    x.globalAlpha = 1;
    if (E.onframe) E.onframe(E);
  };
  P.sparkPos = function () {
    var E = this;
    if (E.phase !== "in") return E.sparkAt(E.cur, E.pt);
    var k = E.joinK(), e = k < .5 ? 2 * k * k : 1 - 2 * (1 - k) * (1 - k), a = E.sa, b = E.sb, cx = (a[0] + b[0]) / 2, cy = Math.min(a[1], b[1]) - 140, u = 1 - e;
    return [u * u * a[0] + 2 * u * e * cx + e * e * b[0], u * u * a[1] + 2 * u * e * cy + e * e * b[1]];
  };
  P.start = function () {
    var E = this; if (E.raf) return; E.last = 0;
    var f = function (t) { var dt = E.last ? Math.min(50, t - E.last) : 16; E.last = t; E.step(dt * (E.speed || 1)); E.draw(); E.raf = requestAnimationFrame(f); };
    E.raf = requestAnimationFrame(f);
  };
  P.stop = function () { cancelAnimationFrame(this.raf); this.raf = 0; };
  P.still = function (i, ms) { var E = this; E.prev = -1; E.cur = i; E.phase = "hold"; E.pt = ms == null ? E.sc[i].hold * 1000 : ms; E.trail = []; E.assign(i); E.hold(E.pt); E.draw(); };

  W.HeroEngine = { Engine: Engine, formations: F, decorations: D, joins: JOINS, keyAt: keyAt };

  /* Page wiring: painted layers, tracks, tone. */
  var root = document.querySelector("[data-hero]"), SC = W.HERO_SCENES;
  if (!root || !SC || !SC.length || !W.requestAnimationFrame || !W.Path2D) return;
  var cv = root.querySelector(".hx-canvas"), mqM = W.matchMedia("(max-width: 719px)"), reduce = W.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var scenesEl = [].slice.call(root.querySelectorAll(".hx-scene")), groups = SC.map(function () { return []; });
  scenesEl.forEach(function (el) {
    var i = +el.getAttribute("data-scene");
    [].slice.call(el.querySelectorAll("svg.hx-layer")).forEach(function (svg) {
      var u = svg.querySelector("use"), id = u && (u.getAttribute("href") || u.getAttribute("xlink:href")), sym = id && document.querySelector(id);
      if (sym) { var g = document.createElementNS("http://www.w3.org/2000/svg", "g"); [].slice.call(sym.childNodes).forEach(function (n) { g.appendChild(n.cloneNode(true)); }); svg.replaceChild(g, u); }
      groups[i].push({ el: svg, f: +svg.getAttribute("data-depth") || 0 });
    });
  });
  var tracks = SC.map(function (sc, i) {
    return (sc.timeline.tracks || []).map(function (tr) {
      var els = []; scenesEl.forEach(function (el) { if (+el.getAttribute("data-scene") === i) els = els.concat([].slice.call(el.querySelectorAll('[data-k="' + tr.k + '"]'))); });
      return { els: els, p: tr.p, keys: tr.keys };
    });
  });
  if (mqM.matches) [].slice.call(document.querySelectorAll(".hx-sprite feGaussianBlur")).forEach(function (b) { b.setAttribute("stdDeviation", (+b.getAttribute("stdDeviation") * .5).toFixed(1)); });

  function applyTracks(i, t) {
    tracks[i].forEach(function (tr) {
      var v = keyAt(tr.keys, t);
      tr.els.forEach(function (el) {
        if (tr.p === "o") el.style.opacity = v;
        else if (tr.p === "tx") el.style.transform = "translate(" + v + "px,0)";
        else if (tr.p === "ty") el.style.transform = "translate(0," + v + "px)";
        else if (tr.p === "dash") el.style.strokeDashoffset = v;
      });
    });
  }
  function tone(i) {
    var sc = SC[i]; root.setAttribute("data-tone", sc.textTone); document.body.setAttribute("data-hx-tone", sc.textTone);
    root.style.setProperty("--scrim", sc.scrim.color); root.style.setProperty("--scrim-o", sc.scrim.opacity);
    var z = sc.safeZone; if (z) z.forEach(function (b, n) { root.style.setProperty("--l" + (n + 1) + "-top", (b[1] * 100).toFixed(1) + "%"); });
  }
  var shown = [];
  function frame(E) {
    var inn = E.phase === "in", k = ease(cl((E.joinK() - .25) / .5));
    scenesEl.forEach(function (el) {
      var i = +el.getAttribute("data-scene"), o = i === E.cur ? (inn ? k : 1) : inn && i === E.prev ? 1 - k : 0;
      if (shown[i + (el.classList.contains("hx-fg") ? "f" : "")] !== o) { el.style.opacity = o; el.style.visibility = o > 0 ? "visible" : "hidden"; shown[i + (el.classList.contains("hx-fg") ? "f" : "")] = o; }
    });
    [[E.cur, inn ? 0 : E.pt], [inn ? E.prev : -1, E.ptFrom + E.pt]].forEach(function (q) {
      var i = q[0]; if (i < 0) return;
      var c = E.cam(i, q[1]);
      groups[i].forEach(function (L) { var z = 1 + (c[2] - 1) * L.f; L.el.style.transform = "translate3d(" + (-c[0] * L.f * E.s).toFixed(2) + "px," + (-c[1] * L.f * E.s).toFixed(2) + "px,0) scale(" + z.toFixed(4) + ")"; });
      applyTracks(i, i === E.cur && !inn ? E.pt / 1000 : i === E.cur ? 0 : 1e3);
    });
  }
  var E = new Engine(cv, SC, { count: mqM.matches ? 450 : 1400, onframe: frame, onchange: function (i) { tone(i); } });
  E.auto = !reduce; W.HeroEngine.hero = E;
  root.classList.add("hx--live");

  function layout() { var r = root.getBoundingClientRect(); E.resize(r.width, r.height); }
  var vis = !document.hidden, onscreen = true;
  function run() { if (!reduce && vis && onscreen) E.start(); else E.stop(); }
  document.addEventListener("visibilitychange", function () { vis = !document.hidden; run(); });
  if ("IntersectionObserver" in W) new IntersectionObserver(function (en) { onscreen = en[0].isIntersecting; run(); }).observe(root);
  var rq = 0; function relayout() { if (!rq) rq = requestAnimationFrame(function () { rq = 0; layout(); }); }
  if ("ResizeObserver" in W) new ResizeObserver(relayout).observe(root); else W.addEventListener("resize", relayout);
  if (mqM.addEventListener) mqM.addEventListener("change", function () { E.setCount(mqM.matches ? 450 : 1400); relayout(); });

  var hdr = document.querySelector(".home .site-header");
  if (hdr) { var solid = function () { hdr.classList.toggle("is-solid", W.scrollY > root.offsetHeight - 72); }; W.addEventListener("scroll", solid, { passive: true }); solid(); }

  function init() { E.sprites(); tone(0); layout(); if (reduce) E.still(0); else E.still(0, 0); run(); }
  if (document.fonts && document.fonts.load) document.fonts.load('400 12px "JetBrains Mono"').then(init, init); else init();
})(window);
