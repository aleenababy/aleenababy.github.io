"""Builds the inner pages of aleenababy.github.io and syncs the shared header and footer.

Run from the repo root:  python3 tools/build_pages.py
Re-running is safe: it rewrites about.html, work.html, cv.html, blog/*.html,
feed.xml and sitemap.xml, and patches the header, footer and home-page links
inside index.html. Edit page content in the CONTENT sections below.
"""
import html
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = "https://aleenababy.github.io/"
ARROW = '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 12h14M13 6l6 6-6 6"></path></svg>'
EXT = '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7 17L17 7M9 7h8v8"></path></svg>'

NAV = [("About", "about.html"), ("Work", "work.html"), ("Blog", "blog/index.html"), ("CV", "cv.html")]


def header(prefix, current):
    items = []
    for label, href in NAV:
        cur = ' aria-current="page"' if href == current else ""
        items.append(f'<li><a href="{prefix}{href}"{cur}>{label}</a></li>')
    return f'''<header class="site-header">
  <div class="wrap">
    <a class="brand" href="{prefix}index.html"><strong>Dr. Aleena Baby</strong><span>Machine learning engineer</span></a>
    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav">Menu</button>
    <nav class="nav" id="site-nav" aria-label="Main">
      <ul>
        {"".join(items)}
        <li><a class="nav-ext" href="https://academiatoindustry.com" rel="noopener">Academia to Industry<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7 17L17 7M9 7h8v8"></path></svg></a></li>
      </ul>
    </nav>
  </div>
</header>'''


ICONS = {
    "github": '<path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21"></path>',
    "linkedin": '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"></path><path d="M2 9h4v12H2z"></path><circle cx="4" cy="4" r="2"></circle>',
    "scholar": '<path d="M22 10 12 5 2 10l10 5 10-5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path>',
    "substack": '<path d="M4 4h16M4 8h16"></path><path d="M4 12h16v9l-8-4.5L4 21z"></path>',
    "email": '<rect x="2" y="4" width="20" height="16" rx="2"></rect><path d="m22 7-10 6L2 7"></path>',
    "cv": '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><path d="M14 2v6h6M8 13h8M8 17h8M8 9h2"></path>',
}


def icon_link(href, key, label, cls=""):
    c = f' class="{cls}"' if cls else ""
    return (f'<li><a{c} href="{href}" aria-label="{label}" title="{label}">'
            f'<svg class="ficon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">{ICONS[key]}</svg></a></li>')


def footer(prefix):
    links = "".join([
        icon_link("https://github.com/aleenababy", "github", "GitHub"),
        icon_link("https://linkedin.com/in/aleena-baby", "linkedin", "LinkedIn"),
        icon_link("https://scholar.google.com/citations?user=MxLHgh4AAAAJ", "scholar", "Google Scholar"),
        icon_link("https://academiatoindustry.substack.com", "substack", "Substack"),
        icon_link("#", "email", "Email", "js-email"),
        icon_link(f"{prefix}cv.html", "cv", "CV"),
    ])
    return f'''<footer class="site-footer">
  <div class="wrap">
    <p class="sig">Physics PhD turned machine learning engineer.<br>Building industrial AI in Germany.</p>
    <ul class="social">{links}</ul>
    <small>© 2026 Aleena Baby</small>
  </div>
</footer>'''


def page(path, title, desc, body, current, extra_head=""):
    prefix = "../" if "/" in path else ""
    url = SITE + ("" if path == "index.html" else path)
    doc = f'''<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{html.escape(title)}</title>
<meta name="description" content="{html.escape(desc)}">
<link rel="canonical" href="{url}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Dr. Aleena Baby">
<meta property="og:title" content="{html.escape(title)}">
<meta property="og:description" content="{html.escape(desc)}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{SITE}assets/og-image.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#ffffff">
<link rel="icon" href="{prefix}assets/favicon.svg" type="image/svg+xml">
<link rel="alternate" type="application/rss+xml" title="Dr. Aleena Baby, Blog" href="{prefix}feed.xml">
<link rel="stylesheet" href="{prefix}css/style.css">
{extra_head}
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
{header(prefix, current)}
<main id="main">
{body}
</main>
{footer(prefix)}
<script src="{prefix}js/main.js" defer></script>
</body></html>
'''
    full = os.path.join(ROOT, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, "w", encoding="utf-8") as f:
        f.write(doc)
    print("wrote", path)


def img(prefix, name, alt):
    return (f'<figure class="img-slot img-slot--filled img-slot--wide"><img src="{prefix}assets/img/scenes/{name}.webp" '
            f'width="960" height="720" loading="lazy" decoding="async" alt="{html.escape(alt)}"></figure>')


