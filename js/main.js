/* Dr. Aleena Baby, site script: email assembly, mobile nav, and (only when motion is allowed) scroll reveal, number count-up and a scroll progress bar. */
(function () {
  var doc = document.documentElement;
  doc.classList.add("js");

  // Email: never written into the page. The address is stored shifted as numbers and
  // assembled only inside a genuine click or key press (event.isTrusted), so crawlers that
  // read the HTML, or run the page without a real user, never see it.
  var K = [103, 117, 49, 100, 111, 104, 104, 113, 100, 49, 101, 100, 101, 124, 67, 106, 112, 100, 108, 111, 49, 102, 114, 112];
  function addr() { var s = ""; for (var j = 0; j < K.length; j++) s += String.fromCharCode(K[j] - 3); return s; }
  document.addEventListener("click", function (e) {
    var a = e.target.closest ? e.target.closest("a.js-email") : null;
    if (!a) return;
    e.preventDefault();
    if (!e.isTrusted) return;
    var subject = a.getAttribute("data-subject");
    window.location.href = "mail" + "to:" + addr() + (subject ? "?subject=" + encodeURIComponent(subject) : "");
  });

  // Mobile nav toggle
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) { nav.classList.remove("is-open"); toggle.setAttribute("aria-expanded", "false"); toggle.focus(); }
    });
  }

  // Scroll reveal, skipped entirely under prefers-reduced-motion
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !("IntersectionObserver" in window)) return;
  doc.classList.add("reveal-on");
  function countUp(el) {
    var to = parseFloat(el.getAttribute("data-to")), dec = parseInt(el.getAttribute("data-dec") || "0", 10), t0 = null, dur = 1100;
    function step(t) { if (!t0) t0 = t; var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3); el.textContent = (to * e).toFixed(dec); if (k < 1) requestAnimationFrame(step); }
    requestAnimationFrame(step);
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      en.target.classList.add("is-visible");
      en.target.querySelectorAll(".count").forEach(countUp);
      io.unobserve(en.target);
    });
  }, { rootMargin: "0px 0px -8% 0px" });
  document.querySelectorAll(".reveal, .stagger").forEach(function (el) { io.observe(el); });

  var bar = document.createElement("div");
  bar.className = "progress"; bar.setAttribute("aria-hidden", "true");
  document.body.appendChild(bar);
  var ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () { var h = doc.scrollHeight - innerHeight; bar.style.transform = "scaleX(" + (h > 0 ? scrollY / h : 0) + ")"; ticking = false; });
  }
  addEventListener("scroll", onScroll, { passive: true }); onScroll();
})();

/* Blog carousel rows: previous and next buttons scroll by one card; buttons disable at either end. */
(function () {
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll("[data-carousel]").forEach(function (track) {
    var row = track.closest(".bc-row");
    if (!row) return;
    var btns = row.querySelectorAll(".bc-btn");
    function step() { var c = track.querySelector(".bc-item"); return c ? c.getBoundingClientRect().width + 16 : 300; }
    function update() {
      var max = track.scrollWidth - track.clientWidth - 2;
      btns.forEach(function (b) {
        var d = +b.getAttribute("data-dir");
        b.disabled = max <= 0 || (d < 0 ? track.scrollLeft <= 2 : track.scrollLeft >= max);
      });
    }
    btns.forEach(function (b) {
      b.addEventListener("click", function () {
        track.scrollBy({ left: +b.getAttribute("data-dir") * step(), behavior: reduce ? "auto" : "smooth" });
      });
    });
    track.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  });
})();
