/* Dr. Aleena Baby, site script: email assembly, mobile nav, and (only when motion is allowed) scroll reveal, number count-up and a scroll progress bar. */
(function () {
  var doc = document.documentElement;
  doc.classList.add("js");

  // Email: assembled from parts so the address never appears in HTML text.
  // [VERIFY] Replace the two parts below with Aleena's real address before publishing.
  var user = "EMAIL-USER";
  var host = ["EMAIL-DOMAIN", "com"].join(".");
  var links = document.querySelectorAll("a.js-email");
  for (var i = 0; i < links.length; i++) {
    var subject = links[i].getAttribute("data-subject");
    links[i].href = "mailto:" + user + "@" + host + (subject ? "?subject=" + encodeURIComponent(subject) : "");
  }

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