# ============================================================ CONTENT: WORK
def build_work():
    p = ""
    body = f'''<section class="section section--tight">
  <div class="wrap">
    <div class="case-head">
      <p class="status-line">Work · 2019 to 2026</p>
      <h1>Work</h1>
      <p class="lead">Production ML for industrial systems, a live LLM product, and the research underneath both.</p>
    </div>
    <ul class="jump">
      <li><a href="#porosai">PorosAI</a></li>
      <li><a href="#assistant">PorosAI assistant</a></li>
      <li><a href="#decodex">Decodex</a></li>
      <li><a href="#papergraph">PaperGraph</a></li>
      <li><a href="#earlier">Earlier projects</a></li>
    </ul>
  </div>
</section>

<section class="section section--alt" id="porosai" aria-labelledby="porosai-title">
  <div class="wrap">
    <div class="case-head">
      <p class="status-line">Project 01 · PorosAI</p>
      <span class="eyebrow">Flagship · ACCESS e.V., Aachen · 2025 to present</span>
      <h2 id="porosai-title">PorosAI: porosity prediction for investment casting</h2>
      <p class="lead">I am the lead developer of PorosAI at ACCESS e.V. on the RWTH Aachen campus. It predicts porosity defects in aerospace investment casting at the design stage, so a foundry knows a part will fail before anyone pours metal. It went from idea to proof of concept to first external customer in 18 months.</p>
    </div>
    {img(p, "foundry", "Illustration: a turbine blade in hatched line work with a porosity heat map running from cool blue to hot orange across its surface.")}
    <div class="tiles metrics">
      <div class="tile"><span class="num">&lt; 1 s</span><p>inference, in place of solver runs of 45 minutes to 24 hours</p></div>
      <div class="tile"><span class="num">~ 80 %</span><p>less design-iteration time</p></div>
      <div class="tile"><span class="num">2.75 M+</span><p>point multiphysics dataset</p></div>
      <div class="tile"><span class="num">5 to 6</span><p>manual simulation cycles saved per design</p></div>
      <div class="tile"><span class="num">18 months</span><p>from idea to first external customer, as solo developer</p></div>
      <div class="tile"><span class="num">95 %</span><p>accuracy on 3D point-cloud segmentation</p></div>
    </div>
    <div class="blocks">
      <div class="block"><h3>Forward prediction</h3><p>Physics-informed surrogate models in Python, PyTorch and XGBoost, benchmarked against alternatives including PINNs. They are evaluated on geometries the models never saw in training, and they answer in under a second.</p></div>
      <div class="block"><h3>Inverse design</h3><p>The optimizer runs the problem backwards: target quality in, design and process parameters out. That removes 5 to 6 manual simulation cycles from every design.</p></div>
      <div class="block"><h3>Data</h3><p>Design-of-Experiments campaigns in STAR-CCM+, MAGMASOFT and ProCAST on HPC, combined with CT scans and experimental measurements, make a multiphysics dataset of more than 2.75 million points.</p></div>
      <div class="block"><h3>Validation</h3><p>Geometry-held-out evaluation, verification against experiments and CT scans, and expert review in the loop. Every prediction ships with a calibrated uncertainty.</p></div>
      <div class="block"><h3>Product layer</h3><p>A FastAPI backend and a Streamlit frontend with authentication and multi-tenant plans. MLflow and DVC track every run, and Docker and CI/CD gate every release on validation.</p></div>
      <div class="block"><h3>3D geometry</h3><p>PointNet-based segmentation reads the part geometry directly and reaches 95 percent accuracy on 3D point clouds.</p></div>
    </div>
  </div>
</section>

<section class="section" id="assistant" aria-labelledby="assistant-title">
  <div class="wrap">
    <div class="case-head">
      <p class="status-line">Project 02 · PorosAI assistant · In development</p>
      <span class="eyebrow">In development · PorosAI</span>
      <h2 id="assistant-title">PorosAI assistant</h2>
      <p class="lead">An agentic assistant grounded in casting and metallurgy literature, built into PorosAI so that engineers can ask the field's research a question from inside the product.</p>
    </div>
    {img(p, "assistant", "Illustration: pages of scientific literature turned into embeddings, feeding a casting assistant that answers a question with three sources.")}
    <div class="blocks">
      <div class="block"><h3>Grounded, not general</h3><p>Answers come from a curated casting knowledge base with a knowledge-graph backbone, not from the model's general memory, so every answer can point to where it came from.</p></div>
      <div class="block"><h3>Agentic workflows</h3><p>The next step lets the assistant act inside PorosAI: pull the relevant prediction, compare it with the literature, and explain the difference to the engineer.</p></div>
      <div class="block"><h3>Where it started</h3><p>The idea began as PaperGraph, a prototype I built to teach myself the domain. <a href="#papergraph">More on that below.</a></p></div>
    </div>
  </div>
</section>

<section class="section section--alt" id="decodex" aria-labelledby="decodex-title">
  <div class="wrap">
    <div class="case-head">
      <p class="status-line">Project 03 · Decodex · 40+ users</p>
      <span class="eyebrow">Live GenAI product · built and run solo</span>
      <h2 id="decodex-title">Decodex: AI career tools for STEM PhDs</h2>
      <p class="lead">Decodex translates academic CVs into industry language, checks job fit, builds interview stories, and maps PhD skills to industry roles, tuned for the German and European job market. I built it and I run it alone.</p>
    </div>
    <div class="tiles metrics">
      <div class="tile"><span class="num">40+</span><p>users signed up</p></div>
      <div class="tile"><span class="num">1</span><p>LLM gateway, with automatic fallback</p></div>
      <div class="tile"><span class="num">1</span><p>engineer, from design to operations</p></div>
    </div>
    {img(p, "decodex", "Illustration: an academic CV passes through an LLM gateway with a fallback model and a credits counter, and comes out as industry-ready bullets in the Decodex app.")}
    <div class="blocks">
      <div class="block"><h3>One LLM gateway</h3><p>Every tool calls the same gateway: Claude with an automatic fallback model, credits deducted before each call, and a log of every request per tool and model.</p></div>
      <div class="block"><h3>Prompts as code</h3><p>Each tool has its own versioned prompt system, so a change to one tool cannot silently change another.</p></div>
      <div class="block"><h3>The stack</h3><p>React and TypeScript on the front, Deno edge functions and Postgres with Auth on Supabase behind it, Stripe for payments, and GDPR-compliant storage.</p></div>
    </div>
    <p class="repo-line"><a class="iconlink" href="https://decodex.academiatoindustry.com">Open Decodex {EXT}</a></p>
    <p class="muted">Decodex is part of Academia to Industry, where I help PhDs move into industry.</p>
  </div>
</section>

<section class="section" id="papergraph" aria-labelledby="papergraph-title">
  <div class="wrap">
    <div class="case-head">
      <p class="status-line">Project 04 · PaperGraph · Prototype</p>
      <h2 id="papergraph-title">PaperGraph, a prototype that fed the product</h2>
      <p class="lead">PaperGraph is a working prototype: a knowledge graph with an LLM layer over casting and metallurgy literature. I built it to teach myself the domain, because I came to casting as a physicist, not a metallurgist. It never shipped as a product, and it did not need to. Its concepts became the backbone of the PorosAI assistant.</p>
    </div>
  </div>
</section>

<section class="section section--alt" id="earlier" aria-labelledby="earlier-title">
  <div class="wrap">
    <div class="section-head"><h2 id="earlier-title">Earlier projects</h2></div>
    <div class="cards">
      <article class="card">
        <span class="eyebrow">Omdena · 2023</span>
        <h3>AI early-warning weather system, Tanzania</h3>
        <p>More than 20 data sources merged into one forecasting model, with alerts delivered in production by SMS and WhatsApp.</p>
      </article>
      <article class="card">
        <span class="eyebrow">Omdena</span>
        <h3>Air quality analysis, Gurugram</h3>
        <p>A machine-learning analysis of what drives pollution episodes in one of India's most polluted cities.</p>
      </article>
      <article class="card">
        <span class="eyebrow">LLM application</span>
        <h3>Car-reviews LLM app</h3>
        <p>Sentiment, translation, question answering and summarization over car reviews with Hugging Face transformers and PyTorch.</p>
        <a class="more" href="https://github.com/aleenababy/car_review_analysis">View code {ARROW}</a>
      </article>
    </div>
  </div>
</section>'''
    page("work.html", "Work · Dr. Aleena Baby",
         "PorosAI, the PorosAI assistant, Decodex and earlier projects: production ML and LLM systems by Dr. Aleena Baby.",
         body, "work.html")


# ============================================================ CONTENT: ABOUT
def build_about():
    timeline = [
        ("2015", "BSc Physics, minor in Mathematics and Computer Science, University of Calicut, Kerala"),
        ("2017", "MSc Physics, Gandhigram Rural Institute, Tamil Nadu"),
        ("2018", "Assistant Professor of Physics, Wayanad, Kerala, including one term as head of department"),
        ("2018 to 2019", "Research Assistant, Raman Research Institute, Bengaluru: numerical models in Python"),
        ("2019 to 2024", "PhD, computational physics, University of Cologne"),
        ("2023 to 2024", "Machine Learning Engineer and lead data scientist on two Omdena projects"),
        ("2024 to 2026", "Lecturer, Artificial Intelligence and Machine Learning, Hochschule Fresenius, Cologne"),
        ("2025 to now", "Applied AI Engineer and lead developer of PorosAI, ACCESS e.V., Aachen"),
    ]
    tl = "\n".join(f'        <li><time>{d}</time><p>{html.escape(t)}</p></li>' for d, t in timeline)
    notes = [
        ("Kerala to Cologne",
         "I studied physics in Kerala and Tamil Nadu, ran a small physics department in Wayanad for a term, and spent a research year at the Raman Research Institute in Bengaluru writing numerical models in Python. In 2019 I moved to Cologne for a PhD.",
         "Build the model yourself before you trust a black box. That habit later made physics-informed ML feel natural rather than novel."),
        ("Five years of coupled equations",
         "My thesis modelled how diffusion changes the physics and chemistry of photon-dominated regions in star-forming clouds. In practice that meant a Fortran solver for more than 1,000 coupled partial differential equations that runs in under two minutes, and a validation suite against more than 100 observational datasets.",
         "Validation is the work, not the afterthought. Knowing exactly where a model can be trusted is the deliverable."),
        ("The first models with users",
         "While finishing the PhD I led modelling on two Omdena projects: a severe-weather early-warning system for Tanzania that sent SMS and WhatsApp alerts, and a waste-management optimization model built with an international team.",
         "The people who needed the forecast did not need the method. Optimize for the decision, not the metric."),
        ("Casting, and what I had to unlearn",
         "In January 2025 I joined ACCESS e.V. in Aachen and became lead developer of PorosAI. I built a knowledge graph over the literature to teach myself the field, and production taught me the rest: early metrics inflated by random splits, and the first time an engineer stopped trusting a prediction, accuracy was not the problem.",
         "In industry the model is the smaller half of the system. Evaluation protocol and trust are the larger half."),
    ]
    nt = "\n".join(f'''      <article class="note">
        <span class="num">0{i} · field note</span>
        <h3>{html.escape(h)}</h3>
        <p>{html.escape(b)}</p>
        <p class="lesson"><b>Lesson</b>{html.escape(l)}</p>
      </article>''' for i, (h, b, l) in enumerate(notes, 1))
    body = f'''<section class="hero">
  <div class="wrap hero-grid">
    <div class="prose">
      <p class="status-line">About · Aachen, Germany</p>
      <h1>About</h1>
      <p class="lead">I am a machine learning engineer with a PhD in computational physics. I build production AI for industrial systems in Aachen: physics-informed models, the pipelines behind them, and the LLM layer on top.</p>
      <p>Seven years of computational modeling, the last three in production ML. EU Blue Card with full work authorization in Germany and France. English C1, German B1.</p>
      <p class="muted">I also run Academia to Industry, because the path I took is badly mapped and I have walked it.</p>
    </div>
    <div class="portrait-wrap"><img class="portrait" src="assets/img/aleena.jpg" width="720" height="720" alt="Portrait of Dr. Aleena Baby"></div>
  </div>
</section>

<section class="section section--alt" id="journey" aria-labelledby="journey-title">
  <div class="wrap">
    <div class="section-head"><h2 id="journey-title">Journey</h2></div>
    <ol class="timeline">
{tl}
    </ol>
  </div>
</section>

<section class="section section--alt" id="research" aria-labelledby="research-title">
  <div class="wrap">
    <div class="section-head"><h2 id="research-title">Research and talks</h2><a class="iconlink" href="https://scholar.google.com/citations?user=MxLHgh4AAAAJ">Google Scholar {EXT}</a></div>
    <ol class="list">
      <li class="entry">
        <div class="meta"><span>Co-authored</span><span>MCWASP 2026</span></div>
        <h3>Multi-Modal Investigation of Porosity in Aerospace Investment Casting: from Micrographs and CT-imaging via Simulation to AI Models</h3>
        <p>The full chain behind PorosAI's data: metallography and CT measurement, validated STAR-CCM+ and ProCAST simulation, and an AI surrogate that reproduces the measured porosity distributions.</p>
      </li>
      <li class="entry">
        <div class="meta"><span>Co-authored</span><span>AI4EA workshop, 2025</span></div>
        <h3>Smart Casting: AI-powered Product Quality Optimization with Simulated Data</h3>
        <p>Shows that porosity surrogates can be trained on validated simulation data instead of scarce casting trials, answering in milliseconds instead of 45 minutes per simulation.</p>
      </li>
      <li class="entry">
        <div class="meta"><span>Co-authored</span><span>PhD research</span></div>
        <h3>Diffusion-advection effects in photon-dissociation regions</h3>
        <p>How diffusion and advection change the chemistry of the regions where starlight meets molecular clouds.</p>
      </li>
      <li class="entry">
        <div class="meta"><span>Talk</span></div>
        <h3>Basel Data Science and AI Meetup</h3>
        <p>Physics-informed ML in manufacturing.</p>
      </li>
      <li class="entry">
        <div class="meta"><span>Conference</span><span>EICF 2026, Seville</span></div>
        <h3>PorosAI at the European Investment Casters' Federation</h3>
        <p>PorosAI was presented at the 34th EICF conference in Seville.</p>
      </li>
      <li class="entry">
        <div class="meta"><span>Funding</span></div>
        <h3>Research proposals</h3>
        <p>Co-authored more than seven BMBF and EU research proposals, including consortium coordination. One was approved at EUR 16 million.</p>
      </li>
    </ol>
  </div>
</section>

<section class="section" id="off-the-clock" aria-labelledby="off-title">
  <div class="wrap">
    <div class="section-head"><h2 id="off-title">Off the clock</h2></div>
    <div class="blocks">
      <div class="block"><h3>Astronomy on Tap, Cologne</h3><p>In April 2020 a few of us at the University of Cologne founded the Cologne chapter of Astronomy on Tap: scientists explaining the universe to whoever is in the bar that night.</p></div>
      <div class="block"><h3>German, one verb at a time</h3><p>I keep a public dataset of German verbs on GitHub, because B1 to B2 is a numbers game and I like to see the numbers.</p><p><a class="iconlink" href="https://github.com/aleenababy/german_words">The dataset {EXT}</a></p></div>
    </div>
  </div>
</section>'''
    page("about.html", "About · Dr. Aleena Baby",
         "Dr. Aleena Baby: physicist turned machine learning engineer in Aachen. Journey, research and talks.",
         body, "about.html")


# ============================================================ CONTENT: CV
def build_cv():
    def role(title, org, dates, bullets):
        li = "".join(f"<li>{html.escape(b)}</li>" for b in bullets)
        return f'''      <li class="entry">
        <div class="meta"><span>{dates}</span></div>
        <h3>{html.escape(title)}</h3>
        <p class="muted">{html.escape(org)}</p>
        <ul>{li}</ul>
      </li>'''
    exp = "\n".join([
        role("Applied AI Engineer, lead developer of PorosAI", "ACCESS e.V., Aachen", "01/2025 to present", [
            "Lead developer of PorosAI, a production ML system that predicts porosity defects in aerospace investment casting at the design stage, from idea to first external customer in 18 months.",
            "Built the pipeline that unifies CT inspection data, simulation outputs and experimental measurements into one training set of more than 2.75 million points.",
            "Replaced random splits with grouped holdout at the geometry level, so evaluation matches how the product is used on new designs.",
            "Added calibrated uncertainty to every prediction, and inverse design that turns a target quality into design and process parameters.",
            "Built the production layer: FastAPI, Streamlit, MLflow registry, DVC, Docker, and CI/CD with validation-gated releases.",
            "Cut design-iteration time by around 80 percent, with sub-second inference in place of solver runs of 45 minutes to 24 hours.",
        ]),
        role("Lecturer, Artificial Intelligence and Machine Learning", "Hochschule Fresenius, Cologne", "03/2024 to 03/2026", [
            "Taught Introduction to Python, Business Analytics, and Artificial Intelligence and Machine Learning, and wrote the curriculum for each.",
            "Supervised Master's theses in machine learning from proposal to defence.",
        ]),
        role("Machine Learning Engineer, lead data scientist", "Omdena, remote", "03/2023 to 12/2024", [
            "Led modelling on an AI severe-weather early-warning system for Tanzania, deployed with SMS and WhatsApp alerts.",
            "Led data engineering for a waste-management optimization model on a large international team.",
        ]),
        role("Doctoral Researcher, computational physics", "University of Cologne", "06/2019 to 04/2024", [
            "Built a Fortran solver for more than 1,000 coupled partial differential equations that runs in under two minutes.",
            "Designed the validation suite and validated results against more than 100 observational datasets.",
        ]),
        role("Research Assistant", "Raman Research Institute, Bengaluru", "08/2018 to 04/2019", [
            "Built Python numerical models of spatially distributed systems and wrote three technical reports.",
        ]),
    ])
    body = f'''<section class="section section--tight">
  <div class="wrap">
    <div class="case-head">
      <p class="status-line">CV · Aachen, Germany</p>
      <h1>Dr. Aleena Baby</h1>
      <p class="lead">Machine learning engineer with a PhD in computational physics and seven years of computational modeling, the last three in production ML. EU Blue Card with full work authorization in Germany and France, no sponsorship needed.</p>
      <p class="cv-actions"><a class="btn js-email" href="#" data-subject="CV request">Request the full CV</a><a class="iconlink" href="https://linkedin.com/in/aleena-baby">LinkedIn profile {EXT}</a></p>
    </div>
  </div>
</section>

<section class="section section--alt" aria-labelledby="exp-title">
  <div class="wrap">
    <div class="section-head"><h2 id="exp-title">Experience</h2></div>
    <ol class="list">
{exp}
    </ol>
  </div>
</section>

<section class="section" aria-labelledby="skills-title">
  <div class="wrap">
    <div class="section-head"><h2 id="skills-title">Skills</h2></div>
    <div class="blocks">
      <div class="block"><h3>ML and deep learning</h3><p>Python, PyTorch, XGBoost, scikit-learn, physics-informed ML, uncertainty quantification, PointNet</p></div>
      <div class="block"><h3>MLOps</h3><p>MLflow, DVC, Docker, CI/CD, FastAPI, Streamlit, Git, Linux, AWS</p></div>
      <div class="block"><h3>LLM systems</h3><p>Claude, LLM gateways with fallback, RAG, knowledge graphs, prompt versioning</p></div>
      <div class="block"><h3>Simulation and HPC</h3><p>STAR-CCM+, MAGMASOFT, ProCAST, HPC and SLURM, Fortran, SQL</p></div>
    </div>
  </div>
</section>

<section class="section section--alt" aria-labelledby="edu-title">
  <div class="wrap">
    <div class="section-head"><h2 id="edu-title">Education and languages</h2></div>
    <ol class="timeline">
      <li><time>2024</time><p>PhD, computational physics, University of Cologne</p></li>
      <li><time>2017</time><p>MSc Physics, Gandhigram Rural Institute, Tamil Nadu</p></li>
      <li><time>2015</time><p>BSc Physics, minor in Mathematics and Computer Science, University of Calicut, Kerala</p></li>
      <li><time>Languages</time><p>English C1 · German B1 · Malayalam native · Hindi B2 · Tamil B1 · French A1</p></li>
    </ol>
  </div>
</section>'''
    page("cv.html", "CV · Dr. Aleena Baby",
         "CV of Dr. Aleena Baby, machine learning engineer: experience, skills, education and languages.",
         body, "cv.html")


# ============================================================ CONTENT: BLOG
POSTS = [
    # slug, title, abstract, tags, published, image, row
    ("leakage-grouped-holdout", "The leakage that inflated our early metrics",
     "Random splits put correlated points from the same simulation on both sides of the split. The fix was a grouped holdout at the geometry level. Here is what it changed.",
     ["Physics-informed ML", "MLOps"], False, "foundry", "piml"),
    (None, "Scarce labels: encode the physics, not more capacity",
     "When labelled data is small, adding model capacity overfits. Encoding solidification physics and boundary conditions into the feature space let the models generalize to configurations they never saw.",
     ["Physics-informed ML"], False, "observatory", "piml"),
    (None, "Why every prediction should ship with a calibrated uncertainty",
     "An accept-or-reject decision on a safety-critical part needs a confidence estimate you can defend. Reliability diagrams, calibration, and what \"trustworthy\" means to the engineer who acts on the number.",
     ["Physics-informed ML", "MLOps"], False, "river", "piml"),
    (None, "From 45 minutes to under a second: when a surrogate replaces a solver, and when it must not",
     "Where physics-informed surrogates earn their speed, where extrapolation breaks them, and how held-out evaluation keeps the claim honest.",
     ["Simulation and surrogates"], False, "foundry", "piml"),
    (None, "Validation-gated releases: the model registry is the only path to production",
     "Automated retraining behind validation gates, an MLflow registry, DVC data versioning and CI/CD. Releases block on failing gates, and every deployed model is reproducible end to end.",
     ["MLOps"], False, "network", "sys"),
    (None, "An LLM gateway for a small SaaS: fallback models, credits before calls, prompts per tool",
     "How the tools in Decodex share one gateway that calls Claude with automatic fallback, deducts credits first, versions prompts per tool and logs every request.",
     ["LLM systems"], False, "decodex", "sys"),
    (None, "The physics toolbox in business",
     "Fourier transforms, Monte Carlo, exponential decay, autocorrelation and the Kolmogorov-Smirnov test, and where each one runs in a business stack. The transferable thing is the reflex underneath: distrust averages, think in distributions.",
     ["Field notes"], False, "observatory", "sys"),
    (None, "What a physicist has to unlearn to ship production ML",
     "Field notes from the crossing, written from the practitioner's chair.",
     ["Field notes"], False, "assistant", "sys"),
]

# Set to True to publish the written post page again (it also re-enters the feed and sitemap).
PUBLISH_POSTS = False

ROWS = [("piml", "Physics-informed ML and simulation"), ("sys", "Systems, LLMs and field notes")]


def entry(prefix, slug, title, abstract, tags, live, image=None, row=None):
    tg = "".join(f"<li>{html.escape(t)}</li>" for t in tags)
    if live:
        meta = '<div class="meta"><span><time datetime="2026-10-01">1 October 2026</time></span><span>6 min read</span></div>'
        h = f'<h3><a href="{prefix}{slug}.html">{html.escape(title)}</a></h3>'
        cls = "entry"
    else:
        meta = '<div class="meta"><span class="chip chip--planned">Planned</span></div>'
        h = f"<h3>{html.escape(title)}</h3>"
        cls = "entry entry--planned"
    return f'''      <li class="{cls}">
  {meta}
  {h}
  <p>{html.escape(abstract)}</p>
  <ul class="tags" aria-label="Tags">{tg}</ul>
</li>'''


def post_card(slug, title, abstract, tags, live, image, row):
    badge = '<span class="bc-badge">New</span>' if live else '<span class="bc-badge bc-badge--planned">Planned</span>'
    meta = '<time datetime="2026-10-01">1 October 2026</time> · 6 min read' if live else "Coming soon"
    inner = f'''<figure class="bc-img"><img src="../assets/img/scenes/{image}.webp" width="960" height="720" loading="lazy" decoding="async" alt="">{badge}</figure>
      <div class="bc-body">
        <h3>{html.escape(title)}</h3>
        <p class="bc-tags">{" · ".join(html.escape(t) for t in tags)}</p>
        <p class="bc-meta">{meta}</p>
      </div>'''
    if live:
        return f'<li class="bc-item"><a class="bc-card" href="{slug}.html">{inner}</a></li>'
    return f'<li class="bc-item"><div class="bc-card bc-card--planned" aria-label="Planned post: {html.escape(title)}">{inner}</div></li>'


def carousel_row(key, title):
    items = "\n".join(post_card(*p) for p in POSTS if p[6] == key)
    return f'''<section class="bc-row" aria-labelledby="row-{key}">
  <div class="bc-head">
    <h2 id="row-{key}">{html.escape(title)}</h2>
    <div class="bc-ctrl">
      <button class="bc-btn" type="button" data-dir="-1" aria-controls="track-{key}"><svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M15 6l-6 6 6 6"></path></svg><span class="sr-only">Scroll left</span></button>
      <button class="bc-btn" type="button" data-dir="1" aria-controls="track-{key}"><svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M9 6l6 6-6 6"></path></svg><span class="sr-only">Scroll right</span></button>
    </div>
  </div>
  <ul class="bc-track" id="track-{key}" data-carousel tabindex="0" aria-label="{html.escape(title)}">
{items}
  </ul>
</section>'''


def build_blog():
    rows = "\n".join(carousel_row(k, t) for k, t in ROWS)
    body = f'''<section class="section section--tight">
  <div class="wrap">
    <div class="case-head">
      <p class="status-line">Blog · AI and ML in industry</p>
      <h1>Blog</h1>
      <p class="lead">Engineering write-ups on physics-informed ML, MLOps, simulation surrogates and LLM systems in production.</p>
    </div>
{rows}
    <p class="muted">Longer essays and the career side live on <a href="https://academiatoindustry.substack.com">Substack</a>.</p>
  </div>
</section>
'''
    page("blog/index.html", "Blog · Dr. Aleena Baby",
         "Engineering write-ups by Dr. Aleena Baby on physics-informed ML, MLOps, simulation surrogates and LLM systems in production.",
         body, "blog/index.html")

    if not PUBLISH_POSTS:
        return
    fig = '''<figure class="diagram">
  <svg viewBox="0 0 760 300" role="img" aria-labelledby="fg-t fg-d">
    <title id="fg-t">Random split versus grouped holdout</title>
    <desc id="fg-d">Left: a random split scatters points from the same three simulations into both train and test, so each test point has close neighbours in training. Right: a grouped holdout keeps whole simulations together, so the test set contains only geometries the model has never seen.</desc>
    <style>.a{font:600 15px 'Source Serif 4',serif;fill:#15161d}.m{font:12px 'JetBrains Mono',monospace;fill:#15161d}.bx{fill:#fff;stroke:#15161d;stroke-width:1.2}</style>
    <text class="a" x="20" y="28">Random split</text><text class="a" x="400" y="28">Grouped holdout</text>
    <rect class="bx" x="20" y="44" width="160" height="200" rx="6"/><rect class="bx" x="200" y="44" width="160" height="200" rx="6"/>
    <rect class="bx" x="400" y="44" width="160" height="200" rx="6"/><rect class="bx" x="580" y="44" width="160" height="200" rx="6"/>
    <text class="m" x="100" y="266" text-anchor="middle">TRAIN</text><text class="m" x="280" y="266" text-anchor="middle">TEST</text>
    <text class="m" x="480" y="266" text-anchor="middle">TRAIN</text><text class="m" x="660" y="266" text-anchor="middle">TEST</text>
    <g fill="#7c86dc"><circle cx="50" cy="80" r="7"/><circle cx="90" cy="120" r="7"/><circle cx="140" cy="200" r="7"/><circle cx="230" cy="90" r="7"/><circle cx="320" cy="180" r="7"/><circle cx="440" cy="80" r="7"/><circle cx="480" cy="100" r="7"/><circle cx="520" cy="84" r="7"/></g>
    <g fill="#f7d5b5" stroke="#15161d" stroke-width=".8"><circle cx="70" cy="170" r="7"/><circle cx="150" cy="90" r="7"/><circle cx="260" cy="150" r="7"/><circle cx="300" cy="80" r="7"/><circle cx="440" cy="170" r="7"/><circle cx="490" cy="190" r="7"/><circle cx="530" cy="160" r="7"/></g>
    <g fill="#ef6a2a"><circle cx="110" cy="210" r="7"/><circle cx="240" cy="210" r="7"/><circle cx="330" cy="120" r="7"/><circle cx="620" cy="100" r="7"/><circle cx="660" cy="150" r="7"/><circle cx="700" cy="200" r="7"/><circle cx="640" cy="210" r="7"/></g>
    <text class="m" x="20" y="292">colour = source simulation</text>
  </svg>
  <figcaption>Random split versus grouped holdout, schematic. Colour marks the simulation a point came from.</figcaption>
</figure>'''
    code = '''<pre><code>from sklearn.model_selection import GroupKFold

# one group id per simulated geometry, not per point
cv = GroupKFold(n_splits=5)
for train_idx, test_idx in cv.split(X, y, groups=geometry_id):
    model.fit(X[train_idx], y[train_idx])
    scores.append(model.score(X[test_idx], y[test_idx]))</code></pre>'''
    body = f'''<article>
  <header class="section section--tight">
    <div class="wrap post-head">
      <p class="status-line">Blog · Physics-informed ML · MLOps</p>
      <h1>The leakage that inflated our early metrics</h1>
      <div class="meta"><span><time datetime="2026-10-01">1 October 2026</time></span><span>6 min read</span></div>
      <p class="abstract">Random splits put correlated points from the same simulation on both sides of the split. The fix was a grouped holdout at the geometry level. Here is what it changed.</p>
      <ul class="tags" aria-label="Tags"><li>Physics-informed ML</li><li>MLOps</li></ul>
    </div>
  </header>
  <div class="wrap post-body">
    <h2>The symptom</h2>
    <p>The first metrics on our casting surrogate looked excellent. They looked better than a scarce-label problem on high-variance industrial data should allow, and that was the first sign that something was wrong.</p>
    <h2>The cause</h2>
    <p>More than 2.75 million training points come from far fewer simulations, and points from one simulation are strongly correlated with each other. A random split put points from the same simulation into both the training set and the test set. The model was graded on data it had effectively already seen.</p>
    {fig}
    <h2>The fix</h2>
    <p>I redesigned the evaluation as a grouped holdout at the entity level: whole geometries stay out of training. That is exactly how the model is used, because a new design is a new geometry. The scores dropped to an honest level, and that honest level is the one worth reporting.</p>
    {code}
    <h2>The rule</h2>
    <p>Split the data the way the product will be used. If the production question is a geometry nobody has seen, then the test set must contain only geometries nobody has seen.</p>
    <h2>References</h2>
    <ol class="refs">
      <li>scikit-learn documentation, GroupKFold.</li>
      <li>Kapoor and Narayanan, "Leakage and the reproducibility crisis in machine-learning-based science", Patterns, 2023.</li>
    </ol>
    <div class="author"><img src="../assets/img/aleena.jpg" width="56" height="56" alt=""><p><strong>Dr. Aleena Baby</strong><br>Machine learning engineer, Aachen</p></div>
    <nav class="pager" aria-label="More posts">
      <a href="index.html"><span class="mono">Blog</span>Back to the blog</a>
      <a href="../work.html#porosai"><span class="mono">Related work</span>PorosAI</a>
    </nav>
  </div>
</article>'''
    page("blog/leakage-grouped-holdout.html", "The leakage that inflated our early metrics · Dr. Aleena Baby",
         "Random splits put correlated points from the same simulation on both sides. The fix was a grouped holdout at the geometry level.",
         body, "blog/index.html")


# ============================================================ FEED, SITEMAP, HOME PATCH
def build_feed_sitemap():
    feed = (f'''<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
<title>Dr. Aleena Baby, Blog</title><link>{SITE}blog/</link>
<description>Engineering write-ups on physics-informed ML, MLOps and LLM systems.</description>
{{ITEM}}<item><title>The leakage that inflated our early metrics</title><pubDate>Thu, 01 Oct 2026 08:00:00 +0200</pubDate><link>{SITE}blog/leakage-grouped-holdout.html</link>
<description>Random splits put correlated points from the same simulation on both sides. The fix was a grouped holdout at the geometry level.</description></item>{{END}}
</channel></rss>
''')
    a, b = feed.find("{ITEM}"), feed.find("{END}")
    feed = feed.replace("{ITEM}", "").replace("{END}", "") if PUBLISH_POSTS else feed[:a] + feed[b + len("{END}"):]
    open(os.path.join(ROOT, "feed.xml"), "w", encoding="utf-8").write(feed)
    urls = ["", "about.html", "work.html", "cv.html", "blog/"] + (["blog/leakage-grouped-holdout.html"] if PUBLISH_POSTS else [])
    sm = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + \
        "".join(f"  <url><loc>{SITE}{u}</loc></url>\n" for u in urls) + "</urlset>\n"
    open(os.path.join(ROOT, "sitemap.xml"), "w", encoding="utf-8").write(sm)
    open(os.path.join(ROOT, "robots.txt"), "w", encoding="utf-8").write(f"User-agent: *\nAllow: /\nSitemap: {SITE}sitemap.xml\n")
    print("wrote feed.xml, sitemap.xml, robots.txt")


def patch_home():
    p = os.path.join(ROOT, "index.html")
    t = open(p, encoding="utf-8").read()
    t = re.sub(r'<header class="site-header">.*?</header>', lambda m: header("", "index.html"), t, count=1, flags=re.S)
    t = re.sub(r'<footer class="site-footer">.*?</footer>\s*(</footer>)?', lambda m: footer(""), t, count=1, flags=re.S)
    t = t.replace('href="journey.html">Timeline and field notes', 'href="about.html#journey">Timeline').replace('href="about.html#journey">Timeline and field notes', 'href="about.html#journey">Timeline')
    t = t.replace('href="journey.html"', 'href="about.html"').replace('href="research.html"', 'href="about.html#research"')
    t = t.replace('>All writing <', '>Blog <').replace('>All posts <', '>Blog <')
    open(p, "w", encoding="utf-8").write(t)
    print("patched index.html")


if __name__ == "__main__":
    build_work()
    build_about()
    build_cv()
    build_blog()
    build_feed_sitemap()
    patch_home()
